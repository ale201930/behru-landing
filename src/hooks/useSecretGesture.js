'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * Custom Hook para detectar un número específico de clics rápidos sobre un elemento (ej: Logotipo).
 * @param {Function} onTrigger - Callback a ejecutar cuando se completa el gesto secreto.
 * @param {number} requiredClicks - Número de clics requeridos (por defecto 5).
 * @param {number} timeWindowMs - Ventana de tiempo máxima en ms (por defecto 2500ms).
 */
export function useSecretGesture(onTrigger, requiredClicks = 5, timeWindowMs = 2500) {
  const [clickCount, setClickCount] = useState(0);
  const timerRef = useRef(null);

  const handleClick = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const nextCount = clickCount + 1;

    if (nextCount >= requiredClicks) {
      setClickCount(0);
      if (typeof onTrigger === 'function') {
        onTrigger();
      }
    } else {
      setClickCount(nextCount);
      timerRef.current = setTimeout(() => {
        setClickCount(0);
      }, timeWindowMs);
    }
  }, [clickCount, onTrigger, requiredClicks, timeWindowMs]);

  return { handleClick, clickCount };
}
