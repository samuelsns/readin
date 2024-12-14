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
            alert("Sorry! Speech recognition is not supported in your browser. Please try using Chrome, Edge, or Safari for the best experience.");
            return;
        }

        const recognition = new SpeechRecognition();
<<<<<<< HEAD
        recognition.continuous = true;  // Keep listening continuously
        recognition.interimResults = true;  // Get results as they happen
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';

        // Track initial detection state
        let isFirstDetection = true;

        recognition.onstart = () => {
            console.log('Recognition started');
            // Set initial detection sensitivity
            if (isFirstDetection) {
                recognition.interimResults = true;
            }
        };

        recognition.onaudiostart = () => {
            // Ensure microphone is fully initialized
            if (isFirstDetection) {
                recognition.stop();
                recognition.start();
                isFirstDetection = false;
            }
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            // Process results immediately without any delays
            const result = event.results[event.results.length - 1];
            if (result) {
                setUserSpeech(result[0].transcript.trim());
=======
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';

        let timeoutId: NodeJS.Timeout;
        
        recognition.onstart = () => {
            console.log('Speech recognition started');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            clearTimeout(timeoutId);
            let transcript = '';
            const results = event.results;
            for (let i = 0; i < results.length; i++) {
                const result = results[i];
                transcript += result[0].transcript + (result.isFinal ? ' ' : '');
>>>>>>> 0071c5a5f7d5da8383357cc41ba3a30716e7f270
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
<<<<<<< HEAD
            // Just restart immediately on any error
            if (isListening && recognitionRef.current) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Error restarting:', e);
                }
            }
        };

        recognition.onend = () => {
            // Immediately restart if we're supposed to be listening
            if (isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Error restarting:', e);
=======
            if (event.error === 'no-speech') {
                // Restart recognition if no speech is detected
                try {
                    recognition.stop();
                    setTimeout(() => {
                        if (isListening) {
                            recognition.start();
                        }
                    }, 100);
                } catch (e) {
                    console.error('Error restarting recognition:', e);
                }
            }
            // Don't set isListening to false on every error
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            console.log('Speech recognition ended');
            // Auto-restart if still supposed to be listening
            if (isListening) {
                try {
                    recognition.start();
                    // Set a timeout to detect long periods of silence
                    timeoutId = setTimeout(() => {
                        if (isListening) {
                            recognition.stop();
                            recognition.start();
                        }
                    }, 10000); // Reset after 10 seconds of silence
                } catch (e) {
                    console.error('Error restarting recognition:', e);
                    setIsListening(false);
>>>>>>> 0071c5a5f7d5da8383357cc41ba3a30716e7f270
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
                // Reset recognition instance for fresh start
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
