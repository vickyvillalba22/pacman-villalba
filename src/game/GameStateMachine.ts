import type { State, StateContext } from '@/game/State';
import type { GameState } from '@/types';

export interface StateMachine {
  update(deltaTime: number): void;
  changeState(state: GameState): void;
}

export class GameStateMachine implements StateMachine, StateContext {
  private current: State;

  constructor(private readonly states: Record<GameState, State>) {
    this.current = states.boot;
  }

  changeState(state: GameState): void {
    this.current.exit();
    this.current = this.states[state];
    this.current.enter(this);
  }

  update(deltaTime: number): void {
    this.current.update(deltaTime, this);
  }
}
