import type { Position, Size, TileType } from '@/types';

export interface Level {
  readonly size: Size;
  getTile(position: Position): TileType;
  isWalkable(position: Position): boolean;
}
