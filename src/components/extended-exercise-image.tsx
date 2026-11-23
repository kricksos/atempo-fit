"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  onLoad?: (src: string) => void;
  onError?: (src: string) => void;
};

export function drawExtendedExerciseImage(context: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const imageWidth = Math.min(width, Math.round(image.naturalWidth * scale));
  const imageHeight = Math.min(height, Math.round(image.naturalHeight * scale));
  const left = Math.floor((width - imageWidth) / 2);
  const top = Math.floor((height - imageHeight) / 2);
  const right = width - left - imageWidth;
  const bottom = height - top - imageHeight;
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;

  if (left) context.drawImage(image, 0, 0, 1, ih, 0, top, left, imageHeight);
  if (right) context.drawImage(image, iw - 1, 0, 1, ih, left + imageWidth, top, right, imageHeight);
  if (top) context.drawImage(image, 0, 0, iw, 1, left, 0, imageWidth, top);
  if (bottom) context.drawImage(image, 0, ih - 1, iw, 1, left, top + imageHeight, imageWidth, bottom);
  if (left && top) context.drawImage(image, 0, 0, 1, 1, 0, 0, left, top);
  if (right && top) context.drawImage(image, iw - 1, 0, 1, 1, left + imageWidth, 0, right, top);
  if (left && bottom) context.drawImage(image, 0, ih - 1, 1, 1, 0, top + imageHeight, left, bottom);
  if (right && bottom) context.drawImage(image, iw - 1, ih - 1, 1, 1, left + imageWidth, top + imageHeight, right, bottom);
  context.drawImage(image, left, top, imageWidth, imageHeight);
}

export function ExtendedExerciseImage({ src, alt, onLoad, onError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = new window.Image();
    let observer: ResizeObserver | null = null;
    let cancelled = false;
    let reported = false;
    let notified = false;

    function fail() {
      if (cancelled || reported) return;
      reported = true;
      observer?.disconnect();
      setFailed(true);
      onError?.(src);
    }

    function draw() {
      if (!canvas || reported) return;
      const bounds = canvas.getBoundingClientRect();
      const width = Math.round(bounds.width * window.devicePixelRatio);
      const height = Math.round(bounds.height * window.devicePixelRatio);
      if (!width || !height) return;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) { fail(); return; }
      drawExtendedExerciseImage(context, image, width, height);
      if (!notified) { notified = true; onLoad?.(src); }
    }

    image.onload = () => {
      if (cancelled) return;
      observer = new ResizeObserver(draw);
      observer.observe(canvas);
      draw();
    };
    image.onerror = fail;
    image.src = src;
    return () => { cancelled = true; image.onload = null; image.onerror = null; observer?.disconnect(); };
  }, [src, onLoad, onError]);

  if (failed) return <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-[#d9eae8]">No se ha podido cargar la imagen de este ejercicio.</p>;
  return <canvas ref={canvasRef} role="img" aria-label={alt} className="absolute inset-0 h-full w-full" />;
}
