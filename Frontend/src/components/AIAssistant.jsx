import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaLightbulb } from 'react-icons/fa';
import './AIAssistant.css';

const AIAssistant = ({ isOpen, onClose, isMicOn }) => {
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const transcriptBufferRef = useRef('');

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech Recognition API not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            setIsListening(false);
            // Restart if still open and mic is on
            if (isOpen && isMicOn) {
                recognition.start();
            }
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final += event.results[i][0].transcript + ' ';
                } else {
                    interim += event.results[i][0].transcript;
                }
            }

            if (final) {
                setTranscript(prev => (prev + final).slice(-500)); // Keep last 500 chars
                transcriptBufferRef.current += final;

                // Trigger AI suggestions if buffer is large enough (e.g., > 60 chars)
                if (transcriptBufferRef.current.length > 60) {
                    fetchSuggestions(transcriptBufferRef.current);
                    transcriptBufferRef.current = '';
                }
            }
            setInterimTranscript(interim);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (isOpen && isMicOn) {
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error("Speech recognition start error:", e);
            }
        } else {
            recognitionRef.current?.stop();
        }
    }, [isOpen, isMicOn]);

    const fetchSuggestions = async (text) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/suggest`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ transcript: text })
            });
            const data = await res.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            }
        } catch (err) {
            console.error("Failed to fetch suggestions:", err);
        }
    };

    return (
        <div className={`ai-assistant-tray ${isOpen ? 'open' : 'closed'}`}>
            <div className="ai-header">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <FaRobot className="text-blue-500" size={18} />
                        <span className="font-bold text-xs uppercase tracking-widest text-white/90">Chroma AI Assistant</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-all text-white/40">
                        <FaTimes size={14} />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`ai-status-dot ${isListening ? 'listening' : ''}`} />
                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">
                        {isListening ? 'Listening...' : 'Waiting for mic'}
                    </span>
                </div>
            </div>

            <div className="ai-content custom-scrollbar">
                <div className="transcript-section">
                    <h3>Live Transcript</h3>
                    <div className="live-transcript">
                        {transcript}
                        <span className="text-white/40">{interimTranscript}</span>
                        {!transcript && !interimTranscript && "Speak to see transcription..."}
                    </div>
                </div>

                <div className="suggestions-section">
                    <h3>AI Suggestions</h3>
                    <div className="ai-suggestions-list">
                        {suggestions ? (
                            <div className="suggestion-card">
                                <div className="flex items-start gap-3">
                                    <FaLightbulb className="text-yellow-400 mt-1 shrink-0" size={16} />
                                    <div className="whitespace-pre-wrap">{suggestions}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-[11px] text-white/20 text-center py-4 border border-dashed border-white/10 rounded-xl">
                                Analysis will appear here
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;
