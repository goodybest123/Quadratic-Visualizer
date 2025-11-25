import React from 'react';
import type { Coefficients, QuadraticStats, QuizState } from '../types';
import { SliderInput } from './SliderInput';
import { InfoCard } from './InfoCard';
import { SpeakerIcon, RefreshCwIcon, GridIcon, DicesIcon, HelpCircleIcon, CheckIcon } from './Icons';

interface ControlsPanelProps {
  coefficients: Coefficients;
  setCoefficients: (newCoeffs: Partial<Coefficients>) => void;
  stats: QuadraticStats;
  onRandomize: () => void;
  onToggleGrid: () => void;
  onResetView: () => void;
  onExplain: () => void;
  isLoading: boolean;
  quiz: QuizState;
  setQuiz: React.Dispatch<React.SetStateAction<QuizState>>;
  onGetAIFeedback: () => void;
  isAIFeedbackLoading: boolean;
  aiFeedback: string | null;
}

const round = (val: number) => {
    if (Math.abs(val) < 1e-6) return 0;
    return Math.round(val * 100) / 100;
};

const formatSigned = (v: number) => {
    const rounded = round(v);
    return rounded >= 0 ? `+ ${rounded}` : `- ${Math.abs(rounded)}`;
};

const formatCoef = (v: number) => {
    const rounded = round(v);
    if (rounded === 1) return 'x²';
    if (rounded === -1) return '-x²';
    return `${rounded}x²`;
};

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  coefficients,
  setCoefficients,
  stats,
  onRandomize,
  onToggleGrid,
  onResetView,
  onExplain,
  isLoading,
  quiz,
  setQuiz,
  onGetAIFeedback,
  isAIFeedbackLoading,
  aiFeedback
}) => {
  const { a, b, c } = coefficients;
  const { vertex, roots, axisOfSymmetry, discriminant, vertexForm } = stats;

  const handleQuizVertex = () => {
    const h = Math.round(Math.random() * 12 - 6);
    const k = Math.round(Math.random() * 12 - 6);
    setQuiz({ type: 'vertex', target: { h, k }, message: `Goal: Set vertex to (${h}, ${k})` });
  };

  const handleQuizRoot = () => {
    const r = Math.round(Math.random() * 12 - 6);
    setQuiz({ type: 'rootAt', target: { r }, message: `Goal: Make a root at x = ${r}` });
  };

  const handleCheckQuiz = () => {
    if (!quiz.type || !quiz.target) return;
    let ok = false;
    let message = '';
    if (quiz.type === 'vertex') {
        const dh = Math.abs(stats.vertex.h - quiz.target.h);
        const dk = Math.abs(stats.vertex.k - quiz.target.k);
        ok = dh < 0.5 && dk < 0.5;
        message = ok ? 'Correct! Vertex is very close.' : `Not quite. Current vertex is (${round(stats.vertex.h)}, ${round(stats.vertex.k)}).`;
    } else if (quiz.type === 'rootAt') {
        if (stats.roots) ok = stats.roots.some(r => Math.abs(r - quiz.target.r) < 0.5);
        message = ok ? 'Great! You created a root at the target.' : `No root near x=${quiz.target.r}. Current roots: ${stats.roots ? stats.roots.map(r => round(r)).join(', ') : 'none'}`;
    }
    setQuiz(q => ({ ...q, message }));
  };
  
  const handleHint = () => {
      let hint = "Start a quiz first!";
      if (quiz.type === 'vertex') {
          hint = "Vertex x-coordinate is h = -b/(2a). Adjust 'a' and 'b' to change it.";
      } else if (quiz.type === 'rootAt') {
          hint = `To make ${quiz.target.r} a root, the equation a*r² + b*r + c must equal 0. Try adjusting 'c'.`;
      }
      setQuiz(q => ({ ...q, message: `Hint: ${hint}` }));
  };

  return (
    <div className="bg-[#21252b] rounded-lg p-4 flex flex-col gap-3 h-full overflow-y-auto">
      <div className="bg-[#2c313a] p-3 rounded-lg">
        <div className="text-xs text-gray-400">Equation</div>
        <div className="font-mono text-lg font-bold text-gray-200 tracking-tighter">
          y = {formatCoef(a)} {formatSigned(b)}x {formatSigned(c)}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SliderInput label="a" value={a} onChange={v => setCoefficients({ a: v })} min={-5} max={5} step={0.1} />
        <SliderInput label="b" value={b} onChange={v => setCoefficients({ b: v })} min={-20} max={20} step={0.1} />
        <SliderInput label="c" value={c} onChange={v => setCoefficients({ c: v })} min={-50} max={50} step={0.1} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InfoCard label="Vertex (h, k)" value={`(${round(vertex.h)}, ${round(vertex.k)})`} />
        <InfoCard label="Roots" value={roots ? `[${roots.map(r => round(r)).join(', ')}]` : 'None'} />
        <InfoCard label="Axis of Symmetry" value={`x = ${round(axisOfSymmetry)}`} />
        <InfoCard label="Discriminant (Δ)" value={`${round(discriminant)}`} />
      </div>

      <InfoCard label="Vertex Form" value={vertexForm} fullWidth={true} />

      <div className="grid grid-cols-4 gap-2 mt-1 text-xs">
          <button title="Explain" onClick={onExplain} disabled={isLoading} className="bg-[#4a5568] text-gray-300 rounded-md p-2 flex items-center justify-center hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-wait">
              <SpeakerIcon />
          </button>
          <button title="Reset View" onClick={onResetView} className="bg-[#4a5568] text-gray-300 rounded-md p-2 flex items-center justify-center hover:bg-gray-600 transition-colors">
              <RefreshCwIcon />
          </button>
          <button title="Toggle Grid" onClick={onToggleGrid} className="bg-[#4a5568] text-gray-300 rounded-md p-2 flex items-center justify-center hover:bg-gray-600 transition-colors">
              <GridIcon />
          </button>
          <button title="Randomize" onClick={onRandomize} className="bg-[#4a5568] text-gray-300 rounded-md p-2 flex items-center justify-center hover:bg-gray-600 transition-colors">
              <DicesIcon />
          </button>
      </div>
      
      <hr className="border-t border-gray-700 my-2" />
      
      <div>
        <h3 className="text-sm font-bold text-gray-300 mb-2">Quiz Mode</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
            <button onClick={handleQuizVertex} className="bg-[#4a5568] text-gray-300 rounded-md py-2 px-3 hover:bg-gray-600 transition-colors">Set Vertex</button>
            <button onClick={handleQuizRoot} className="bg-[#4a5568] text-gray-300 rounded-md py-2 px-3 hover:bg-gray-600 transition-colors">Set Root</button>
        </div>
        <div className="mt-2 text-xs text-center text-gray-400 bg-[#2c313a] p-2 rounded-md min-h-[3em] flex items-center justify-center">
            {quiz.message}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
            <button onClick={handleHint} className="bg-[#4a5568] text-gray-300 rounded-md p-2 flex items-center justify-center gap-2 hover:bg-gray-600 transition-colors">
                <HelpCircleIcon /> Hint
            </button>
            <button onClick={handleCheckQuiz} className="bg-cyan-600 text-white rounded-md p-2 flex items-center justify-center gap-2 hover:bg-cyan-700 transition-colors">
                <CheckIcon /> Check
            </button>
        </div>
      </div>
      
      <hr className="border-t border-gray-700 my-2" />
      
      <div>
          <h3 className="text-sm font-bold text-gray-300 mb-2">🤖 AI-Powered Learning Assistant</h3>
          <p className="text-xs text-gray-400 mb-3">Click the button below to receive personalized feedback based on your current graph and recent changes!</p>
          <button
              onClick={onGetAIFeedback}
              disabled={isAIFeedbackLoading}
              className="w-full bg-orange-500 text-white rounded-md py-2 px-3 text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
              {isAIFeedbackLoading ? 'Thinking...' : 'Get AI Feedback'}
          </button>
          {aiFeedback && !isAIFeedbackLoading && (
              <div className="mt-3 text-xs text-gray-300 bg-[#2c313a] p-3 rounded-md border border-gray-600">
                  {aiFeedback}
              </div>
          )}
          {isAIFeedbackLoading && (
              <div className="mt-3 text-xs text-gray-400 text-center">
                  Generating feedback...
              </div>
          )}
      </div>
    </div>
  );
};