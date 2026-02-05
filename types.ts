
export interface AnalysisResult {
  executiveSummary: string;
  actionItems: {
    task: string;
    assignee: string;
  }[];
  sentiment: {
    label: 'Positive' | 'Neutral' | 'Negative';
    score: number;
    explanation: string;
  };
  transcription: string;
}

export type AppMode = 'analyzer' | 'audio-generator' | 'crm-generator';

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}
