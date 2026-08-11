export interface CanvasHandle {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

export function setupCanvas(canvas: HTMLCanvasElement): CanvasHandle {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('El contexto 2D no está disponible en este navegador.');
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  window.addEventListener('resize', resize);
  resize();

  return { canvas, context };
}
