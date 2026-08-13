import type { Ghost } from '@/entities/Ghost';
import type { Pacman } from '@/entities/Pacman';
import { spawnEntities } from '@/entities/spawning';
import type { Level } from '@/map/Level';
import type { Pellets } from '@/map/Pellets';
import type { PowerPellets } from '@/map/PowerPellets';
import type { SpawnConfig } from '@/types';

const PELLET_SCORE = 10;
const POWER_PELLET_SCORE = 50;
const GHOST_SCORE = 200;
const FRIGHTENED_DURATION = 6;

const PACMAN_BODY_RADIUS = 0.4;
const GHOST_BODY_RADIUS = 0.4;

export type CollisionResult =
  { type: 'dangerous'; ghost: Ghost } | { type: 'edible'; ghost: Ghost };

export class GameWorld {
  readonly level: Level;
  readonly pellets: Pellets;
  readonly powerPellets: PowerPellets;
  readonly pacman: Pacman;
  readonly ghosts: Ghost[];

  private _score = 0;
  private frightenedTimer = 0;
  private collisionResult: CollisionResult | null = null;
  private wasColliding = false;

  constructor(
    level: Level,
    pellets: Pellets,
    powerPellets: PowerPellets,
    spawnConfig: SpawnConfig,
  ) {
    this.level = level;
    this.pellets = pellets;
    this.powerPellets = powerPellets;
    const spawn = spawnEntities(spawnConfig, level);
    this.pacman = spawn.pacman;
    this.ghosts = spawn.ghosts;
  }

  get score(): number {
    return this._score;
  }

  get lives(): number {
    return this.pacman.lives;
  }

  loseLife(): void {
    this.pacman.loseLife();
  }

  get frightenedRemaining(): number {
    return this.frightenedTimer;
  }

  get collision(): CollisionResult | null {
    return this.collisionResult;
  }

  addScore(points: number): void {
    this._score += points;
  }

  reset(): void {
    this.pellets.reset();
    this.powerPellets.reset();
    this.pacman.respawn();
    for (const ghost of this.ghosts) {
      ghost.respawn();
    }
    this.frightenedTimer = 0;
  }

  update(deltaTime: number): void {
    this.pacman.update(deltaTime);
    this.consumePellet();
    this.updateFrightened(deltaTime);
    for (const ghost of this.ghosts) {
      ghost.update(deltaTime, this.pacman.position);
    }
    this.detectCollision();
    this.resolveCollision();
  }

  private resolveCollision(): void {
    const result = this.collisionResult;
    if (result?.type === 'edible') {
      result.ghost.setInactive();
      this.addScore(GHOST_SCORE);
      this.collisionResult = null;
      return;
    }

    if (result?.type === 'dangerous') {
      this.loseLife();
      if (this.lives > 0) {
        this.pacman.respawn();
      }
    }
  }

  private detectCollision(): void {
    const result = this.findCollision();
    if (result && !this.wasColliding) {
      this.collisionResult = result;
    } else {
      this.collisionResult = null;
    }
    this.wasColliding = result !== undefined;
  }

  private findCollision(): CollisionResult | undefined {
    for (const ghost of this.ghosts) {
      if (ghost.state === 'inactive') continue;
      if (!this.isOverlapping(ghost)) continue;
      return ghost.state === 'frightened'
        ? { type: 'edible', ghost }
        : { type: 'dangerous', ghost };
    }
    return undefined;
  }

  private isOverlapping(ghost: Ghost): boolean {
    const dx = ghost.position.x - this.pacman.position.x;
    const dy = ghost.position.y - this.pacman.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < PACMAN_BODY_RADIUS + GHOST_BODY_RADIUS;
  }

  private consumePellet(): void {
    if (this.pacman.state !== 'active') return;

    const cell = this.pacman.cell;
    if (this.pellets.contains(cell)) {
      this.pellets.remove(cell);
      this.addScore(PELLET_SCORE);
    }
    if (this.powerPellets.contains(cell)) {
      this.powerPellets.remove(cell);
      this.addScore(POWER_PELLET_SCORE);
      this.frightenedTimer = FRIGHTENED_DURATION;
      this.activateFrightened();
    }
  }

  private updateFrightened(deltaTime: number): void {
    if (this.frightenedTimer <= 0) return;

    this.frightenedTimer -= deltaTime;
    if (this.frightenedTimer <= 0) {
      this.frightenedTimer = 0;
      this.endFrightened();
    }
  }

  private endFrightened(): void {
    for (const ghost of this.ghosts) {
      if (ghost.state === 'frightened') {
        ghost.setActive();
      }
    }
  }

  private activateFrightened(): void {
    for (const ghost of this.ghosts) {
      if (ghost.state === 'inactive') continue;
      ghost.setFrightened();
    }
  }
}
