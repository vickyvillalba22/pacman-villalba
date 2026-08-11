import { BaseEntity } from '@/entities/BaseEntity';
import type { Level } from '@/map/Level';
import type { Direction, EntityState, GhostType, Position } from '@/types';

const TURN_PRIORITY: Direction[] = ['up', 'left', 'down', 'right'];

export class Ghost extends BaseEntity {
  readonly ghostType: GhostType;

  constructor(
    position: Position,
    direction: Direction,
    ghostType: GhostType,
    private readonly level: Level,
    state: EntityState = 'active',
    speed = 4,
  ) {
    super('ghost', position, direction, state, speed);
    this.ghostType = ghostType;
  }

  override update(deltaTime: number): void {
    if (!this.isWalkableIn(this.direction)) {
      this.direction = this.chooseDirection();
    }
    super.update(deltaTime);
  }

  protected override applyMovement(deltaTime: number): void {
    const next = this.nextPosition(deltaTime);
    if (!this.level.isWalkable(this.cellOf(next))) {
      return;
    }
    super.applyMovement(deltaTime);
  }

  private isWalkableIn(direction: Direction): boolean {
    const cell = this.cellOf(this.position);
    const delta = this.directionVector(direction);
    return this.level.isWalkable({ x: cell.x + delta.x, y: cell.y + delta.y });
  }

  private chooseDirection(): Direction {
    const reverse = this.oppositeOf(this.direction);
    const alternatives = TURN_PRIORITY.filter(
      (direction) => direction !== reverse && this.isWalkableIn(direction),
    );
    if (alternatives.length > 0) {
      return alternatives[0];
    }
    const fallback = TURN_PRIORITY.find((direction) => this.isWalkableIn(direction));
    return fallback ?? this.direction;
  }

  private oppositeOf(direction: Direction): Direction {
    switch (direction) {
      case 'up':
        return 'down';
      case 'down':
        return 'up';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
    }
  }
}
