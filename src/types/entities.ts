import type { Direction, Position } from '@/types/geometry';

export type EntityType = 'pacman' | 'ghost';

export type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type EntityState = 'active' | 'frightened' | 'inactive';

export interface EntitySpawn {
  position: Position;
  direction: Direction;
}

export interface SpawnConfig {
  pacman: EntitySpawn;
  blinky: EntitySpawn;
  pinky: EntitySpawn;
  inky: EntitySpawn;
  clyde: EntitySpawn;
}
