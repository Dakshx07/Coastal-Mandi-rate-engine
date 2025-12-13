import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, X, Sparkles, Activity, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getSpecies, getRates } from '../services/storageService';
import { Species, Rate } from '../types';

// Simple Levenshtein distance for fuzzy matching
const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

interface VoiceCommand {
    keywords: string[];
    action: () => void;
    response: string;
    isDynamic?: boolean;
}

export const VoiceAssistant: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const { t } = useLanguage();
    const [isListening, setIsListening] = useState(false);
    const [isActive, setIsActive] = useState(false); // Controls visibility of the bar
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<any>(null);
    const startListeningRef = useRef<() => void>(() => { });

    // Data state
    const [allSpecies, setAllSpecies] = useState<Species[]>([]);
    const [allRates, setAllRates] = useState<Rate[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const species = await getSpecies();
            const rates = await getRates();
            setAllSpecies(species);
            setAllRates(rates);
        };
        loadData();
    }, []);

    const speak = useCallback((text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            // Prioritize Indian English voices for a more friendly, local feel
            const preferredVoice = voices.find(v =>
                v.lang === 'en-IN' ||
                v.name.includes('India') ||
                v.name.includes('Rishi') || // Common Indian voice name
                v.name.includes('Google US English') ||
                v.name.includes('Samantha')
            );
            if (preferredVoice) utterance.voice = preferredVoice;

            // When speech ends, restart listening for follow-up (Conversational Mode)
            utterance.onend = () => {
                if (isActive) {
                    // Use ref to avoid circular dependency
                    startListeningRef.current();
                }
            };

            window.speechSynthesis.speak(utterance);
        }
    }, [isActive]); // Removed startListening from dependencies

    // Synonyms map for better accuracy
    const synonyms: Record<string, string[]> = {
        'seer': ['king fish', 'surmai', 'viswan', 'sagar'],
        'prawns': ['shrimp', 'chemmeen', 'sungat'],
        'mackerel': ['bangda', 'ayala'],
        'pomfret': ['manji', 'paplet'],
        'sardine': ['mathi', 'tarli'],
        'squid': ['calamari', 'koodal', 'bondas']
    };

    // Fuzzy match fish name
    const findFishFuzzy = (query: string): Species | null => {
        const lowerQuery = query.toLowerCase();
        let bestMatch: Species | null = null;
        let minDistance = Infinity;

        // 1. Check Synonyms
        for (const [key, values] of Object.entries(synonyms)) {
            if (values.some(v => lowerQuery.includes(v))) {
                // If synonym found, try to find the main species by key
                const match = allSpecies.find(s =>
                    s.name_en.toLowerCase().includes(key) ||
                    s.name_local.toLowerCase().includes(key)
                );
                if (match) return match;
            }
        }

        // 2. Direct inclusion check
        const exactMatch = allSpecies.find(s =>
            lowerQuery.includes(s.name_en.toLowerCase()) ||
            lowerQuery.includes(s.name_local.toLowerCase())
        );
        if (exactMatch) return exactMatch;

        // 3. Fuzzy match
        const queryWords = lowerQuery.split(' ');
        allSpecies.forEach(species => {
            const targetWords = [...species.name_en.toLowerCase().split(' '), ...species.name_local.toLowerCase().split(' ')];
            queryWords.forEach(qWord => {
                if (qWord.length < 3) return;
                targetWords.forEach(tWord => {
                    const dist = levenshteinDistance(qWord, tWord);
                    const threshold = tWord.length > 5 ? 2 : 1;
                    if (dist <= threshold && dist < minDistance) {
                        minDistance = dist;
                        bestMatch = species;
                    }
                });
            });
        });

        return bestMatch;
    };

    const handlePriceQuery = (text: string) => {
        const foundSpecies = findFishFuzzy(text);

        if (foundSpecies) {
            const speciesRates = allRates.filter(r => r.species_id === foundSpecies.id);
            speciesRates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (speciesRates.length > 0) {
                const price = speciesRates[0].price_per_kg;
                const msg = `${foundSpecies.name_en} is ₹${price} today.`;
                setResponse(msg);
                speak(msg);
                navigate('/home');
            } else {
                const msg = `No rates found for ${foundSpecies.name_en} today.`;
                setResponse(msg);
                speak(msg);
            }
        } else {
            const msg = "I didn't catch that fish name. Could you say it again?";
            setResponse(msg);
            speak(msg);
        }
    };

    const handleAddToCart = (text: string) => {
        const foundSpecies = findFishFuzzy(text);

        if (foundSpecies) {
            // Add to cart logic
            const currentCart = JSON.parse(localStorage.getItem('coastal_mandi_cart') || '[]');
            if (!currentCart.includes(foundSpecies.id)) {
                const updatedCart = [...currentCart, foundSpecies.id];
                localStorage.setItem('coastal_mandi_cart', JSON.stringify(updatedCart));
                // Dispatch event for UserView to pick up
                window.dispatchEvent(new Event('cartUpdated'));

                const msg = `Added ${foundSpecies.name_en} to your cart.`;
                setResponse(msg);
                speak(msg);
                navigate('/home');
            } else {
                const msg = `${foundSpecies.name_en} is already in your cart.`;
                setResponse(msg);
                speak(msg);
            }
        } else {
            const msg = "Which fish do you want to add? Try saying 'Add Seer Fish to cart'.";
            setResponse(msg);
            speak(msg);
        }
    };

    const matchCommand = useCallback((text: string): VoiceCommand | null => {
        const lowerText = text.toLowerCase().trim();

        // Wake word check: "Sagar"
        // If user says ONLY "Sagar", respond "Yes?"
        if (lowerText === 'sagar' || lowerText === 'hi sagar' || lowerText === 'hello sagar') {
            return {
                keywords: [],
                action: () => { }, // Just stay listening
                response: 'Yes? I am listening.',
                isDynamic: false
            };
        }

        // If user says "Sagar [command]", strip "Sagar" and process command
        const cleanText = lowerText.replace(/^sagar\s+/, '').trim();

        if (cleanText.includes('price') || cleanText.includes('rate') || cleanText.includes('cost') || cleanText.includes('much')) {
            return {
                keywords: [],
                action: () => handlePriceQuery(cleanText),
                response: 'Checking...',
                isDynamic: true
            };
        }

        if (cleanText.includes('add') && (cleanText.includes('cart') || cleanText.includes('buy') || cleanText.includes('list'))) {
            return {
                keywords: [],
                action: () => handleAddToCart(cleanText),
                response: 'Adding to cart...',
                isDynamic: true
            };
        }

        const commandDefinitions: VoiceCommand[] = [
            // Deep Navigation for Admin
            { keywords: ['admin manage', 'manage tab'], action: () => navigate('/admin', { state: { tab: 'manage' } }), response: 'Opening Manage Tab' },
            { keywords: ['admin history', 'history tab'], action: () => navigate('/admin', { state: { tab: 'history' } }), response: 'Opening History Tab' },
            { keywords: ['admin bulk', 'bulk upload'], action: () => navigate('/admin', { state: { tab: 'bulk' } }), response: 'Opening Bulk Upload' },
            { keywords: ['admin'], action: () => navigate('/admin'), response: 'Opening Admin' },

            { keywords: ['home', 'main'], action: () => navigate('/home'), response: 'Going Home' },
            { keywords: ['settings', 'config'], action: () => navigate('/settings'), response: 'Opening Settings' },
            { keywords: ['back', 'return'], action: () => navigate(-1), response: 'Going back' },
            { keywords: ['logout', 'sign out'], action: async () => { await logout(); navigate('/'); }, response: 'Goodbye!' },
            { keywords: ['refresh', 'reload'], action: () => window.location.reload(), response: 'Refreshing' },
            { keywords: ['calculator'], action: () => { navigate('/home'); setTimeout(() => window.dispatchEvent(new CustomEvent('openCalculator')), 500); }, response: 'Calculator opened' },
            { keywords: ['subscribe', 'premium'], action: () => { navigate('/home'); setTimeout(() => window.dispatchEvent(new CustomEvent('openSubscription')), 500); }, response: 'Showing plans' },
            { keywords: ['dark mode'], action: () => { document.documentElement.classList.add('dark'); localStorage.setItem('coastal_mandi_theme', 'dark'); }, response: 'Dark mode on' },
            { keywords: ['light mode'], action: () => { document.documentElement.classList.remove('dark'); localStorage.setItem('coastal_mandi_theme', 'light'); }, response: 'Light mode on' },
            { keywords: ['help'], action: () => { }, response: 'Ask me about fish prices or navigation.' }
        ];

        for (const command of commandDefinitions) {
            if (command.keywords.some(k => cleanText.includes(k))) return command;
        }
        return null;
    }, [navigate, logout, allSpecies, allRates, handleAddToCart, handlePriceQuery]);

    const startListening = useCallback(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return;
        }

        // Stop any existing recognition
        if (recognitionRef.current) recognitionRef.current.stop();

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
            setIsListening(true);
            // Clear silence timer
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            // Set a new silence timer to close if no speech for 8 seconds
            silenceTimerRef.current = setTimeout(() => {
                setIsListening(false);
                if (recognitionRef.current) recognitionRef.current.stop();
            }, 8000);
        };

        recognition.onresult = (event: any) => {
            // Reset silence timer on speech
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
                setIsListening(false);
                if (recognitionRef.current) recognitionRef.current.stop();
            }, 5000);

            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                else setTranscript(event.results[i][0].transcript);
            }

            if (finalTranscript) {
                setTranscript(finalTranscript);
                const command = matchCommand(finalTranscript);
                if (command) {
                    if (!command.isDynamic) {
                        setResponse(command.response);
                        speak(command.response);
                    }
                    setTimeout(() => command.action(), 500);
                } else {
                    // Try to interpret as a fish name directly if no command matched
                    handlePriceQuery(finalTranscript);
                }
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [matchCommand, speak, handlePriceQuery]);

    const toggleAssistant = () => {
        if (isActive) {
            if (recognitionRef.current) recognitionRef.current.stop();
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            setIsActive(false);
            setIsListening(false);
        } else {
            setIsActive(true);
            startListening();
        }
    };

    // Manual tap to speak in expanded mode
    const handleManualListen = () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        startListening();
    };

    // Hide on Intro/Auth pages
    if (['/', '/login', '/signup'].includes(location.pathname)) {
        return null;
    }

    return (
        <>
            {/* Main Trigger Button - Compact FAB, above bottom nav */}
            <div className={`fixed bottom-[88px] right-[60px] z-[100] transition-all duration-500 ${isActive ? 'opacity-0 scale-0 pointer-events-none' : 'opacity-100 scale-100'}`}>
                <button
                    onClick={toggleAssistant}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
                    aria-label="Voice Assistant"
                >
                    <Mic className="w-5 h-5" />
                </button>
            </div>

            {/* Dynamic Island / Waveform Bar - Visible when active */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
                <div className="bg-black/90 dark:bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md">

                    {/* Visualizer / Tap to Speak */}
                    <button
                        onClick={handleManualListen}
                        className="relative flex items-center justify-center w-12 h-8 shrink-0 hover:scale-110 transition-transform"
                    >
                        {isListening ? (
                            <div className="flex gap-1 items-center h-full">
                                <div className="w-1 bg-blue-400 rounded-full animate-wave" style={{ animationDelay: '0s' }} />
                                <div className="w-1 bg-indigo-400 rounded-full animate-wave" style={{ animationDelay: '0.1s' }} />
                                <div className="w-1 bg-purple-400 rounded-full animate-wave" style={{ animationDelay: '0.2s' }} />
                                <div className="w-1 bg-blue-400 rounded-full animate-wave" style={{ animationDelay: '0.3s' }} />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                                <Mic className="w-5 h-5 text-blue-400" />
                            </div>
                        )}
                    </button>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={handleManualListen}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                            {isListening ? t('voice.listening') : t('voice.tap_to_speak')}
                        </p>
                        <p className="text-sm font-medium text-white truncate">
                            {response || transcript || t('voice.hint')}
                        </p>
                    </div>

                    {/* Close Action */}
                    <button
                        onClick={toggleAssistant}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors shrink-0"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes wave {
                    0%, 100% { height: 30%; }
                    50% { height: 100%; }
                }
                .animate-wave {
                    animation: wave 1s ease-in-out infinite;
                }
            `}</style>
        </>
    );
};
