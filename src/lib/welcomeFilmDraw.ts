/**
 * Dibuja una imagen en un canvas ocupando todo el rectángulo (equivalente a object-fit: cover).
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
): void {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) {
    return;
  }

  const cw = canvas.width;
  const ch = canvas.height;
  if (!cw || !ch) {
    return;
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cw, ch);

  const scale = Math.max(cw / nw, ch / nh);
  const dw = nw * scale;
  const dh = nh * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.drawImage(img, 0, 0, nw, nh, dx, dy, dw, dh);
}

export function sizeCanvasToElement(
  canvas: HTMLCanvasElement,
  wrap: HTMLElement,
  dprCap = 2,
): boolean {
  const dpr = Math.min(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    dprCap,
  );
  const w = Math.max(1, Math.floor(wrap.clientWidth));
  const h = Math.max(1, Math.floor(wrap.clientHeight));
  const nextW = Math.floor(w * dpr);
  const nextH = Math.floor(h * dpr);
  if (canvas.width === nextW && canvas.height === nextH) {
    return false;
  }
  canvas.width = nextW;
  canvas.height = nextH;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  return true;
}
