
export type DISCKey = 'D' | 'I' | 'S' | 'C';

export interface DISCScore {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface UserInfo {
  name: string;
  email: string;
}

export interface QuestionOption {
  text: string;
  type: DISCKey;
}

export interface QuestionGroup {
  id: number;
  options: QuestionOption[];
}

export interface AssessmentResult {
  id: string;
  userInfo: UserInfo;
  scores: DISCScore;
  responses: {
    most: DISCKey[];
    least: DISCKey[];
  };
  timestamp: string;
  analysis?: string;
}

export enum AppState {
  WELCOME = 'WELCOME',
  USER_INFO = 'USER_INFO',
  TEST = 'TEST',
  CALCULATING = 'CALCULATING',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY'
}
