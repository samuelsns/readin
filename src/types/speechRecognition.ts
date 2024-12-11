export interface SpeechRecognitionEvent {
    results: {
        [index: number]: {
            0: {
                transcript: string;
            };
            isFinal: boolean;
            length: number;
        };
        length: number;
    };
    resultIndex: number;
}

export interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}
