
import { useMemo } from 'react';
import type { QuadraticStats } from '../types';

const round = (val: number, places: number = 2): number => {
    if (Math.abs(val) < 1e-9) return 0;
    const factor = Math.pow(10, places);
    return Math.round(val * factor) / factor;
};

export const useQuadraticCalculator = (a: number, b: number, c: number): QuadraticStats => {
  return useMemo(() => {
    // Avoid division by zero if 'a' is 0
    const safeA = a === 0 ? 1e-9 : a;

    const discriminant = b * b - 4 * safeA * c;
    const h = -b / (2 * safeA);
    const k = safeA * h * h + b * h + c;

    let roots: number[] | null = null;
    if (discriminant >= 0) {
      const sqrtDiscriminant = Math.sqrt(discriminant);
      const r1 = (-b + sqrtDiscriminant) / (2 * safeA);
      const r2 = (-b - sqrtDiscriminant) / (2 * safeA);
      roots = discriminant === 0 ? [r1] : [r1, r2].sort((n1, n2) => n1 - n2);
    }

    const vertexForm = `y = ${round(a)}(x - ${round(h)})² + ${round(k)}`;
    
    return {
      discriminant,
      vertex: { h, k },
      roots,
      axisOfSymmetry: h,
      yIntercept: c,
      vertexForm,
    };
  }, [a, b, c]);
};
