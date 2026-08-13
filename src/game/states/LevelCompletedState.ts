import type { State, StateContext } from '@/game/State';
import type { GameState } from '@/types';

export class LevelCompletedState implements State {
  readonly id: GameState = 'levelCompleted';

  enter(_context: StateContext): void {}

  update(_deltaTime: number, context: StateContext): void {
    context.reset();
    context.changeState('playing');
  }

  exit(): void {}
}
