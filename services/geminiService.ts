import { GoogleGenAI, Modality } from "@google/genai";
import type { Coefficients, QuadraticStats } from '../types';
import { decode, decodeAudioData } from '../utils/audioUtils';

const round = (val: number): number => {
    if (Math.abs(val) < 1e-9) return 0;
    return Math.round(val * 100) / 100;
};

let ai: GoogleGenAI | null = null;
try {
  // This check prevents a ReferenceError in browser environments where 'process' is not defined.
  if (typeof process !== 'undefined' && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }
} catch (e) {
    console.error("Failed to initialize GoogleGenAI. API key might be missing or 'process' is not available in this environment.", e);
}


export const getParabolaExplanationAudio = async (a: number, stats: QuadraticStats, audioContext: AudioContext): Promise<AudioBuffer | null> => {
    if (!ai) {
        console.error("AI service not initialized. An API key may be missing in the environment configuration.");
        return null;
    }
    
    const h = stats.vertex.h;
    const k = stats.vertex.k;

    let message = `Analyzing the parabola where the 'a' coefficient is ${round(a)}. `;
    message += (a > 0) ? `Since 'a' is positive, it opens upwards, forming a valley. ` : `Since 'a' is negative, it opens downwards, like a hill. `;
    
    message += `The vertex, which is the lowest or highest point, is located at x equals ${round(h)} and y equals ${round(k)}. `;
    
    if (stats.discriminant < 0) {
        message += "The parabola does not cross the x-axis, so there are no real roots. ";
    } else if (stats.roots && stats.roots.length === 1) {
        message += `It touches the x-axis at a single point, a repeated root, at x equals ${round(stats.roots[0])}. `;
    } else if (stats.roots) {
        message += `It crosses the x-axis at two points, which are the roots, located at approximately x equals ${round(stats.roots[0])} and x equals ${round(stats.roots[1])}. `;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: message }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            const decodedBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
            return audioBuffer;
        }
        return null;
    } catch (error) {
        console.error("Error calling Gemini TTS API:", error);
        return null;
    }
};

export const getAIAssistantFeedback = async (
    previousCoefficients: Coefficients | null,
    currentCoefficients: Coefficients,
    stats: QuadraticStats
): Promise<string> => {
    if (!ai) {
        console.error("AI service not initialized. An API key may be missing in the environment configuration.");
        throw new Error("AI service is not configured.");
    }

    const { a, b, c } = currentCoefficients;
    const { vertex, roots, yIntercept, discriminant } = stats;

    let promptAction = "The student has set the following initial parameters for a quadratic function.";
    if (previousCoefficients) {
        promptAction = `The student changed the parameters of the quadratic function from (a:${round(previousCoefficients.a)}, b:${round(previousCoefficients.b)}, c:${round(previousCoefficients.c)}) to (a:${round(a)}, b:${round(b)}, c:${round(c)}).`;
    }
    
    const prompt = `You are a friendly and encouraging math tutor AI. A student is exploring quadratic equations (y = ax^2 + bx + c) using an interactive tool. Provide concise, helpful feedback based on the changes they made.

User's action: ${promptAction}

Current graph properties:
- Vertex: (${round(vertex.h)}, ${round(vertex.k)})
- Roots: ${roots ? roots.map(r => round(r)).join(', ') : 'None'}
- Y-intercept: ${round(yIntercept)}
- Discriminant: ${round(discriminant)}

Your task: Analyze the change (or the initial state). Explain *why* the graph has its current properties based on the coefficients. For example, if 'c' was changed, explain its effect on the y-intercept. If 'a' was changed, talk about the parabola's width and direction. If 'b' was changed, explain its complex effect on the vertex's position. Keep the feedback encouraging and under 80 words. Address the student directly.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini text API:", error);
        throw new Error("Failed to get AI feedback.");
    }
};