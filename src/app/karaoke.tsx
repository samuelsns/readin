/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SpeechRecognitionEvent, SpeechRecognition } from '../types/speechRecognition';

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

function Karaoke() {
    const [textToRead, setTextToRead] = useState('This is the text to read');
    const [userSpeech, setUserSpeech] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    
    useEffect(() => {
        // Initialize SpeechRecognition only once when component mounts
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let transcript = '';
            const results = event.results;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                transcript += result[0].transcript + (result.isFinal ? ' ' : '');
            }
            setUserSpeech(transcript.trim());
        };        

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            if (isListening) {
                recognition.start();
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening]);

    const toggleListening = () => {
        if (!isListening) {
            recognitionRef.current?.start();
        } else {
            recognitionRef.current?.stop();
        }
        setIsListening(!isListening);
    };

    const startReading = () => {
        console.log("start reading");
        if (recognitionRef.current) {
            recognitionRef.current.start();
        }
    };

    const stopReading = () => {
        console.log("stop reading", recognitionRef.current);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    const toggleReading = () => {
        if (isListening) {
          stopReading()
        } else {
          startReading()
        }
        setIsListening(!isListening)
      }

    return (
        <div>
           
            {/* ... (Display feedback based on comparison) */}


            <Card className="w-full max-w-md mx-auto">
                <CardContent className="p-6">
                    <div className="text-lg font-medium mb-4" id="text-to-read">
                        {textToRead}
                    </div>
                    <Button
                        onClick={toggleReading}
                        variant={isListening ? "destructive" : "outline"}
                        className={`w-full flex items-center justify-center gap-2 ${isListening ? 'text-destructive-foreground' : 'text-muted-foreground'
                            }`}
                        aria-label={isListening ? "Stop reading" : "Start reading"}
                    >
                        {isListening ? (
                            <>
                                <MicOff className="h-5 w-5" />
                                Stop Reading
                            </>
                        ) : (
                            <>
                                <Mic className="h-5 w-5" />
                                Start Reading
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default Karaoke;
