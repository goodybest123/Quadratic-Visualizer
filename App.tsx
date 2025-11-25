import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Plot } from './components/Plot';
import { ControlsPanel } from './components/ControlsPanel';
import { useQuadraticCalculator } from './hooks/useQuadraticCalculator';
import type { Coefficients, ViewState, QuizState, QuadraticStats } from './types';
import { getParabolaExplanationAudio, getAIAssistantFeedback } from './services/geminiService';
import { playAudioBuffer } from './utils/audioUtils';

const App: React.FC = () => {
  const [coefficients, setCoefficients] = useState<Coefficients>({ a: 1, b: 0, c: 0 });
  const [previousCoefficients, setPreviousCoefficients] = useState<Coefficients | null>(null);
  const [view, setView] = useState<ViewState>({
    xMin: -10, xMax: 10, yMin: -10, yMax: 10, grid: true,
  });
  const [quiz, setQuiz] = useState<QuizState>({ type: null, target: null, message: 'Start a quiz to get feedback.' });
  const [isLoading, setIsLoading] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  const [aiFeedback, setAIFeedback] = useState<string | null>(null);
  const [isAIFeedbackLoading, setIsAIFeedbackLoading] = useState(false);

  const stats = useQuadraticCalculator(coefficients.a, coefficients.b, coefficients.c);

  const handleCoefficientsChange = useCallback((newCoeffs: Partial<Coefficients>) => {
    setCoefficients(prev => {
        setPreviousCoefficients(prev);
        return { ...prev, ...newCoeffs };
    });
  }, []);

  const handleResetView = useCallback(() => {
    setView({ xMin: -10, xMax: 10, yMin: -10, yMax: 10, grid: true });
  }, []);

  const handleToggleGrid = useCallback(() => {
    setView(v => ({ ...v, grid: !v.grid }));
  }, []);

  const handleRandomize = useCallback(() => {
    const a = parseFloat((Math.random() * 10 - 5).toFixed(1));
    const b = parseFloat((Math.random() * 20 - 10).toFixed(1));
    const c = parseFloat((Math.random() * 40 - 20).toFixed(1));
    handleCoefficientsChange({ a: a !== 0 ? a : 0.1, b, c });
  }, [handleCoefficientsChange]);

  const handleExplain = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    let ctx = audioContext;
    if (!ctx) {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        setAudioContext(ctx);
    }
    
    try {
        const audioBuffer = await getParabolaExplanationAudio(coefficients.a, stats, ctx);
        if (audioBuffer) {
            playAudioBuffer(audioBuffer, ctx);
        } else {
            alert("Could not generate explanation.");
        }
    } catch (error) {
        console.error("Error generating explanation:", error);
        alert("An error occurred while generating the audio explanation.");
    } finally {
        setIsLoading(false);
    }
  }, [coefficients.a, stats, isLoading, audioContext]);

  const handleGetAIFeedback = useCallback(async () => {
    setIsAIFeedbackLoading(true);
    setAIFeedback(null);
    try {
        const feedback = await getAIAssistantFeedback(previousCoefficients, coefficients, stats);
        setAIFeedback(feedback);
    } catch (error) {
        console.error("Error getting AI feedback:", error);
        setAIFeedback("Sorry, I couldn't generate feedback right now.");
    } finally {
        setIsAIFeedbackLoading(false);
    }
  }, [previousCoefficients, coefficients, stats]);

  return (
    <div className="min-h-screen bg-[#282c34] text-gray-200 p-4 border-2 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.4)] rounded-lg">
      <div className="flex flex-col h-full">
        <header className="flex items-center gap-4 mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-orange-400">Quadratic Function Visualizer</h1>
            <p className="text-sm text-gray-400">Interactively explore y = ax² + bx + c — move sliders, view roots, vertex, and more.</p>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4 flex-grow">
          <div className="w-full h-full min-h-[400px] lg:min-h-0">
            <Plot 
              coefficients={coefficients}
              stats={stats}
              view={view}
              setView={setView}
            />
          </div>
          <aside>
            <ControlsPanel
              coefficients={coefficients}
              setCoefficients={handleCoefficientsChange}
              stats={stats}
              onRandomize={handleRandomize}
              onToggleGrid={handleToggleGrid}
              onResetView={handleResetView}
              onExplain={handleExplain}
              isLoading={isLoading}
              quiz={quiz}
              setQuiz={setQuiz}
              onGetAIFeedback={handleGetAIFeedback}
              isAIFeedbackLoading={isAIFeedbackLoading}
              aiFeedback={aiFeedback}
            />
          </aside>
        </main>
        
        <footer className="mt-4 text-center text-xs text-gray-500">
          Created with G-LogicLens — Quadratic Visualizer • Use "Explain" for AI-guided narration.
        </footer>
      </div>
    </div>
  );
};

export default App;