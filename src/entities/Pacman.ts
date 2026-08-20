import { BaseEntity } from '@/entities/BaseEntity';
import type { Level } from '@/map/Level';
import type { Direction, EntityState, Position } from '@/types';

const BODY_RADIUS = 0.4;
const TURN_ALIGNMENT = 0.4;
const WALL_CLEARANCE = 0.01;
const COLLISION_EPSILON = 1e-6;

export class Pacman extends BaseEntity {
  lives: number;
  requestedDirection: Direction | undefined;

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
    if (!this.requestedDirection) return;

    if (this.canTurn(this.requestedDirection)) {
      this.direction = this.requestedDirection;
    }
    super.update(deltaTime);
  }

  protected override applyMovement(deltaTime: number): void {
    const distance = this.speed * deltaTime;
    if (distance <= 0) return;

    const target = this.nextPosition(deltaTime);
    if (this.isPositionWalkable(target)) {
      this.position = target;
      return;
    }

    PacmanDiagnostics.recordMoveBlocked(this.position, target, this.direction, this.cell, this.speed, deltaTime);

    // Find the last non-colliding point so the result does not depend on FPS.
    let safeDistance = 0;
    let blockedDistance = distance;
    for (let iteration = 0; iteration < 20; iteration++) {
      const candidateDistance = (safeDistance + blockedDistance) / 2;
      const candidate = this.nextPositionIn(this.direction, candidateDistance / this.speed);
      if (this.isPositionWalkable(candidate)) {
        safeDistance = candidateDistance;
      } else {
        blockedDistance = candidateDistance;
      }
    }

    this.position = this.nextPositionIn(this.direction, safeDistance / this.speed);
  }

  private canTurn(direction: Direction): boolean {
    const delta = this.directionVector(direction);
    const cell = {
      x: Math.floor(this.position.x) + delta.x,
      y: Math.floor(this.position.y) + delta.y,
    };
    if (!this.isTraversable(cell)) {
      PacmanDiagnostics.recordTurnRejected(this.position, direction, this.cell, cell, false, 0, 'destination_wall');
      return false;
    }
    let alignment: number;
    if (direction === 'up' || direction === 'down') {
      alignment = Math.abs(this.position.x - (Math.floor(this.position.x) + 0.5));
    } else {
      alignment = Math.abs(this.position.y - (Math.floor(this.position.y) + 0.5));
    }
    if (alignment > TURN_ALIGNMENT) {
      PacmanDiagnostics.recordTurnRejected(this.position, direction, this.cell, cell, true, alignment, 'alignment');
      return false;
    }
    return true;
  }

  private isPositionWalkable(position: Position): boolean {
    const minimumX = Math.floor(position.x - BODY_RADIUS) - 1;
    const maximumX = Math.floor(position.x + BODY_RADIUS) + 1;
    const minimumY = Math.floor(position.y - BODY_RADIUS) - 1;
    const maximumY = Math.floor(position.y + BODY_RADIUS) + 1;
    const collisionRadius = BODY_RADIUS + WALL_CLEARANCE;
    const radiusSquared = (collisionRadius + COLLISION_EPSILON) ** 2;

    for (let y = minimumY; y <= maximumY; y++) {
      for (let x = minimumX; x <= maximumX; x++) {
        if (!this.isWall({ x, y })) continue;

        const closestX = Math.max(x, Math.min(position.x, x + 1));
        const closestY = Math.max(y, Math.min(position.y, y + 1));
        const distanceX = position.x - closestX;
        const distanceY = position.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        if (distanceSquared < radiusSquared) {
          PacmanDiagnostics.recordCollision(this.position, position, { x, y }, { closestX, closestY }, distanceSquared, radiusSquared, collisionRadius);
          return false;
        }
      }
    }

    return true;
  }

  private isWall(position: Position): boolean {
    const { width, height } = this.level.size;
    if (position.x < 0 || position.y < 0 || position.x >= width || position.y >= height) {
      return false;
    }
    return !this.level.isWalkable(position);
  }

  private isTraversable(position: Position): boolean {
    return !this.isWall(position);
  }
}

class PacmanDiagnostics {
  private static readonly INTERVAL_MS = 500;
  private static lastMoveLog = 0;
  private static lastTurnLog = 0;
  private static lastCollisionKey = '';
  private static lastCollisionTime = 0;
  private static readonly COLLISION_THROTTLE_MS = 500;

  static recordMoveBlocked(
    currentPos: Position,
    targetPos: Position,
    direction: Direction,
    currentCell: Position,
    speed: number,
    deltaTime: number,
  ): void {
    const now = Date.now();
    if (now - this.lastMoveLog < this.INTERVAL_MS) return;
    this.lastMoveLog = now;

    console.group('🚫 MOVE BLOCKED');
    console.log('currentPosition:', { x: currentPos.x.toFixed(3), y: currentPos.y.toFixed(3) });
    console.log('nextPosition:', { x: targetPos.x.toFixed(3), y: targetPos.y.toFixed(3) });
    console.log('direction:', direction);
    console.log('currentCell:', currentCell);
    console.log(`speed: ${speed}, deltaTime: ${deltaTime.toFixed(4)}`);
    console.log('BODY_RADIUS:', BODY_RADIUS, 'WALL_CLEARANCE:', WALL_CLEARANCE);
    console.log('collisionRadius:', (BODY_RADIUS + WALL_CLEARANCE).toFixed(3));
    console.groupEnd();
  }

  static recordTurnRejected(
    currentPos: Position,
    requestedDir: Direction,
    currentCell: Position,
    targetCell: Position,
    destinationWalkable: boolean,
    alignment: number,
    reason: 'destination_wall' | 'alignment',
  ): void {
    const now = Date.now();
    if (now - this.lastTurnLog < this.INTERVAL_MS) return;
    this.lastTurnLog = now;

    console.group('🔄 TURN REJECTED');
    console.log('position:', { x: currentPos.x.toFixed(3), y: currentPos.y.toFixed(3) });
    console.log('requestedDirection:', requestedDir);
    console.log('currentCell:', currentCell);
    console.log('targetCell:', targetCell);
    console.log('destinationWalkable:', destinationWalkable);
    console.log('alignment:', alignment.toFixed(4));
    console.log('TURN_ALIGNMENT:', TURN_ALIGNMENT);
    console.log('reason:', reason === 'destination_wall' ? 'destination_wall' : 'alignment');
    console.groupEnd();
  }

  static recordCollision(
    currentPos: Position,
    targetPos: Position,
    wallCell: Position,
    closestPoint: { closestX: number; closestY: number },
    distanceSquared: number,
    radiusSquared: number,
    collisionRadius: number,
  ): void {
    const key = `${wallCell.x},${wallCell.y}`;
    const now = Date.now();
    if (key === this.lastCollisionKey && now - this.lastCollisionTime < this.COLLISION_THROTTLE_MS) return;
    this.lastCollisionKey = key;
    this.lastCollisionTime = now;

    console.group('💥 COLLISION');
    console.log('currentPosition:', { x: currentPos.x.toFixed(3), y: currentPos.y.toFixed(3) });
    console.log('targetPosition:', { x: targetPos.x.toFixed(3), y: targetPos.y.toFixed(3) });
    console.log('wallCell:', wallCell);
    console.log('closestPoint:', {
      x: closestPoint.closestX.toFixed(3),
      y: closestPoint.closestY.toFixed(3),
    });
    console.log('distanceSquared:', distanceSquared.toFixed(6));
    console.log('radiusSquared:', radiusSquared.toFixed(6));
    console.log('collisionRadius:', collisionRadius.toFixed(3));
    console.log('BODY_RADIUS:', BODY_RADIUS, 'WALL_CLEARANCE:', WALL_CLEARANCE);
    console.groupEnd();
  }
}
