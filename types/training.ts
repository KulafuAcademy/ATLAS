export type MinimalPair = {
  id: string;
  soundFocus: string;
  tongueTwister?: {
    note: {
      en: string;
      ja: string;
    };
    text: string;
  };
  wordA: string;
  wordB: string;
};

export type TrainingCategory = {
  id: string;
  title: {
    en: string;
    ja: string;
  };
  description: {
    en: string;
    ja: string;
  };
  examples: string[];
  status: "available" | "planned";
};

export type TrainingProgress = {
  attempts: number;
  bestScore: number;
  lastScore: number;
  total: number;
  updatedAt: string;
};
