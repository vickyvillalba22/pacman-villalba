import type { GameEngine } from '@/game/GameEngine';
import type { State, StateContext } from '@/game/State';
import type { GameState } from '@/types';

export interface StateMachine {
  update(deltaTime: number): void;
  changeState(state: GameState): void;
}

export class GameStateMachine implements StateMachine, StateContext {
  private current: State;
  private engine: GameEngine;

  constructor(
    private readonly states: Record<GameState, State>,
    engine: GameEngine,
  ) {
    this.current = states.boot;
    this.engine = engine;
  }

  setEngine(engine: GameEngine): void {
    this.engine = engine;
  }

  changeState(state: GameState): void {
    this.current.exit();
    this.current = this.states[state];
    this.current.enter(this);
  }

  reset(): void {
    this.engine.reset();
  }

  update(deltaTime: number): void {
    this.current.update(deltaTime, this);
  }
}
