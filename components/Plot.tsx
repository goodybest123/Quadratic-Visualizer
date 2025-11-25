import React, { useRef, useEffect, useCallback } from 'react';
import type { Coefficients, ViewState, QuadraticStats } from '../types';

interface PlotProps {
  coefficients: Coefficients;
  stats: QuadraticStats;
  view: ViewState;
  setView: React.Dispatch<React.SetStateAction<ViewState>>;
}

export const Plot: React.FC<PlotProps> = ({ coefficients, stats, view, setView }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
    }
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const worldToScreen = (x: number, y: number): [number, number] => {
      const X = (x - view.xMin) / (view.xMax - view.xMin) * width;
      const Y = (1 - (y - view.yMin) / (view.yMax - view.yMin)) * height;
      return [X, Y];
    };
    
    // Clear and background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#3a3f4b';
    ctx.fillRect(0, 0, width, height);

    const niceStep = (range: number) => {
        const rough = range / 10;
        const power = Math.pow(10, Math.floor(Math.log10(rough)));
        const normalized = rough / power;
        if (normalized < 1.5) return power * 1;
        if (normalized < 3) return power * 2;
        if (normalized < 7) return power * 5;
        return power * 10;
    };

    const xStep = niceStep(view.xMax - view.xMin);
    const yStep = niceStep(view.yMax - view.yMin);

    // Draw grid
    ctx.lineWidth = 1;
    if (view.grid) {
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.1)';
        for(let x = Math.ceil(view.xMin/xStep)*xStep; x <= view.xMax; x += xStep) {
            const [X] = worldToScreen(x, 0);
            ctx.beginPath(); ctx.moveTo(X, 0); ctx.lineTo(X, height); ctx.stroke();
        }
        for(let y = Math.ceil(view.yMin/yStep)*yStep; y <= view.yMax; y += yStep) {
            const [, Y] = worldToScreen(0, y);
            ctx.beginPath(); ctx.moveTo(0, Y); ctx.lineTo(width, Y); ctx.stroke();
        }
    }

    // Axes lines
    const [originX, originY] = worldToScreen(0, 0);
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(width, originY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, height); ctx.stroke();

    // --- Draw Axis Numbers and Ticks ---
    ctx.fillStyle = '#9ca3af'; // gray-400
    ctx.font = '11px sans-serif';
    const fmt = (n: number) => parseFloat(n.toPrecision(10)).toString();

    // X Axis Labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for(let x = Math.ceil(view.xMin/xStep)*xStep; x <= view.xMax; x += xStep) {
        if (Math.abs(x) < 1e-9) continue; // Skip 0
        const [X] = worldToScreen(x, 0);
        
        // Tick
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.moveTo(X, originY);
        ctx.lineTo(X, originY + 5);
        ctx.stroke();

        // Label
        ctx.fillText(fmt(x), X, originY + 8);
    }

    // Y Axis Labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for(let y = Math.ceil(view.yMin/yStep)*yStep; y <= view.yMax; y += yStep) {
        if (Math.abs(y) < 1e-9) continue; // Skip 0
        const [, Y] = worldToScreen(0, y);
        
        // Tick
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(200, 220, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.moveTo(originX, Y);
        ctx.lineTo(originX - 5, Y);
        ctx.stroke();

        // Label
        ctx.fillText(fmt(y), originX - 8, Y);
    }

    // Origin Label
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText("0", originX - 6, originY + 6);
    // -----------------------------------

    // Draw parabola
    const { a, b, c } = coefficients;
    ctx.beginPath();
    ctx.strokeStyle = '#d946ef'; // Magenta
    ctx.lineWidth = 2.5;
    for (let i = 0; i <= width; i++) {
        const x = view.xMin + (i / width) * (view.xMax - view.xMin);
        const y = a * x * x + b * x + c;
        const [X, Y] = worldToScreen(x, y);
        if (i === 0) ctx.moveTo(X, Y);
        else ctx.lineTo(X, Y);
    }
    ctx.stroke();

    // Draw points
    const { vertex, roots, yIntercept, axisOfSymmetry } = stats;

    // Axis of symmetry
    const [axisX] = worldToScreen(axisOfSymmetry, 0);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(200, 220, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(axisX, 0); ctx.lineTo(axisX, height); ctx.stroke();
    ctx.setLineDash([]);
    
    // Vertex
    const [vx, vy] = worldToScreen(vertex.h, vertex.k);
    ctx.fillStyle = '#f59e0b'; // Warm Orange
    ctx.beginPath(); ctx.arc(vx, vy, 5, 0, 2 * Math.PI); ctx.fill();

    // Y-intercept
    const [yintX, yintY] = worldToScreen(0, yIntercept);
    ctx.fillStyle = '#f59e0b'; // Warm Orange
    ctx.beginPath(); ctx.arc(yintX, yintY, 4, 0, 2 * Math.PI); ctx.fill();

    // Roots
    if (roots) {
        ctx.fillStyle = '#f59e0b'; // Warm Orange
        roots.forEach(root => {
            const [rx, ry] = worldToScreen(root, 0);
            ctx.beginPath(); ctx.arc(rx, ry, 4, 0, 2 * Math.PI); ctx.fill();
        });
    }

  }, [coefficients, view, stats]);

  useEffect(() => {
    const handleResize = () => {
        draw();
    };
    window.addEventListener('resize', handleResize);
    draw();
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    panStart.current = { x: e.clientX, y: e.clientY };

    const wx = (view.xMax - view.xMin) * (dx / e.currentTarget.clientWidth);
    const hy = (view.yMax - view.yMin) * (-dy / e.currentTarget.clientHeight);
    
    setView(v => ({
      ...v,
      xMin: v.xMin - wx,
      xMax: v.xMax - wx,
      yMin: v.yMin - hy,
      yMax: v.yMax - hy,
    }));
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanning.current = false;
    e.currentTarget.style.cursor = 'grab';
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const worldX = view.xMin + (mouseX / rect.width) * (view.xMax - view.xMin);
      const worldY = view.yMin + (1 - (mouseY / rect.height)) * (view.yMax - view.yMin);

      setView(v => {
        const newXMin = worldX + (v.xMin - worldX) * factor;
        const newXMax = worldX + (v.xMax - worldX) * factor;
        const newYMin = worldY + (v.yMin - worldY) * factor;
        const newYMax = worldY + (v.yMax - worldY) * factor;
        return { ...v, xMin: newXMin, xMax: newXMax, yMin: newYMin, yMax: newYMax };
      });
  };

  return (
      <div className="h-full w-full bg-[#21252b] rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
      </div>
  );
};