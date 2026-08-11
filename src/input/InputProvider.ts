import type { InputAction, InputEvent } from '@/types';

export type Unsubscribe = () => void;

export interface InputProvider {
  isPressed(action: InputAction): boolean;
  subscribe(listener: (event: InputEvent) => void): Unsubscribe;
}
