import type { GameState } from '@/types';

export interface StateContext {
  changeState(state: GameState): void;
  reset(): void;
}

export interface State {
  readonly id: GameState;
  enter(context: StateContext): void;
  update(deltaTime: number, context: StateContext): void;
  exit(): void;
}
