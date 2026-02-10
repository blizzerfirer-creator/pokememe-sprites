import Phaser from 'phaser';
import FSM from 'phaser3-rex-plugins/plugins/fsm.js';
import type { Player } from './Player';

// FSM for player state management
export class PlayerFSM extends FSM {
  public scene: Phaser.Scene;
  public player: Player;
  
  constructor(scene: Phaser.Scene, player: Player) {
    super({
      extend: {
        eventEmitter: new Phaser.Events.EventEmitter()
      }
    });
    
    this.scene = scene;
    this.player = player;
    
    // Start in idle state
    this.goto('idle');
  }
  
  // Idle state
  enter_idle(): void {
    this.player.setVelocity(0, 0);
    this.player.isMoving = false;
    
    const animKey = this.player.getAnimationKeyForDirection('idle');
    this.player.playAnimation(animKey);
    
    // Notify position change
    this.player.onPositionChange?.(
      this.player.x,
      this.player.y,
      this.player.facingDirection,
      false
    );
  }
  
  update_idle(time: number, delta: number): void {
    const cursors = (this.player as any).cursors as Phaser.Types.Input.Keyboard.CursorKeys;
    if (!cursors) return;
    
    // Check for movement input
    if (cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
      this.goto('walking');
    }
    
    // Check for interaction (space key)
    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      this.player.onInteract?.();
    }
  }
  
  // Walking state
  enter_walking(): void {
    this.player.isMoving = true;
  }
  
  update_walking(time: number, delta: number): void {
    const cursors = (this.player as any).cursors as Phaser.Types.Input.Keyboard.CursorKeys;
    if (!cursors) return;
    
    let velocityX = 0;
    let velocityY = 0;
    let newDirection = this.player.facingDirection;
    
    // Handle movement input
    if (cursors.left.isDown) {
      velocityX = -this.player.walkSpeed;
      newDirection = 'left';
    } else if (cursors.right.isDown) {
      velocityX = this.player.walkSpeed;
      newDirection = 'right';
    }
    
    if (cursors.up.isDown) {
      velocityY = -this.player.walkSpeed;
      newDirection = 'up';
    } else if (cursors.down.isDown) {
      velocityY = this.player.walkSpeed;
      newDirection = 'down';
    }
    
    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
      const normalizer = Math.sqrt(2);
      velocityX /= normalizer;
      velocityY /= normalizer;
    }
    
    // Apply velocity
    this.player.setVelocity(velocityX, velocityY);
    
    // Update direction if changed
    if (newDirection !== this.player.facingDirection) {
      this.player.facingDirection = newDirection;
      const animKey = this.player.getAnimationKeyForDirection('walk');
      this.player.playAnimation(animKey);
    }
    
    // Update flip for side view
    this.player.updateFlip();
    
    // Play walk animation if not already playing
    const currentAnimKey = this.player.anims.currentAnim?.key || '';
    const expectedAnimKey = this.player.getAnimationKeyForDirection('walk');
    if (currentAnimKey !== expectedAnimKey) {
      this.player.playAnimation(expectedAnimKey);
    }
    
    // Notify position change
    this.player.onPositionChange?.(
      this.player.x,
      this.player.y,
      this.player.facingDirection,
      true
    );
    
    // Check if stopped moving
    if (!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown) {
      this.goto('idle');
    }
    
    // Check for interaction (space key)
    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
      this.player.onInteract?.();
    }
  }
}
