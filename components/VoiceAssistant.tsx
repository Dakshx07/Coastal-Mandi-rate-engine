import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface VoiceCommand {
    keywords: string[];  // Keywords that must be present
    action: () => void;
    response: string;
}

export const VoiceAssistant: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [isListening, setIsListening] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    // Smart command matching - checks if any keyword is present
    const matchCommand = useCallback((text: string): VoiceCommand | null => {
        const lowerText = text.toLowerCase().trim();

        // Define commands with flexible keyword matching
        const commandDefinitions: VoiceCommand[] = [
            // ADMIN - matches: "admin", "go to admin", "navigate me to admin panel", "open admin page", etc.
            {
                keywords: ['admin'],
                action: () => navigate('/admin'),
                response: 'Opening Admin Panel'
            },
            // HOME - matches: "home", "go home", "take me home", "navigate to home page", etc.
            {
                keywords: ['home', 'main page'],
                action: () => navigate('/home'),
                response: 'Going to Home'
            },
            // SETTINGS - matches: "settings", "open settings", "go to settings page", etc.
            {
                keywords: ['settings', 'setting', 'preferences'],
                action: () => navigate('/settings'),
                response: 'Opening Settings'
            },
            // BACK - matches: "back", "go back", "previous", "navigate back", etc.
            {
                keywords: ['back', 'previous'],
                action: () => navigate(-1),
                response: 'Going back'
            },
            // LOGOUT - ACTUALLY logs out
            {
                keywords: ['logout', 'log out', 'sign out', 'signout'],
                action: async () => {
                    await logout();
                    navigate('/');
                },
                response: 'Signing you out. Goodbye!'
            },
            // HELP
            {
                keywords: ['help', 'commands', 'what can you do', 'options'],
                action: () => { },
                response: 'You can say: Admin, Home, Settings, Back, Logout, Calculator, Subscribe, Dark Mode, Light Mode, Refresh, or Help'
            },
            // REFRESH
            {
                keywords: ['refresh', 'reload'],
                action: () => setTimeout(() => window.location.reload(), 1000),
                response: 'Refreshing the page'
            },
            // CALCULATOR
            {
                keywords: ['calculator', 'calculate', 'catch calculator'],
                action: () => {
                    navigate('/home');
                    // Trigger calculator open via custom event
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('openCalculator'));
                    }, 500);
                },
                response: 'Opening Calculator'
            },
            // SUBSCRIBE / PREMIUM
            {
                keywords: ['subscribe', 'subscription', 'premium', 'upgrade', 'plan'],
                action: () => {
                    navigate('/home');
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('openSubscription'));
                    }, 500);
                },
                response: 'Opening subscription options. Please click on any fish card to subscribe.'
            },
            // DARK MODE
            {
                keywords: ['dark mode', 'dark theme', 'night mode'],
                action: () => {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('coastal_mandi_theme', 'dark');
                },
                response: 'Switching to dark mode'
            },
            // LIGHT MODE
            {
                keywords: ['light mode', 'light theme', 'day mode'],
                action: () => {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('coastal_mandi_theme', 'light');
                },
                response: 'Switching to light mode'
            },
            // SCROLL UP
            {
                keywords: ['scroll up', 'go up', 'top'],
                action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
                response: 'Scrolling to top'
            },
            // SCROLL DOWN
            {
                keywords: ['scroll down', 'go down', 'bottom'],
                action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
                response: 'Scrolling down'
            },
            // WHERE AM I
            {
                keywords: ['where am i', 'current page', 'which page'],
                action: () => { },
                response: `You are on the ${location.pathname.replace('/', '') || 'home'} page`
            },
            // THANK YOU / GOODBYE
            {
                keywords: ['thank you', 'thanks', 'goodbye', 'bye'],
                action: () => setIsExpanded(false),
                response: 'You\'re welcome! Happy fishing!'
            },
            // HELLO / HI
            {
                keywords: ['hello', 'hi', 'hey'],
                action: () => { },
                response: 'Hello! I\'m your Coastal Mandi assistant. How can I help you today?'
            }
        ];

        // Check each command for keyword match
        for (const command of commandDefinitions) {
            for (const keyword of command.keywords) {
                if (lowerText.includes(keyword)) {
                    return command;
                }
            }
        }

        return null;
    }, [navigate, logout, location.pathname]);

    // Speak the response using Text-to-Speech
    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 0.8;

            // Try to use a good voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v =>
                v.name.includes('Samantha') ||
                v.name.includes('Google') ||
                v.name.includes('Female') ||
                v.lang.includes('en')
            );
            if (preferredVoice) utterance.voice = preferredVoice;

            window.speechSynthesis.speak(utterance);
        }
    }, []);

    // Process the voice command
    const processCommand = useCallback((text: string) => {
        const command = matchCommand(text);

        if (command) {
            setResponse(command.response);
            speak(command.response);

            // Execute the action after a short delay for smooth UX
            setTimeout(() => {
                command.action();
            }, 300);
            return true;
        }

        // No matching command - give helpful response
        const notFoundMsg = `I heard "${text}". Try saying "Admin", "Home", "Settings", or "Help" for more options.`;
        setResponse(notFoundMsg);
        speak(notFoundMsg);
        return false;
    }, [matchCommand, speak]);

    // Start listening
    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Voice input not supported. Please use Chrome.');
            speak('Voice input is not supported in this browser. Please use Chrome.');
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

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
                speak('I couldn\'t hear you. Please try again.');
            } else if (event.error === 'not-allowed') {
                setError('Microphone access denied.');
                speak('Please allow microphone access to use voice commands.');
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
    }, [processCommand, speak]);

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
            const greeting = 'Hi! I\'m your Coastal Mandi assistant. How can I help you?';
            setResponse(greeting);
            speak(greeting);
        }
    }, [isExpanded, isListening, transcript, response, speak]);

    return (
        <>
            {/* Floating Voice Button */}
            <button
                onClick={toggleListening}
                className={`fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${isListening
                        ? 'bg-red-500 animate-pulse shadow-red-500/50'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                    }`}
                title="Voice Assistant - Click to speak"
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
                                        {isListening ? '🎤 Listening...' : 'Tap mic to speak'}
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
                                    {['Admin', 'Home', 'Settings', 'Dark Mode', 'Logout', 'Help'].map((cmd) => (
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
