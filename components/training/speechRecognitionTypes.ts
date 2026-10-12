export type BrowserSpeechRecognitionConstructor =
  new () => BrowserSpeechRecognition;

export type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  abort: () => void;
  start: () => void;
  stop: () => void;
  onend: (() => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onnomatch: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionResultEvent) => void) | null;
};

export type BrowserSpeechRecognitionErrorEvent = Event & {
  error?: string;
};

export type BrowserSpeechRecognitionResultEvent = Event & {
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitAudioContext?: typeof AudioContext;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}
