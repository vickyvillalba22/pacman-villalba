import type { Level } from '@/map/Level';
import type { Position, Size, TileType } from '@/types';

export class TileMap implements Level {
  readonly size: Size;

  private readonly grid: TileType[][];

  constructor(grid: TileType[][]) {
    const height = grid.length;
    const width = grid[0]?.length ?? 0;

    for (let y = 0; y < height; y++) {
      if (grid[y].length !== width) {
        throw new Error(
          `TileMap: la fila ${y} tiene ${grid[y].length} celdas (se esperaban ${width}).`,
        );
      }
    }

    this.grid = grid;
    this.size = { width, height };
  }

  getTile(position: Position): TileType {
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= this.size.width ||
      position.y >= this.size.height
    ) {
      return 'wall';
    }

    return this.grid[position.y][position.x];
  }

  setTile(position: Position, tile: TileType): void {
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= this.size.width ||
      position.y >= this.size.height
    ) {
      throw new Error(`TileMap: posición fuera de rango (${position.x}, ${position.y}).`);
    }

    this.grid[position.y][position.x] = tile;
  }

  isWalkable(position: Position): boolean {
    return this.getTile(position) !== 'wall';
  }

  forEach(callback: (tile: TileType, position: Position) => void): void {
    for (let y = 0; y < this.size.height; y++) {
      for (let x = 0; x < this.size.width; x++) {
        callback(this.grid[y][x], { x, y });
      }
    }
  }
}
