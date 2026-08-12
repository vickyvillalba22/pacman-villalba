import type { GameWorld } from '@/entities/GameWorld';
import type { Ghost } from '@/entities/Ghost';
import type { Level } from '@/map/Level';
import type { Renderer } from '@/renderer/Renderer';
import type { GhostType, Position, Size } from '@/types';

const WALL_COLOR = '#0000ff';
const EMPTY_COLOR = '#000000';
const PELLET_COLOR = '#ffffff';
const FRIGHTENED_BORDER_COLOR = '#00ff00';

const GHOST_COLORS: Record<GhostType, string> = {
  blinky: '#ff0000',
  pinky: '#ffb8ff',
  inky: '#00e5ff',
  clyde: '#ffb852',
};

export class DebugTileMapRenderer implements Renderer {
  constructor(
    private readonly level: Level,
    private readonly world: GameWorld,
    private readonly context: CanvasRenderingContext2D,
  ) {}

  resize(_size: Size): void {}

  clear(): void {}

  render(): void {
    const { canvas } = this.context;
    const { width, height } = this.level.size;

    if (width === 0 || height === 0) return;

    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, canvas.width, canvas.height);

    const tileSize = Math.max(
      1,
      Math.floor(Math.min(canvas.width / width, canvas.height / height)),
    );
    const offsetX = Math.floor((canvas.width - width * tileSize) / 2);
    const offsetY = Math.floor((canvas.height - height * tileSize) / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isWall = this.level.getTile({ x, y }) === 'wall';
        this.context.fillStyle = isWall ? WALL_COLOR : EMPTY_COLOR;
        this.context.fillRect(offsetX + x * tileSize, offsetY + y * tileSize, tileSize, tileSize);
      }
    }

    this.drawPellets(offsetX, offsetY, tileSize);
    this.drawPacman(offsetX, offsetY, tileSize);
    for (const ghost of this.world.ghosts) {
      this.drawGhost(ghost, offsetX, offsetY, tileSize);
    }
  }

  private drawPellets(offsetX: number, offsetY: number, tileSize: number): void {
    const radius = Math.max(1, Math.floor(tileSize * 0.2));

    this.context.fillStyle = PELLET_COLOR;
    for (const position of this.world.pellets.positions()) {
      const center = this.tileCenter(position, offsetX, offsetY, tileSize);
      this.context.beginPath();
      this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
      this.context.fill();
    }
  }

  private drawPacman(offsetX: number, offsetY: number, tileSize: number): void {
    const pacman = this.world.pacman;
    if (pacman.state !== 'active') return;

    const center = this.tileCenter(pacman.position, offsetX, offsetY, tileSize);
    const radius = Math.floor(tileSize * 0.4);

    this.context.fillStyle = '#ffd800';
    this.context.beginPath();
    this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.context.fill();

    this.context.lineWidth = Math.max(1, Math.floor(tileSize * 0.06));
    this.context.strokeStyle = '#000000';
    this.context.stroke();
  }

  private drawGhost(ghost: Ghost, offsetX: number, offsetY: number, tileSize: number): void {
    if (ghost.state === 'inactive') return;

    const center = this.tileCenter(ghost.position, offsetX, offsetY, tileSize);
    const r = tileSize * 0.4;

    this.context.fillStyle = GHOST_COLORS[ghost.ghostType];
    this.context.beginPath();
    this.context.arc(center.x, center.y - r * 0.2, r * 0.55, Math.PI, 0);
    this.context.lineTo(center.x + r * 0.55, center.y + r);
    this.context.lineTo(center.x + r * 0.28, center.y + r * 0.45);
    this.context.lineTo(center.x, center.y + r);
    this.context.lineTo(center.x - r * 0.28, center.y + r * 0.45);
    this.context.lineTo(center.x - r * 0.55, center.y + r);
    this.context.closePath();
    this.context.fill();

    if (ghost.state === 'frightened') {
      this.context.strokeStyle = FRIGHTENED_BORDER_COLOR;
      this.context.lineWidth = Math.max(1, Math.floor(tileSize * 0.08));
      this.context.stroke();
    }
  }

  private tileCenter(
    position: Position,
    offsetX: number,
    offsetY: number,
    tileSize: number,
  ): Position {
    return {
      x: offsetX + position.x * tileSize + tileSize / 2,
      y: offsetY + position.y * tileSize + tileSize / 2,
    };
  }
}
