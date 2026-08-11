import type { Size } from '@/types';

export interface Renderer {
  resize(size: Size): void;
  clear(): void;
  render(): void;
}
