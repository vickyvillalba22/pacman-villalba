import './style.css';

import demoMapSource from '@assets/maps/demo.level?raw';

import { GameWorld } from '@/entities/GameWorld';
import { GameLoop } from '@/game/GameLoop';
import { KeyboardInput } from '@/input/KeyboardInput';
import { GameStateMachine } from '@/game/GameStateMachine';
import { PacmanGame } from '@/game/PacmanGame';
import type { State } from '@/game/State';
import { AttractModeState } from '@/game/states/AttractModeState';
import { BootState } from '@/game/states/BootState';
import { GameOverState } from '@/game/states/GameOverState';
import { LevelCompletedState } from '@/game/states/LevelCompletedState';
import { LoadingState } from '@/game/states/LoadingState';
import { PausedState } from '@/game/states/PausedState';
import { PlayingState } from '@/game/states/PlayingState';
import { WaitingForPlayerState } from '@/game/states/WaitingForPlayerState';
import { parseTileMap } from '@/map/parseTileMap';
import { Pellets } from '@/map/Pellets';
import { PowerPellets } from '@/map/PowerPellets';
import { DebugTileMapRenderer } from '@/renderer/DebugTileMapRenderer';
import { setupCanvas } from '@/renderer/canvas';
import type { GameState, SpawnConfig } from '@/types';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
if (!canvas) {
  throw new Error('No se encontró el elemento <canvas id="game-canvas">.');
}

const { context } = setupCanvas(canvas);

const level = parseTileMap(demoMapSource);

const spawnConfig: SpawnConfig = {
  pacman: { position: { x: 7, y: 6 }, direction: 'left' },
  blinky: { position: { x: 7, y: 2 }, direction: 'left' },
  pinky: { position: { x: 7, y: 4 }, direction: 'left' },
  inky: { position: { x: 5, y: 4 }, direction: 'left' },
  clyde: { position: { x: 9, y: 4 }, direction: 'left' },
};

const world = new GameWorld(level, new Pellets(level), new PowerPellets(level), spawnConfig);
const renderer = new DebugTileMapRenderer(level, world, context);

const states: Record<GameState, State> = {
  boot: new BootState(),
  loading: new LoadingState(),
  attractMode: new AttractModeState(),
  waitingForPlayer: new WaitingForPlayerState(),
  playing: new PlayingState(),
  paused: new PausedState(),
  levelCompleted: new LevelCompletedState(),
  gameOver: new GameOverState(),
};

const stateMachine = new GameStateMachine(states);
const input = new KeyboardInput();
const engine = new PacmanGame(stateMachine, renderer, world, input);
const loop = new GameLoop(engine);

async function bootstrap(): Promise<void> {
  await engine.init();
  input.start();
  loop.start();
}

void bootstrap();
