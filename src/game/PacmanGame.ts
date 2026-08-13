import type { GameWorld } from '@/entities/GameWorld';
import type { GameEngine } from '@/game/GameEngine';
import type { StateMachine } from '@/game/GameStateMachine';
import type { InputProvider } from '@/input/InputProvider';
import type { Renderer } from '@/renderer/Renderer';
import type { Direction } from '@/types';

export class PacmanGame implements GameEngine {
  private stateMachine: StateMachine;
  private stopped = false;

  constructor(
    stateMachine: StateMachine,
    private readonly renderer: Renderer,
    private readonly world: GameWorld,
    private readonly input: InputProvider,
  ) {
    this.stateMachine = stateMachine;
  }

  setStateMachine(stateMachine: StateMachine): void {
    this.stateMachine = stateMachine;
  }

  async init(): Promise<void> {}

  update(deltaTime: number): void {
    if (this.stopped) {
      this.renderer.render();
      return;
    }

    const requestedDirection = this.readRequestedDirection();
    if (requestedDirection) {
      this.world.pacman.requestedDirection = requestedDirection;
    }
    this.world.update(deltaTime);
    if (this.world.lives === 0) {
      this.stopped = true;
      this.stateMachine.changeState('gameOver');
    } else if (this.world.pellets.isEmpty) {
      this.stateMachine.changeState('levelCompleted');
    }
    this.stateMachine.update(deltaTime);
    this.renderer.render();
  }

  start(): void {}

  stop(): void {}

  reset(): void {
    this.world.reset();
    this.stopped = false;
  }

  isGameOver(): boolean {
    return this.stopped;
  }

  private readRequestedDirection(): Direction | undefined {
    if (this.input.isPressed('moveUp')) return 'up';
    if (this.input.isPressed('moveDown')) return 'down';
    if (this.input.isPressed('moveLeft')) return 'left';
    if (this.input.isPressed('moveRight')) return 'right';
    return undefined;
  }
}
