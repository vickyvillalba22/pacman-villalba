import type { State, StateContext } from '@/game/State';
import type { GameState } from '@/types';

export class PlayingState implements State {
  readonly id: GameState = 'playing';

  enter(_context: StateContext): void {}

  update(_deltaTime: number, _context: StateContext): void {}

  exit(): void {}
}
