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
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech recognition is not supported in this browser.");
            alert("Sorry! Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari for the best experience.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';

        // Track initial detection state
        let isFirstDetection = true;
        let microphoneInitialized = false;

        // Initialize microphone immediately
        if (!microphoneInitialized) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    microphoneInitialized = true;
                })
                .catch(error => console.error('Microphone access error:', error));
        }

        recognition.onstart = () => {
            console.log('Recognition started');
            if (isFirstDetection) {
                // Force high sensitivity for first detection
                recognition.interimResults = true;
            }
        };

        recognition.onaudiostart = () => {
            if (isFirstDetection && microphoneInitialized) {
                // Quick restart for better initial pickup
                recognition.stop();
                requestAnimationFrame(() => {
                    try {
                        recognition.start();
                        isFirstDetection = false;
                    } catch (e) {
                        console.error('Quick restart error:', e);
                    }
                });
            }
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[event.results.length - 1];
            if (result) {
                const bestMatch = Array.from(result)
                    .sort((a, b) => b.confidence - a.confidence)[0];
                setUserSpeech(bestMatch.transcript.trim());
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            
            if (isListening && recognitionRef.current) {
                if (restartCount < MAX_RESTART_ATTEMPTS) {
                    const backoffDelay = Math.min(100 * Math.pow(2, restartCount), 1000);
                    setTimeout(() => {
                        try {
                            recognition.start();
                            restartCount++;
                        } catch (e) {
                            console.error('Error in restart attempt:', e);
                        }
                    }, backoffDelay);
                } else {
                    restartCount = 0;
                    isFirstDetection = true;
                    setIsListening(false);
                }
            }
        };

        recognition.onend = () => {
            const timeSinceLastResult = Date.now() - lastResultTimestamp;
            
            if (isListening) {
                try {
                    if (timeSinceLastResult > 5000) { 
                        isFirstDetection = true; 
                    }
                    recognition.start();
                } catch (e) {
                    console.error('Error restarting:', e);
                    setIsListening(false);
                }
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
            if (recognitionRef.current) {
                recognitionRef.current.abort();
                setTimeout(() => {
                    recognitionRef.current?.start();
                }, 100);
            }
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
