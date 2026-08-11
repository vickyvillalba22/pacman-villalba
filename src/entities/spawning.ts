import { Ghost } from '@/entities/Ghost';
import { Pacman } from '@/entities/Pacman';
import type { Level } from '@/map/Level';
import type { SpawnConfig } from '@/types';

export interface SpawnResult {
  pacman: Pacman;
  ghosts: Ghost[];
}

export function spawnEntities(config: SpawnConfig, level: Level): SpawnResult {
  return {
    pacman: new Pacman(config.pacman.position, config.pacman.direction, level),
    ghosts: [
      new Ghost(config.blinky.position, config.blinky.direction, 'blinky', level),
      new Ghost(config.pinky.position, config.pinky.direction, 'pinky', level),
      new Ghost(config.inky.position, config.inky.direction, 'inky', level),
      new Ghost(config.clyde.position, config.clyde.direction, 'clyde', level),
    ],
  };
}
