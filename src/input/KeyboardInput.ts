import type { InputProvider, Unsubscribe } from '@/input/InputProvider';
import type { InputAction, InputEvent } from '@/types';

const KEY_TO_ACTION: Record<string, InputAction> = {
  ArrowUp: 'moveUp',
  KeyW: 'moveUp',
  ArrowDown: 'moveDown',
  KeyS: 'moveDown',
  ArrowLeft: 'moveLeft',
  KeyA: 'moveLeft',
  ArrowRight: 'moveRight',
  KeyD: 'moveRight',
};

export class KeyboardInput implements InputProvider {
  private readonly pressed = new Set<InputAction>();
  private readonly listeners = new Set<(event: InputEvent) => void>();

  private readonly onKeyDown = (event: Event): void => {
    const action = KEY_TO_ACTION[(event as KeyboardEvent).code];
    if (!action) return;

    event.preventDefault();
    if (!this.pressed.has(action)) {
      this.pressed.add(action);
      this.notify({ action, pressed: true });
    }
  };

  private readonly onKeyUp = (event: Event): void => {
    const action = KEY_TO_ACTION[(event as KeyboardEvent).code];
    if (!action) return;

    event.preventDefault();
    if (this.pressed.delete(action)) {
      this.notify({ action, pressed: false });
    }
  };

  constructor(private readonly target: EventTarget = window) {}

  start(): void {
    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
  }

  stop(): void {
    this.target.removeEventListener('keydown', this.onKeyDown);
    this.target.removeEventListener('keyup', this.onKeyUp);
  }

  isPressed(action: InputAction): boolean {
    return this.pressed.has(action);
  }

  subscribe(listener: (event: InputEvent) => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: InputEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
