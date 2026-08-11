export interface GameEngine {
  init(): Promise<void>;
  update(deltaTime: number): void;
  start(): void;
  stop(): void;
  reset(): void;
}
