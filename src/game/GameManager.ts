import { supabase, getCurrentUser, isSupabaseConfigured } from '../lib/supabase';
import type { PlayerPresence } from '../types/database';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as localStore from '../lib/localStorage';

// Singleton Game Manager for handling global game state and multiplayer sync
export class GameManager {
  private static instance: GameManager;
  
  // Player data
  public playerId: string | null = null;
  public username: string = '';
  public playerData: any = null;
  
  // Offline mode flag
  public isOfflineMode: boolean = false;
  
  // Real-time channels
  private presenceChannel: RealtimeChannel | null = null;
  private chatChannel: RealtimeChannel | null = null;
  private battleChannel: RealtimeChannel | null = null;
  
  // Other players in the world
  public otherPlayers: Map<string, PlayerPresence> = new Map();
  
  // Event callbacks
  private onPlayerJoin: ((player: PlayerPresence) => void) | null = null;
  private onPlayerLeave: ((playerId: string) => void) | null = null;
  private onPlayerMove: ((player: PlayerPresence) => void) | null = null;
  private onChatMessage: ((message: any) => void) | null = null;
  private onBattleRequest: ((request: any) => void) | null = null;
  private onTradeRequest: ((request: any) => void) | null = null;
  
  private constructor() {}
  
  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }
  
  // Initialize game manager with authenticated user
  public async initialize(): Promise<boolean> {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase is not configured. Multiplayer features will be unavailable.');
      return false;
    }
    
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.log('No authenticated user found');
        return false;
      }
      
      this.playerId = user.id;
      
      // Fetch or create player profile
      await this.fetchOrCreatePlayerProfile();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize GameManager:', error);
      return false;
    }
  }
  
  // Fetch existing profile or create new one
  private async fetchOrCreatePlayerProfile(): Promise<void> {
    if (!this.playerId) return;
    
    // Try to fetch existing profile
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', this.playerId)
      .single();
    
    if (existingPlayer) {
      this.playerData = existingPlayer;
      this.username = existingPlayer.username;
      return;
    }
    
    // Profile doesn't exist, will be created after username selection
    console.log('No player profile found, needs to be created');
  }
  
  // Create new player profile
  public async createPlayerProfile(username: string, starterPokememeId: number): Promise<boolean> {
    if (!this.playerId) return false;
    
    try {
      // Create player profile
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          user_id: this.playerId,
          username: username,
          avatar: 'default',
          position_x: 15 * 64, // Starting position in Satoshi Town
          position_y: 15 * 64,
          current_map: 'satoshi_town',
          meme_coins: 1000 // Starting coins
        })
        .select()
        .single();
      
      if (playerError) throw playerError;
      if (!player) throw new Error('Player creation failed');
      
      this.playerData = player;
      this.username = username;
      
      // Give starter PokeMeme
      const starterStats = this.getStarterStats(starterPokememeId);
      const { error: pokememeError } = await supabase
        .from('pokememes')
        .insert({
          player_id: player.id,
          pokememe_id: starterPokememeId,
          level: 5,
          hp: starterStats.hp,
          current_hp: starterStats.hp,
          attack: starterStats.attack,
          defense: starterStats.defense,
          sp_attack: starterStats.spAttack,
          sp_defense: starterStats.spDefense,
          speed: starterStats.speed,
          move1: starterStats.move1,
          is_in_party: true,
          party_slot: 0
        });
      
      if (pokememeError) throw pokememeError;
      
      // Initialize MemeDex with starter seen/caught
      const { error: dexError } = await supabase
        .from('memedex')
        .insert({
          player_id: player.id,
          pokememe_id: starterPokememeId,
          caught: true,
          seen: true
        });
      
      if (dexError) throw dexError;
      
      // Give starting items
      const startingItems = [
        { item_id: 'cryptosphere', quantity: 10 },
        { item_id: 'potion', quantity: 5 }
      ];
      
      for (const item of startingItems) {
        await supabase.from('inventory').insert({
          player_id: player.id,
          item_id: item.item_id,
          quantity: item.quantity
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to create player profile:', error);
      return false;
    }
  }
  
  private getStarterStats(pokememeId: number) {
    // Base stats at level 5
    const starters: Record<number, any> = {
      1: { hp: 25, attack: 25, defense: 25, spAttack: 32, spDefense: 32, speed: 22, move1: 'Tackle' },
      4: { hp: 22, attack: 26, defense: 22, spAttack: 30, spDefense: 25, speed: 32, move1: 'Scratch' },
      7: { hp: 24, attack: 24, defense: 32, spAttack: 25, spDefense: 32, speed: 22, move1: 'Tackle' }
    };
    return starters[pokememeId] || starters[1];
  }
  
  // Join a map and subscribe to real-time updates
  public async joinMap(mapId: string): Promise<void> {
    // Leave current map first
    await this.leaveCurrentMap();
    
    // Join presence channel for this map
    this.presenceChannel = supabase.channel(`map:${mapId}`, {
      config: {
        presence: { key: this.playerId || 'anonymous' }
      }
    });
    
    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = this.presenceChannel?.presenceState() || {};
        this.otherPlayers.clear();
        
        Object.keys(state).forEach(key => {
          if (key !== this.playerId) {
            const presences = state[key] as any[];
            if (presences.length > 0) {
              this.otherPlayers.set(key, presences[0] as PlayerPresence);
            }
          }
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== this.playerId && newPresences.length > 0) {
          const player = newPresences[0] as unknown as PlayerPresence;
          this.otherPlayers.set(key, player);
          this.onPlayerJoin?.(player);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key !== this.playerId) {
          this.otherPlayers.delete(key);
          this.onPlayerLeave?.(key);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && this.playerData) {
          await this.presenceChannel?.track({
            id: this.playerId,
            username: this.username,
            x: this.playerData.position_x,
            y: this.playerData.position_y,
            facingDirection: this.playerData.facing_direction || 'down',
            currentMap: mapId,
            isMoving: false,
            avatar: this.playerData.avatar
          } as PlayerPresence);
        }
      });
    
    // Join chat channel for this map
    this.chatChannel = supabase.channel(`chat:${mapId}`)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        this.onChatMessage?.(payload);
      })
      .subscribe();
  }
  
  // Leave current map
  public async leaveCurrentMap(): Promise<void> {
    if (this.presenceChannel) {
      await this.presenceChannel.untrack();
      await this.presenceChannel.unsubscribe();
      this.presenceChannel = null;
    }
    
    if (this.chatChannel) {
      await this.chatChannel.unsubscribe();
      this.chatChannel = null;
    }
    
    this.otherPlayers.clear();
  }
  
  // Update player position in real-time
  public async updatePosition(x: number, y: number, facingDirection: string, isMoving: boolean): Promise<void> {
    if (!this.presenceChannel || !this.playerId) return;
    
    await this.presenceChannel.track({
      id: this.playerId,
      username: this.username,
      x,
      y,
      facingDirection,
      currentMap: this.playerData?.current_map || 'satoshi_town',
      isMoving,
      avatar: this.playerData?.avatar || 'default'
    } as PlayerPresence);
  }
  
  // Save position to database
  public async savePositionToDatabase(x: number, y: number, facingDirection: string): Promise<void> {
    if (!this.playerData?.id) return;
    
    await supabase
      .from('players')
      .update({
        position_x: x,
        position_y: y,
        facing_direction: facingDirection
      })
      .eq('id', this.playerData.id);
  }
  
  // Send chat message
  public async sendChatMessage(message: string): Promise<void> {
    if (!this.chatChannel || !this.playerId) return;
    
    const chatMessage = {
      playerId: this.playerId,
      username: this.username,
      message,
      timestamp: new Date().toISOString()
    };
    
    await this.chatChannel.send({
      type: 'broadcast',
      event: 'message',
      payload: chatMessage
    });
    
    // Also save to database
    await supabase.from('chat_messages').insert({
      player_id: this.playerId,
      username: this.username,
      message,
      map_id: this.playerData?.current_map || 'satoshi_town'
    });
  }
  
  // Send battle request to another player
  public async sendBattleRequest(targetPlayerId: string): Promise<boolean> {
    if (!this.playerId) return false;
    
    try {
      const { error } = await supabase
        .from('battle_requests')
        .insert({
          challenger_id: this.playerId,
          defender_id: targetPlayerId,
          status: 'pending'
        });
      
      return !error;
    } catch {
      return false;
    }
  }
  
  // Send trade request
  public async sendTradeRequest(targetPlayerId: string): Promise<boolean> {
    if (!this.playerId) return false;
    
    try {
      const { error } = await supabase
        .from('trade_requests')
        .insert({
          sender_id: this.playerId,
          receiver_id: targetPlayerId,
          status: 'pending'
        });
      
      return !error;
    } catch {
      return false;
    }
  }
  
  // Get player's party PokeMemes
  public async getParty(): Promise<any[]> {
    if (!this.playerData?.id) return [];
    
    const { data } = await supabase
      .from('pokememes')
      .select('*')
      .eq('player_id', this.playerData.id)
      .eq('is_in_party', true)
      .order('party_slot', { ascending: true });
    
    return data || [];
  }
  
  // Get player's inventory
  public async getInventory(): Promise<any[]> {
    if (!this.playerData?.id) return [];
    
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('player_id', this.playerData.id);
    
    return data || [];
  }
  
  // Get MemeDex progress
  public async getMemeDex(): Promise<any[]> {
    if (!this.playerData?.id) return [];
    
    const { data } = await supabase
      .from('memedex')
      .select('*')
      .eq('player_id', this.playerData.id);
    
    return data || [];
  }
  
  // Get leaderboard
  public async getLeaderboard(limit: number = 100): Promise<any[]> {
    const { data } = await supabase
      .from('players')
      .select('username, wins, losses, rank')
      .order('wins', { ascending: false })
      .limit(limit);
    
    return data || [];
  }
  
  // Set event callbacks
  public setOnPlayerJoin(callback: (player: PlayerPresence) => void): void {
    this.onPlayerJoin = callback;
  }
  
  public setOnPlayerLeave(callback: (playerId: string) => void): void {
    this.onPlayerLeave = callback;
  }
  
  public setOnPlayerMove(callback: (player: PlayerPresence) => void): void {
    this.onPlayerMove = callback;
  }
  
  public setOnChatMessage(callback: (message: any) => void): void {
    this.onChatMessage = callback;
  }
  
  public setOnBattleRequest(callback: (request: any) => void): void {
    this.onBattleRequest = callback;
  }
  
  public setOnTradeRequest(callback: (request: any) => void): void {
    this.onTradeRequest = callback;
  }
  
  // Cleanup on logout
  public async cleanup(): Promise<void> {
    await this.leaveCurrentMap();
    this.playerId = null;
    this.username = '';
    this.playerData = null;
    this.isOfflineMode = false;
  }
  
  // Initialize offline/guest mode
  public initializeOffline(playerData: localStore.LocalPlayerData): void {
    this.isOfflineMode = true;
    this.playerId = playerData.id;
    this.username = playerData.username;
    this.playerData = playerData;
    console.log('Initialized offline mode for guest:', this.username);
  }
  
  // Check if there's existing guest data to restore
  public checkExistingGuestData(): boolean {
    return localStore.hasExistingGuestData();
  }
  
  // Restore existing guest session
  public restoreGuestSession(): boolean {
    const playerData = localStore.getLocalPlayerData();
    if (playerData && localStore.isGuestPlayer()) {
      this.initializeOffline(playerData);
      return true;
    }
    return false;
  }
  
  // Create guest profile locally
  public createGuestProfile(username: string, starterPokememeId: number): boolean {
    try {
      const playerData = localStore.createGuestProfile(username, starterPokememeId);
      this.initializeOffline(playerData);
      return true;
    } catch (error) {
      console.error('Failed to create guest profile:', error);
      return false;
    }
  }
  
  // Save position locally for offline mode
  public savePositionLocally(x: number, y: number, facingDirection: string): void {
    if (!this.isOfflineMode) return;
    
    localStore.updateLocalPlayerData({
      position_x: x,
      position_y: y,
      facing_direction: facingDirection
    });
    
    // Also update in-memory data
    if (this.playerData) {
      this.playerData.position_x = x;
      this.playerData.position_y = y;
      this.playerData.facing_direction = facingDirection;
    }
  }
  
  // Get party for offline mode
  public getPartyOffline(): any[] {
    return localStore.getLocalParty();
  }
  
  // Get inventory for offline mode
  public getInventoryOffline(): any[] {
    return localStore.getLocalInventory();
  }
  
  // Get MemeDex for offline mode
  public getMemeDexOffline(): any[] {
    return localStore.getLocalMemeDex();
  }
  
  // Combined methods that work for both modes
  public async getPartyUniversal(): Promise<any[]> {
    if (this.isOfflineMode) {
      return this.getPartyOffline();
    }
    return this.getParty();
  }
  
  public async getInventoryUniversal(): Promise<any[]> {
    if (this.isOfflineMode) {
      return this.getInventoryOffline();
    }
    return this.getInventory();
  }
  
  public async getMemeDexUniversal(): Promise<any[]> {
    if (this.isOfflineMode) {
      return this.getMemeDexOffline();
    }
    return this.getMemeDex();
  }
  
  // Save position (works for both modes)
  public async savePositionUniversal(x: number, y: number, facingDirection: string): Promise<void> {
    if (this.isOfflineMode) {
      this.savePositionLocally(x, y, facingDirection);
    } else {
      await this.savePositionToDatabase(x, y, facingDirection);
    }
  }
  
  // Cleanup guest data
  public clearGuestData(): void {
    localStore.clearLocalData();
  }
}
