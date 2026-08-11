export interface Vector2 {
  x: number;
  y: number;
}

export type Position = Vector2;

export interface Size {
  width: number;
  height: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
