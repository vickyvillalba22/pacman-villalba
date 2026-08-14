import { BaseEntity } from '@/entities/BaseEntity';
import type { Level } from '@/map/Level';
import type { Direction, EntityState, GhostType, Position } from '@/types';

const TURN_PRIORITY: Direction[] = ['up', 'left', 'down', 'right'];

export class Ghost extends BaseEntity {
  readonly ghostType: GhostType;

  private readonly spawnPosition: Position;
  private readonly spawnDirection: Direction;

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
    this.spawnPosition = { x: position.x, y: position.y };
    this.spawnDirection = direction;
  }

  respawn(): void {
    this.position = { x: this.spawnPosition.x, y: this.spawnPosition.y };
    this.direction = this.spawnDirection;
    this.state = 'active';
  }

  setFrightened(): void {
    this.state = 'frightened';
  }

  setActive(): void {
    this.state = 'active';
  }

  setInactive(): void {
    this.state = 'inactive';
  }

  private isCentered(): boolean {
    return (
      this.position.x === Math.floor(this.position.x) &&
      this.position.y === Math.floor(this.position.y)
    );
  }

  private isNextCellIntersection(): boolean {
    const reverse = this.oppositeOf(this.direction);
    let walkableCount = 0;
    for (const dir of TURN_PRIORITY) {
      if (dir !== reverse && this.isWalkableIn(dir)) {
        walkableCount++;
      }
    }
    return walkableCount > 1;
  }

  private _lastIntersectionCell: Position | null = null;

  override update(deltaTime: number, pacmanPosition?: Position): void {
    if (this.isCentered() && this.isNextCellIntersection()) {
      const cell = this.cellOf(this.position);
      if (
        !this._lastIntersectionCell ||
        cell.x !== this._lastIntersectionCell.x ||
        cell.y !== this._lastIntersectionCell.y
      ) {
        this._lastIntersectionCell = { x: cell.x, y: cell.y };
        this.direction = this.chooseDirection(pacmanPosition);
      }
    } else if (!this.isWalkableIn(this.direction)) {
      this.direction = this.chooseDirection(pacmanPosition);
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

  private chooseDirection(pacmanPosition?: Position): Direction {
    if (this.state === 'frightened' && pacmanPosition) {
      return this.chooseFrightenedDirection(pacmanPosition);
    }

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

  private chooseFrightenedDirection(pacmanPosition: Position): Direction {
    const candidates = TURN_PRIORITY.filter((direction) => this.isWalkableIn(direction));
    if (candidates.length === 0) {
      return this.direction;
    }

    let best = candidates[0];
    let bestDistance = this.distanceFrom(pacmanPosition, best);
    for (let i = 1; i < candidates.length; i++) {
      const distance = this.distanceFrom(pacmanPosition, candidates[i]);
      if (distance > bestDistance) {
        best = candidates[i];
        bestDistance = distance;
      }
    }
    return best;
  }

  private distanceFrom(pacmanPosition: Position, direction: Direction): number {
    const cell = this.cellOf(this.position);
    const delta = this.directionVector(direction);
    const candidate = { x: cell.x + delta.x, y: cell.y + delta.y };
    const pacmanCell = this.cellOf(pacmanPosition);
    return Math.abs(candidate.x - pacmanCell.x) + Math.abs(candidate.y - pacmanCell.y);
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
