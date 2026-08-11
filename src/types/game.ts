export type GameState =
  | 'boot'
  | 'loading'
  | 'attractMode'
  | 'waitingForPlayer'
  | 'playing'
  | 'paused'
  | 'levelCompleted'
  | 'gameOver';
