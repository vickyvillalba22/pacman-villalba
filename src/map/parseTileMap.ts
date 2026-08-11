import { TileMap } from '@/map/TileMap';
import type { TileType } from '@/types';

const CHAR_TO_TILE: Record<string, TileType> = {
  '#': 'wall',
  ' ': 'empty',
  '.': 'dot',
  o: 'powerPellet',
  '-': 'tunnel',
  '=': 'ghostDoor',
};

export function parseTileMap(source: string): TileMap {
  const rows = source.split(/\r?\n/).filter((row) => row.trim().length > 0);

  if (rows.length === 0) {
    throw new Error('parseTileMap: el mapa está vacío.');
  }

  const width = Math.max(...rows.map((row) => row.length));
  const grid: TileType[][] = rows.map((row, y) =>
    Array.from({ length: width }, (_, x) => {
      const tile = CHAR_TO_TILE[row[x] ?? ' '];

      if (!tile) {
        throw new Error(
          `parseTileMap: carácter desconocido '${row[x]}' en la fila ${y + 1}, columna ${x + 1}.`,
        );
      }

      return tile;
    }),
  );

  return new TileMap(grid);
}
