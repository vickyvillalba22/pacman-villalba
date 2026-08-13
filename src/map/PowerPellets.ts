import type { Level } from '@/map/Level';
import type { Position } from '@/types';

const POWER_PELLET_TILE = 'powerPellet';

function keyOf(position: Position): string {
  return `${position.x},${position.y}`;
}

function positionOf(key: string): Position {
  const separator = key.indexOf(',');
  return {
    x: Number(key.slice(0, separator)),
    y: Number(key.slice(separator + 1)),
  };
}

export class PowerPellets {
  readonly initialCount: number;

  private readonly cells: Set<string>;
  private readonly initialCells: Set<string>;

  constructor(level: Level) {
    this.cells = new Set();

    for (let y = 0; y < level.size.height; y++) {
      for (let x = 0; x < level.size.width; x++) {
        const position = { x, y };
        if (level.getTile(position) === POWER_PELLET_TILE) {
          this.cells.add(keyOf(position));
        }
      }
    }

    this.initialCount = this.cells.size;
    this.initialCells = new Set(this.cells);
  }

  get count(): number {
    return this.cells.size;
  }

  get isEmpty(): boolean {
    return this.cells.size === 0;
  }

  contains(position: Position): boolean {
    return this.cells.has(keyOf(position));
  }

  positions(): Position[] {
    return Array.from(this.cells, (key) => positionOf(key));
  }

  remove(position: Position): void {
    this.cells.delete(keyOf(position));
  }

  reset(): void {
    this.cells.clear();
    for (const cell of this.initialCells) {
      this.cells.add(cell);
    }
  }
}
