import type { GameEngine } from '@/game/GameEngine';

const MAX_DELTA_TIME_SECONDS = 0.1;

export class GameLoop {
  private running = false;
  private frameId: number | null = null;
  private lastTime = 0;

  constructor(private readonly engine: GameEngine) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;
    const deltaTime = Math.min((now - this.lastTime) / 1000, MAX_DELTA_TIME_SECONDS);
    this.lastTime = now;
    this.engine.update(deltaTime);
    this.frameId = requestAnimationFrame(this.tick);
  };
}
