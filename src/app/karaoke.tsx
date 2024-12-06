/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Configuration options (optional)
recognition.continuous = true; // Keep listening even after a result
recognition.interimResults = true; // Get partial results as the user speaks
recognition.lang = 'en-US'; // Set the language


// Start and stop recognition
function startListening() {
    recognition.start();
}

function stopListening() {
    recognition.stop();
}


function Karaoke() {
    const [textToRead, setTextToRead] = useState('This is the text to read');
    const [userSpeech, setUserSpeech] = useState('');
    const [isListening, setIsListening] = useState(false)

    const recognitionRef = useRef(null); // Store the recognition instance

    useEffect(() => {
        // Initialize SpeechRecognition in useEffect
        recognitionRef.current = recognition;
        // ... (add your configuration options here)

        recognitionRef.current.onresult = (event: any) => {
            let transcript = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                // Check if this result is FINAL or INTERIM
                if (result.isFinal) {
                    transcript += result[0].transcript + ' '; // Add a space after final words
                } else {
                    transcript += result[0].transcript; // Concatenate interim results directly
                }
            }
            console.log("transcript", transcript);
            setUserSpeech(transcript);
        };

        return () => {
            // Clean up on component unmount
            recognitionRef.current?.stop();
        };
    }, []);

    const startReading = () => {
        console.log("start reading");
        recognitionRef.current.start();
    };

    const stopReading = () => {
        console.log("stop reading", recognitionRef.current);
        recognitionRef.current.stop();
    };

    const toggleReading = () => {
        if (isListening) {
          stopReading()
        } else {
          startReading()
        }
        setIsListening(!isListening)
      }

    // ... (Logic to compare userSpeech with textToRead)

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
