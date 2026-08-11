import type { Ghost } from '@/entities/Ghost';
import type { Pacman } from '@/entities/Pacman';
import { spawnEntities } from '@/entities/spawning';
import type { Level } from '@/map/Level';
import type { Pellets } from '@/map/Pellets';
import type { SpawnConfig } from '@/types';

export class GameWorld {
  readonly level: Level;
  readonly pellets: Pellets;
  readonly pacman: Pacman;
  readonly ghosts: Ghost[];

  private _score = 0;

  constructor(level: Level, pellets: Pellets, spawnConfig: SpawnConfig) {
    this.level = level;
    this.pellets = pellets;
    const spawn = spawnEntities(spawnConfig, level);
    this.pacman = spawn.pacman;
    this.ghosts = spawn.ghosts;
  }

  get score(): number {
    return this._score;
  }

  addScore(points: number): void {
    this._score += points;
  }

  update(deltaTime: number): void {
    this.pacman.update(deltaTime);
    this.consumePellet();
    for (const ghost of this.ghosts) {
      ghost.update(deltaTime);
    }
  }

  private consumePellet(): void {
    if (this.pacman.state !== 'active') return;

    const cell = this.pacman.cell;
    if (this.pellets.contains(cell)) {
      this.pellets.remove(cell);
    }
  }
}
