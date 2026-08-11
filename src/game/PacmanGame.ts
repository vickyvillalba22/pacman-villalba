import type { GameWorld } from '@/entities/GameWorld';
import type { GameEngine } from '@/game/GameEngine';
import type { StateMachine } from '@/game/GameStateMachine';
import type { InputProvider } from '@/input/InputProvider';
import type { Renderer } from '@/renderer/Renderer';
import type { Direction } from '@/types';

export class PacmanGame implements GameEngine {
  constructor(
    private readonly stateMachine: StateMachine,
    private readonly renderer: Renderer,
    private readonly world: GameWorld,
    private readonly input: InputProvider,
  ) {}

  async init(): Promise<void> {}

  update(deltaTime: number): void {
    const requestedDirection = this.readRequestedDirection();
    if (requestedDirection) {
      this.world.pacman.requestedDirection = requestedDirection;
    }
    this.world.update(deltaTime);
    this.stateMachine.update(deltaTime);
    this.renderer.render();
  }

  start(): void {}

  stop(): void {}

  reset(): void {}

  private readRequestedDirection(): Direction | undefined {
    if (this.input.isPressed('moveUp')) return 'up';
    if (this.input.isPressed('moveDown')) return 'down';
    if (this.input.isPressed('moveLeft')) return 'left';
    if (this.input.isPressed('moveRight')) return 'right';
    return undefined;
  }
}
