
export interface Coefficients {
  a: number;
  b: number;
  c: number;
}

export interface QuadraticStats {
  discriminant: number;
  vertex: { h: number; k: number };
  roots: number[] | null;
  axisOfSymmetry: number;
  yIntercept: number;
  vertexForm: string;
}

export interface ViewState {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  grid: boolean;
}

export interface QuizState {
    type: 'vertex' | 'rootAt' | 'discriminant' | null;
    target: any | null;
    message: string;
}
