import {useState, useEffect, useRef} from "react";

export function useSpeechRecognition({lang = 'en-IN', onResult}) {
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = lang;
        recognition.onresult = event => {
            const transcript = Array.from(event.results)
                .map(r => r[0].transcript)
                .join('');
            onResult(transcript);
        };
        recognition.onerror = e => console.error('Speech recognition error', e.error);
        recognitionRef.current = recognition;
    }, [lang, onResult]);

    const start = () => {
        if (recognitionRef.current) recognitionRef.current.start();
    };
    const stop = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
    };

    return {start, stop};
}