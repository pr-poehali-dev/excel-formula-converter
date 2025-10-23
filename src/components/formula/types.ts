export interface FunctionInfo {
  name: string;
  description: string;
}

export interface FormulaResult {
  formula: string;
  explanation: string;
  functions: FunctionInfo[];
  cellUpdates?: Array<{ cell: string; value: string | number }>;
}

export interface HistoryItem {
  id: string;
  query: string;
  formula: string;
  explanation: string;
  functions: FunctionInfo[];
  timestamp: number;
}