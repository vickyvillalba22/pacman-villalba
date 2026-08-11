export type InputAction =
  'moveUp' | 'moveDown' | 'moveLeft' | 'moveRight' | 'start' | 'pause' | 'confirm' | 'cancel';

export interface InputEvent {
  action: InputAction;
  pressed: boolean;
}
