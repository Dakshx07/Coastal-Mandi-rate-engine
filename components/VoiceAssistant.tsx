import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';

interface VoiceCommand {
    patterns: string[];
    action: () => void;
    response: string;
}

export const VoiceAssistant: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isListening, setIsListening] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    // Define voice commands with navigation - includes single words and phrases
    const commands: VoiceCommand[] = [
        {
            patterns: ['admin', 'go to admin', 'open admin', 'admin panel', 'admin page', 'show admin', 'navigate to admin'],
            action: () => navigate('/admin'),
            response: 'Opening Admin Panel'
        },
        {
            patterns: ['home', 'go to home', 'go home', 'open home', 'home page', 'show home', 'main page', 'main', 'navigate to home'],
            action: () => navigate('/home'),
            response: 'Going to Home'
        },
        {
            patterns: ['settings', 'setting', 'go to settings', 'open settings', 'settings page', 'show settings', 'navigate to settings', 'preferences'],
            action: () => navigate('/settings'),
            response: 'Opening Settings'
        },
        {
            patterns: ['back', 'go back', 'previous', 'previous page', 'go previous', 'navigate back'],
            action: () => navigate(-1),
            response: 'Going back'
        },
        {
            patterns: ['logout', 'log out', 'sign out', 'signout', 'exit', 'leave'],
            action: () => navigate('/'),
            response: 'Logging out'
        },
        {
            patterns: ['help', 'what can you do', 'commands', 'show commands', 'options', 'what can i say'],
            action: () => setResponse('You can say: Admin, Home, Settings, Back, Logout, Refresh, or Help'),
            response: 'Here are the available commands'
        },
        {
            patterns: ['refresh', 'reload', 'refresh page', 'reload page'],
            action: () => window.location.reload(),
            response: 'Refreshing the page'
        },
        {
            patterns: ['subscribe', 'subscription', 'premium', 'upgrade'],
            action: () => { navigate('/home'); setResponse('Please click on any fish card to see subscription options.'); },
            response: 'Opening subscription options'
        }
    ];

    // Speak the response using Text-to-Speech
    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            // Try to use a female voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google'));
            if (preferredVoice) utterance.voice = preferredVoice;
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    // Process the voice command
    const processCommand = useCallback((text: string) => {
        const lowerText = text.toLowerCase().trim();

        for (const command of commands) {
            for (const pattern of command.patterns) {
                if (lowerText.includes(pattern)) {
                    setResponse(command.response);
                    speak(command.response);
                    setTimeout(() => {
                        command.action();
                    }, 500);
                    return true;
                }
            }
        }

        // No matching command
        const notFoundMsg = `Sorry, I didn't understand "${text}". Say "Help" for available commands.`;
        setResponse(notFoundMsg);
        speak(notFoundMsg);
        return false;
    }, [commands, speak, navigate]);

    // Start listening
    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Voice input not supported in this browser. Please use Chrome.');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Optimized for Indian English

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            setResponse('');
            setTranscript('Listening...');
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                processCommand(finalTranscript);
            } else if (interimTranscript) {
                setTranscript(interimTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'no-speech') {
                setError('No speech detected. Please try again.');
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied. Please allow microphone access.');
            } else {
                setError('Could not hear you. Try again.');
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [processCommand]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    // Toggle listening
    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            setIsExpanded(true);
            startListening();
        }
    };

    // Close the expanded view
    const handleClose = () => {
        stopListening();
        setIsExpanded(false);
        setTranscript('');
        setResponse('');
        setError(null);
    };

    // Greet on first expand
    useEffect(() => {
        if (isExpanded && !isListening && !transcript && !response) {
            const greeting = 'Hi! I\'m your voice assistant. How can I help you?';
            setResponse(greeting);
            speak(greeting);
        }
    }, [isExpanded]);

    return (
        <>
            {/* Floating Voice Button */}
            <button
                onClick={toggleListening}
                className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${isListening
                    ? 'bg-red-500 animate-pulse shadow-red-500/50'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                    }`}
                title="Voice Assistant"
            >
                {isListening ? (
                    <MicOff className="w-6 h-6 text-white" />
                ) : (
                    <Mic className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Expanded Voice Panel */}
            {isExpanded && (
                <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
                    <div
                        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden pointer-events-auto animate-slide-up-spring mb-20"
                        style={{ boxShadow: '0 -10px 40px rgba(0,0,0,0.15)' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ${isListening ? 'animate-pulse' : ''}`}>
                                    <Volume2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">Voice Assistant</h3>
                                    <p className="text-white/70 text-xs">
                                        {isListening ? 'Listening...' : 'Tap mic to speak'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5 space-y-4">
                            {/* Transcript */}
                            {transcript && (
                                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">You said:</p>
                                    <p className="text-slate-800 dark:text-white font-bold">{transcript}</p>
                                </div>
                            )}

                            {/* Response */}
                            {response && (
                                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Assistant:</p>
                                    <p className="text-blue-800 dark:text-blue-200 font-bold">{response}</p>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/30 rounded-2xl p-4 border border-red-100 dark:border-red-800">
                                    <p className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</p>
                                </div>
                            )}

                            {/* Mic Button */}
                            <div className="flex justify-center pt-2">
                                <button
                                    onClick={toggleListening}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 ${isListening
                                        ? 'bg-red-500 shadow-lg shadow-red-500/30 animate-pulse'
                                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'
                                        }`}
                                >
                                    {isListening ? (
                                        <MicOff className="w-7 h-7 text-white" />
                                    ) : (
                                        <Mic className="w-7 h-7 text-white" />
                                    )}
                                </button>
                            </div>

                            {/* Quick Commands */}
                            <div className="pt-2">
                                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold text-center mb-2">Try saying:</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {['Admin', 'Home', 'Settings', 'Back', 'Help'].map((cmd) => (
                                        <span
                                            key={cmd}
                                            className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full font-bold"
                                        >
                                            "{cmd}"
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
