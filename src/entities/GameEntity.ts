import type { Direction, EntityState, EntityType, Position } from '@/types';

export interface GameEntity {
  readonly type: EntityType;
  position: Position;
  direction: Direction;
  state: EntityState;
  update(deltaTime: number): void;
}
