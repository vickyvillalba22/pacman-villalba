import type { GameEntity } from '@/entities/GameEntity';
import type { Direction, EntityState, EntityType, Position, Vector2 } from '@/types';

const DIRECTION_DELTAS: Record<Direction, Vector2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export abstract class BaseEntity implements GameEntity {
  readonly type: EntityType;
  position: Position;
  direction: Direction;
  state: EntityState;
  speed: number;

  constructor(
    type: EntityType,
    position: Position,
    direction: Direction,
    state: EntityState,
    speed = 0,
  ) {
    this.type = type;
    this.position = position;
    this.direction = direction;
    this.state = state;
    this.speed = speed;
  }

  update(deltaTime: number): void {
    if (this.state !== 'active' || this.speed === 0) return;
    this.applyMovement(deltaTime);
  }

  protected applyMovement(deltaTime: number): void {
    const next = this.nextPosition(deltaTime);
    this.position.x = next.x;
    this.position.y = next.y;
  }

  protected nextPosition(deltaTime: number): Position {
    return this.nextPositionIn(this.direction, deltaTime);
  }

  protected nextPositionIn(direction: Direction, deltaTime: number): Position {
    const delta = DIRECTION_DELTAS[direction];
    return {
      x: this.position.x + delta.x * this.speed * deltaTime,
      y: this.position.y + delta.y * this.speed * deltaTime,
    };
  }

  protected directionVector(direction: Direction): Vector2 {
    return DIRECTION_DELTAS[direction];
  }

  protected cellOf(position: Position): Position {
    return { x: Math.floor(position.x), y: Math.floor(position.y) };
  }

  get cell(): Position {
    return this.cellOf(this.position);
  }
}
