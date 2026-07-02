export type MinimalPair = {
  id: string;
  soundFocus: string;
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
