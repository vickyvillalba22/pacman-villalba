import { BaseEntity } from '@/entities/BaseEntity';
import type { Level } from '@/map/Level';
import type { Direction, EntityState, Position } from '@/types';

const BODY_RADIUS = 0.4;
const TURN_ALIGNMENT = 0.4;

export class Pacman extends BaseEntity {
  lives: number;
  requestedDirection: Direction;

  private readonly spawnPosition: Position;
  private readonly spawnDirection: Direction;
  private readonly spawnLives: number;

  constructor(
    position: Position,
    direction: Direction,
    private readonly level: Level,
    requestedDirection: Direction = direction,
    lives = 3,
    state: EntityState = 'active',
    speed = 5,
  ) {
    super('pacman', position, direction, state, speed);
    this.requestedDirection = requestedDirection;
    this.lives = lives;
    this.spawnPosition = { x: position.x, y: position.y };
    this.spawnDirection = direction;
    this.spawnLives = lives;
  }

  loseLife(): void {
    if (this.lives > 0) {
      this.lives -= 1;
    }
  }

  respawn(): void {
    this.position = { x: this.spawnPosition.x, y: this.spawnPosition.y };
    this.direction = this.spawnDirection;
    this.requestedDirection = this.spawnDirection;
    this.state = 'active';
  }

  fullRespawn(): void {
    this.respawn();
    this.lives = this.spawnLives;
  }

  override update(deltaTime: number): void {
    if (this.canTurn(this.requestedDirection)) {
      this.direction = this.requestedDirection;
    }
    super.update(deltaTime);
  }

  protected override applyMovement(deltaTime: number): void {
    const next = this.nextPosition(deltaTime);
    if (!this.isLeadingEdgeWalkable(next)) {
      this.snapToWall();
      return;
    }
    super.applyMovement(deltaTime);
  }

  private isLeadingEdgeWalkable(next: Position): boolean {
    const delta = this.directionVector(this.direction);
    const edge = {
      x: next.x + delta.x * BODY_RADIUS,
      y: next.y + delta.y * BODY_RADIUS,
    };
    return this.level.isWalkable(this.cellOf(edge));
  }

  private canTurn(direction: Direction): boolean {
    const delta = this.directionVector(direction);
    const cell = {
      x: Math.floor(this.position.x) + delta.x,
      y: Math.floor(this.position.y) + delta.y,
    };
    if (!this.level.isWalkable(cell)) return false;
    if (direction === 'up' || direction === 'down') {
      return Math.abs(this.position.x - (Math.floor(this.position.x) + 0.5)) <= TURN_ALIGNMENT;
    }
    return Math.abs(this.position.y - (Math.floor(this.position.y) + 0.5)) <= TURN_ALIGNMENT;
  }

  private snapToWall(): void {
    const epsilon = 1e-6;
    switch (this.direction) {
      case 'up':
        this.position.y = Math.floor(this.position.y) + BODY_RADIUS + epsilon;
        break;
      case 'down':
        this.position.y = Math.floor(this.position.y) + 1 - BODY_RADIUS - epsilon;
        break;
      case 'left':
        this.position.x = Math.floor(this.position.x) + BODY_RADIUS + epsilon;
        break;
      case 'right':
        this.position.x = Math.floor(this.position.x) + 1 - BODY_RADIUS - epsilon;
        break;
    }
  }
}
