import Phaser from 'phaser';
import * as utils from '../utils';
import { PlayerFSM } from './PlayerFSM';

type Direction = 'left' | 'right' | 'up' | 'down';

// Main player class for the trainer
export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  
  // State machine
  public fsm: PlayerFSM;
  
  // Movement properties
  public facingDirection: Direction = 'down';
  public walkSpeed: number = 160;
  public isMoving: boolean = false;
  
  // Player info
  public username: string = '';
  public playerId: string = '';
  
  // Name tag
  public nameTag: Phaser.GameObjects.Text | null = null;
  
  // Position tracking for database sync
  private lastSyncX: number = 0;
  private lastSyncY: number = 0;
  private syncTimer: number = 0;
  private syncInterval: number = 2000; // Sync to DB every 2 seconds
  
  // Callbacks
  public onPositionChange: ((x: number, y: number, direction: string, isMoving: boolean) => void) | null = null;
  public onInteract: (() => void) | null = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number, username: string = '', playerId: string = '') {
    super(scene, x, y, 'meme_trainer_idle_front_frame1');
    
    this.username = username;
    this.playerId = playerId;
    
    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Initialize scale and size
    utils.initScale(this, { x: 0.5, y: 1.0 }, undefined, 80, 0.4, 0.6);
    
    // Create name tag
    this.createNameTag();
    
    // Initialize FSM
    this.fsm = new PlayerFSM(scene, this);
    
    // Store initial position
    this.lastSyncX = x;
    this.lastSyncY = y;
  }
  
  private createNameTag(): void {
    if (!this.username) return;
    
    this.nameTag = this.scene.add.text(this.x, this.y - 50, this.username, {
      fontFamily: 'RetroPixel',
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 1);
  }
  
  public playAnimation(animKey: string): void {
    if (!this.anims.animationManager.exists(animKey)) {
      console.warn(`Animation ${animKey} does not exist`);
      return;
    }
    this.play(animKey, true);
    utils.resetOriginAndOffset(this, this.facingDirection);
  }
  
  public update(time: number, delta: number, cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    if (!this.body || !this.active) return;
    
    // Store cursors for FSM
    (this as any).cursors = cursors;
    
    // Update FSM
    this.fsm.update(time, delta);
    
    // Update name tag position
    if (this.nameTag) {
      this.nameTag.setPosition(this.x, this.y - this.displayHeight - 5);
      this.nameTag.setDepth(this.depth + 1);
    }
    
    // Check for position sync
    this.syncTimer += delta;
    if (this.syncTimer >= this.syncInterval) {
      this.syncTimer = 0;
      
      const distMoved = Math.abs(this.x - this.lastSyncX) + Math.abs(this.y - this.lastSyncY);
      if (distMoved > 5) {
        this.lastSyncX = this.x;
        this.lastSyncY = this.y;
        // Trigger database sync callback
      }
    }
    
    // Update depth based on Y position (for top-down sorting)
    this.setDepth(this.y);
  }
  
  public getAnimationKeyForDirection(baseAnim: string): string {
    switch (this.facingDirection) {
      case 'up':
        return `meme_trainer_${baseAnim}_back`;
      case 'down':
        return `meme_trainer_${baseAnim}_front`;
      case 'left':
      case 'right':
        return `meme_trainer_${baseAnim}_R`;
    }
  }
  
  public updateFlip(): void {
    // In top-down view, flip for left direction on side animations
    this.setFlipX(this.facingDirection === 'left');
  }
  
  public destroy(fromScene?: boolean): void {
    if (this.nameTag) {
      this.nameTag.destroy();
      this.nameTag = null;
    }
    super.destroy(fromScene);
  }
}

// Other player class (remote players synced via real-time)
export class OtherPlayer extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  
  public playerId: string;
  public username: string;
  public facingDirection: Direction = 'down';
  public isMoving: boolean = false;
  
  // Name tag
  public nameTag: Phaser.GameObjects.Text | null = null;
  
  // Target position for interpolation
  private targetX: number = 0;
  private targetY: number = 0;
  private lerpSpeed: number = 0.2;
  
  constructor(scene: Phaser.Scene, x: number, y: number, playerId: string, username: string) {
    super(scene, x, y, 'meme_trainer_idle_front_frame1');
    
    this.playerId = playerId;
    this.username = username;
    this.targetX = x;
    this.targetY = y;
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Initialize scale
    utils.initScale(this, { x: 0.5, y: 1.0 }, undefined, 80, 0.4, 0.6);
    
    // Create name tag
    this.createNameTag();
    
    // Play idle animation
    this.playIdleAnimation();
  }
  
  private createNameTag(): void {
    this.nameTag = this.scene.add.text(this.x, this.y - 50, this.username, {
      fontFamily: 'RetroPixel',
      fontSize: '14px',
      color: '#ffff00', // Yellow for other players
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 1);
  }
  
  public updateFromServer(x: number, y: number, facingDirection: string, isMoving: boolean): void {
    this.targetX = x;
    this.targetY = y;
    this.facingDirection = facingDirection as Direction;
    this.isMoving = isMoving;
    
    if (isMoving) {
      this.playWalkAnimation();
    } else {
      this.playIdleAnimation();
    }
  }
  
  private playIdleAnimation(): void {
    const animKey = this.getAnimationKey('idle');
    if (this.scene.anims.exists(animKey)) {
      this.play(animKey, true);
      this.setFlipX(this.facingDirection === 'left');
    }
  }
  
  private playWalkAnimation(): void {
    const animKey = this.getAnimationKey('walk');
    if (this.scene.anims.exists(animKey)) {
      this.play(animKey, true);
      this.setFlipX(this.facingDirection === 'left');
    }
  }
  
  private getAnimationKey(baseAnim: string): string {
    switch (this.facingDirection) {
      case 'up':
        return `meme_trainer_${baseAnim}_back`;
      case 'down':
        return `meme_trainer_${baseAnim}_front`;
      case 'left':
      case 'right':
        return `meme_trainer_${baseAnim}_R`;
    }
  }
  
  public update(time: number, delta: number): void {
    // Interpolate position for smooth movement
    this.x = Phaser.Math.Linear(this.x, this.targetX, this.lerpSpeed);
    this.y = Phaser.Math.Linear(this.y, this.targetY, this.lerpSpeed);
    
    // Update name tag
    if (this.nameTag) {
      this.nameTag.setPosition(this.x, this.y - this.displayHeight - 5);
      this.nameTag.setDepth(this.depth + 1);
    }
    
    // Update depth for Y-sorting
    this.setDepth(this.y);
  }
  
  public destroy(fromScene?: boolean): void {
    if (this.nameTag) {
      this.nameTag.destroy();
      this.nameTag = null;
    }
    super.destroy(fromScene);
  }
}
