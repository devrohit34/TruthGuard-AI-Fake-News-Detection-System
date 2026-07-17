export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  input_text: string;
  title: string | null;
  label: 'Fake' | 'Real';
  confidence: number;
  prob_fake: number;
  prob_real: number;
  suspicious_words: string[] | null;
  explanation: string | null;
  source: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminLog {
  id: string;
  admin_id: string | null;
  action: string;
  detail: string | null;
  created_at: string;
}

export interface FakeIndicator {
  category: string;
  description: string;
  weight: number;
  triggered: boolean;
}

export interface DetectionResult {
  label: 'Fake' | 'Real';
  confidence: number;
  probFake: number;
  probReal: number;
  suspiciousWords: { word: string; score: number }[];
  explanation: string;
  processedTokens: number;
  demoMode: boolean;
  indicators: FakeIndicator[];
}
