import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'ml' | 'kn';

interface Translations {
    [key: string]: {
        [key in Language]: string;
    };
}

const translations: Translations = {
    'hero.title': {
        en: 'The Future of Market Rates',
        hi: 'बाजार भाव का भविष्य',
        ml: 'വിപണി നിരക്കുകളുടെ ഭാവി',
        kn: 'ಮಾರುಕಟ್ಟೆ ದರಗಳ ಭವಿಷ್ಯ'
    },
    'hero.subtitle': {
        en: 'Empowering fishermen with real-time data, AI predictions, and trusted pricing.',
        hi: 'मछुआरों को रीयल-टाइम डेटा, AI भविष्यवाणियों और विश्वसनीय मूल्य निर्धारण के साथ सशक्त बनाना।',
        ml: 'തത്സമയ വിവരങ്ങൾ, AI പ്രവചനങ്ങൾ, വിശ്വസനീയമായ വിലനിർണ്ണയം എന്നിവയിലൂടെ മത്സ്യത്തൊഴിലാളികളെ ശാക്തീകരിക്കുന്നു.',
        kn: 'ನೈಜ-ಸಮಯದ ಡೇಟಾ, AI ಮುನ್ಸೂಚನೆಗಳು ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಬೆಲೆಗಳೊಂದಿಗೆ ಮೀನುಗಾರರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು.'
    },
    'btn.getStarted': {
        en: 'Get Started',
        hi: 'शुरू करें',
        ml: 'തുടങ്ങാം',
        kn: 'ಪ್ರಾರಂಭಿಸಿ'
    },
    'btn.login': {
        en: 'I have an account',
        hi: 'मेरा खाता है',
        ml: 'എനിക്ക് അക്കൗണ്ട് ഉണ്ട്',
        kn: 'ನನಗೆ ಖಾತೆ ಇದೆ'
    },
    'nav.home': {
        en: 'Home',
        hi: 'घर',
        ml: 'ഹോം',
        kn: 'ಮನೆ'
    },
    'nav.rates': {
        en: 'Rates',
        hi: 'भाव',
        ml: 'നിരക്കുകൾ',
        kn: 'ದರಗಳು'
    },
    'nav.compare': {
        en: 'Compare',
        hi: 'तुलना',
        ml: 'താരതമ്യം',
        kn: 'ಹೋಲಿಕೆ'
    },
    'nav.insights': {
        en: 'Insights',
        hi: 'अंतर्दृष्टि',
        ml: 'വിവരങ്ങൾ',
        kn: 'ಒಳನೋಟಗಳು'
    },
    'app.title': {
        en: 'COASTAL MANDI',
        hi: 'कोस्टल मंडी',
        ml: 'കോസ്റ്റൽ മണ്ടി',
        kn: 'ಕರಾವಳಿ ಮಂಡಿ'
    },
    'rates.today': {
        en: "Today's Rates",
        hi: "आज के भाव",
        ml: "ഇന്നത്തെ നിരക്കുകൾ",
        kn: "ಇಂದಿನ ದರಗಳು"
    },
    'rates.species_listed': {
        en: 'Species Listed',
        hi: 'प्रजातियां सूचीबद्ध',
        ml: 'ഇനങ്ങൾ',
        kn: 'ಪಟ್ಟಿ ಮಾಡಲಾದ ಪ್ರಭೇದಗಳು'
    },
    'rates.subscribe': {
        en: 'Subscribe to WhatsApp',
        hi: 'व्हाट्सएप पर सब्सक्राइब करें',
        ml: 'വാട്ട്‌സ്ആപ്പിൽ സബ്‌സ്‌ക്രൈബ് ചെയ്യുക',
        kn: 'ವಾಟ್ಸಾಪ್‌ಗೆ ಚಂದಾದಾರರಾಗಿ'
    },
    'rates.alerts': {
        en: 'Alerts',
        hi: 'अलर्ट',
        ml: 'അറിയിപ്പുകൾ',
        kn: 'ಎಚ್ಚರಿಕೆಗಳು'
    },
    'compare.title': {
        en: 'Compare Markets',
        hi: 'बाजारों की तुलना करें',
        ml: 'വിപണികൾ താരതമ്യം ചെയ്യുക',
        kn: 'ಮಾರುಕಟ್ಟೆಗಳನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ'
    },
    'compare.subtitle': {
        en: 'Check price differences between mandis instantly.',
        hi: 'मंडियों के बीच मूल्य अंतर तुरंत जांचें।',
        ml: 'വിപണികൾ തമ്മിലുള്ള വില വ്യത്യാസം പരിശോധിക്കുക.',
        kn: 'ಮಂಡಿಗಳ ನಡುವಿನ ಬೆಲೆ ವ್ಯತ್ಯಾಸಗಳನ್ನು ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ.'
    },
    'insights.title': {
        en: 'Market Oracle',
        hi: 'मार्केट ओरेकल',
        ml: 'മാർക്കറ്റ് ഒറാക്കിൾ',
        kn: 'ಮಾರುಕಟ್ಟೆ ಒರಾಕಲ್'
    },
    'insights.subtitle': {
        en: 'AI-powered analysis and daily predictions.',
        hi: 'AI-संचालित विश्लेषण और दैनिक भविष्यवाणियां।',
        ml: 'AI അധിഷ്ഠಿತ വിശകലനവും പ്രവചനങ്ങളും.',
        kn: 'AI-ಚಾಲಿತ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ದೈನಂದಿನ ಮುನ್ಸೂಚನೆಗಳು.'
    },
    'insights.daily_analysis': {
        en: 'Daily Analysis',
        hi: 'दैनिक विश्लेषण',
        ml: 'ദിവസേനയുള്ള വിശകലനം',
        kn: 'ದೈನಂದಿನ ವಿಶ್ಲೇಷಣೆ'
    },
    'insights.analyze_btn': {
        en: "Analyze Today's Market",
        hi: "आज के बाजार का विश्लेषण करें",
        ml: "ഇന്നത്തെ വിപണി വിശകലനം ചെയ്യുക",
        kn: "ಇಂದಿನ ಮಾರುಕಟ್ಟೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ"
    },
    'insights.generating': {
        en: 'Generating Analysis...',
        hi: 'विश्लेषण किया जा रहा है...',
        ml: 'വിശകലനം സൃഷ്ടിക്കുന്നു...',
        kn: 'ವಿಶ್ಲೇಷಣೆ ರಚಿಸಲಾಗುತ್ತಿದೆ...'
    },
    'common.settings': {
        en: 'Settings',
        hi: 'सेटिंग्स',
        ml: 'ക്രമീകരണങ്ങൾ',
        kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು'
    },
    'common.login': {
        en: 'Login',
        hi: 'लॉग इन',
        ml: 'ലോഗിൻ',
        kn: 'ಲಾಗಿನ್'
    },
    'search.placeholder': {
        en: 'Search species (e.g. Sardine, Mathi)...',
        hi: 'प्रजातियां खोजें (जैसे सार्डिन, मथी)...',
        ml: 'മീനുകൾ തിരയുക (ഉദാ. മത്തി)...',
        kn: 'ಮೀನುಗಳನ್ನು ಹುಡುಕಿ (ಉದಾ. ಬೂತಾಯಿ)...'
    },
    'detail.current_rate': {
        en: 'Current Market Rate',
        hi: 'वर्तमान बाजार भाव',
        ml: 'നിലവിലെ വിപണി നിരക്ക്',
        kn: 'ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ದರ'
    },
    'detail.share_whatsapp': {
        en: 'Share Deal on WhatsApp',
        hi: 'व्हाट्सएप पर शेयर करें',
        ml: 'വാട്ട്‌സ്ആപ്പിൽ പങ്കിടുക',
        kn: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ'
    },
    'ai.generating_forecast': {
        en: 'Generating AI Forecast',
        hi: 'AI पूर्वानुमान बना रहा है',
        ml: 'AI പ്രവചനം തയ്യാറാക്കുന്നു',
        kn: 'AI ಮುನ್ಸೂಚನೆ ರಚಿಸಲಾಗುತ್ತಿದೆ'
    },
    'ai.analyzing': {
        en: 'Analyzing historical trends & market signals...',
        hi: 'ऐतिहासिक रुझानों का विश्लेषण...',
        ml: 'വിപണി പ്രവണതകൾ വിശകലനം ചെയ്യുന്നു...',
        kn: 'ಮಾರುಕಟ್ಟೆ ಪ್ರವೃತ್ತಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...'
    },
    'ai.forecast_title': {
        en: 'AI Market Forecast',
        hi: 'AI बाजार पूर्वानुमान',
        ml: 'AI വിപണി പ്രവചനം',
        kn: 'AI ಮಾರುಕಟ್ಟೆ ಮುನ್ಸೂಚನೆ'
    },
    'stats.trend': {
        en: 'Trend',
        hi: 'रुझान',
        ml: 'പ്രവണത',
        kn: 'ಪ್ರವೃತ್ತಿ'
    },
    'stats.target_price': {
        en: 'Target Price',
        hi: 'लक्ष्य मूल्य',
        ml: 'ലക്ഷ്യ വില',
        kn: 'ಗುರಿ ಬೆಲೆ'
    },
    'stats.bullish': {
        en: 'Bullish',
        hi: 'तेजी',
        ml: 'മുന്നേറ്റം',
        kn: 'ಏರಿಕೆ'
    },
    'stats.bearish': {
        en: 'Bearish',
        hi: 'मंदी',
        ml: 'ഇടിവ്',
        kn: 'ಇಳಿಕೆ'
    },
    // --- CART & CHECKOUT ---
    'cart.title': {
        en: 'Your Order',
        hi: 'आपका ऑर्डर',
        ml: 'നിങ്ങളുടെ ഓർഡർ',
        kn: 'ನಿಮ್ಮ ಆರ್ಡರ್'
    },
    'cart.clear': {
        en: 'Clear All',
        hi: 'सभी हटाएं',
        ml: 'എല്ലാം മായ്ക്കുക',
        kn: 'ಎಲ್ಲವನ್ನೂ ಅಳಿಸಿ'
    },
    'cart.send_whatsapp': {
        en: 'Send Order via WhatsApp',
        hi: 'व्हाट्सएप पर ऑर्डर भेजें',
        ml: 'വാട്ട്‌സ്ആപ്പിൽ ഓർഡർ അയക്കുക',
        kn: 'ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಆರ್ಡರ್ ಕಳುಹಿಸಿ'
    },
    'cart.empty_title': {
        en: 'Cart is Empty',
        hi: 'कार्ट खाली है',
        ml: 'കാർട്ട് ശൂന്യമാണ്',
        kn: 'ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ'
    },
    'cart.empty_desc': {
        en: 'Add species to your cart by tapping the + button on any species card.',
        hi: 'किसी भी प्रजाति कार्ड पर + बटन दबाकर अपनी कार्ट में प्रजातियां जोड़ें।',
        ml: 'സ്പീഷീസ് കാർഡിലെ + ബട്ടൺ അമർത്തി കാർട്ടിലേക്ക് ചേർക്കുക.',
        kn: 'ಯಾವುದೇ ಪ್ರಭೇದದ ಕಾರ್ಡ್‌ನಲ್ಲಿ + ಬಟನ್ ಒತ್ತುವ ಮೂಲಕ ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ.'
    },
    'cart.browse_rates': {
        en: 'Browse Rates',
        hi: 'भाव देखें',
        ml: 'നിരക്കുകൾ കാണുക',
        kn: 'ದರಗಳನ್ನು ವೀಕ್ಷಿಸಿ'
    },
    'cart.watchlist': {
        en: 'My Watchlist',
        hi: 'मेरी वॉचलिस्ट',
        ml: 'എന്റെ വാച്ച്‌ലിസ്റ്റ്',
        kn: 'ನನ್ನ ವಾಚ್‌ಲಿಸ್ಟ್'
    },
    'cart.watchlist_desc': {
        en: 'Track your favorite species for quick access',
        hi: 'त्वरित पहुंच के लिए अपनी पसंदीदा प्रजातियों को ट्रैक करें',
        ml: 'നിങ്ങളുടെ പ്രിയപ്പെട്ട ഇനങ്ങൾ ട്രാക്ക് ചെയ്യുക',
        kn: 'ತ್ವರಿತ ಪ್ರವೇಶಕ್ಕಾಗಿ ನಿಮ್ಮ ಮೆಚ್ಚಿನ ಪ್ರಭೇದಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ'
    },
    'cart.view_all': {
        en: 'View All',
        hi: 'सभी देखें',
        ml: 'എല്ലാം കാണുക',
        kn: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ'
    },
    'cart.my_cart': {
        en: 'My Cart',
        hi: 'मेरा कार्ट',
        ml: 'എന്റെ കാർട്ട്',
        kn: 'ನನ್ನ ಕಾರ್ಟ್'
    },
    // --- WEATHER ---
    'weather.humid': {
        en: 'Humid',
        hi: 'उमस',
        ml: 'ഈർപ്പമുള്ള',
        kn: 'ತೇವಾಂಶ'
    },
    'weather.sunny': {
        en: 'Sunny',
        hi: 'धूप',
        ml: 'വെയിലുള്ള',
        kn: 'ಬಿಸಿಲು'
    },
    'weather.rainy': {
        en: 'Rainy',
        hi: 'बारिश',
        ml: 'മഴയുള്ള',
        kn: 'ಮಳೆ'
    },
    'weather.clear': {
        en: 'Clear',
        hi: 'साफ',
        ml: 'തെളിഞ്ഞ',
        kn: 'ಸ್ಪಷ್ಟ'
    },
    'weather.hot': {
        en: 'Hot',
        hi: 'गर्म',
        ml: 'ചൂടുള്ള',
        kn: 'ಬಿಸಿ'
    },
    // --- SETTINGS ---
    'settings.verified': {
        en: 'Verified User',
        hi: 'सत्यापित उपयोगकर्ता',
        ml: 'പരിശോധിച്ച ഉപയോക്താവ്',
        kn: 'ಪರಿಶೀಲಿಸಿದ ಬಳಕೆದಾರ'
    },
    'settings.preferences': {
        en: 'App Preferences',
        hi: 'ऐप प्राथमिकताएं',
        ml: 'ആപ്പ് മുൻഗണനകൾ',
        kn: 'ಅಪ್ಲಿಕೇಶನ್ ಆದ್ಯತೆಗಳು'
    },
    'settings.appearance': {
        en: 'Appearance',
        hi: 'दिखावट',
        ml: 'രൂപം',
        kn: 'ಗೋಚರತೆ'
    },
    'settings.light': {
        en: 'Light Mode',
        hi: 'लाइट मोड',
        ml: 'ലൈറ്റ് മോഡ്',
        kn: 'ಲೈಟ್ ಮೋಡ್'
    },
    'settings.dark': {
        en: 'Dark Mode',
        hi: 'डार्क मोड',
        ml: 'ഡാർക്ക് മോഡ്',
        kn: 'ಡಾರ್ಕ್ ಮೋಡ್'
    },
    'settings.system': {
        en: 'System Default',
        hi: 'सिस्टम डिफ़ॉल्ट',
        ml: 'സിസ്റ്റം ഡിഫോൾട്ട്',
        kn: 'ಸಿಸ್ಟಮ್ ಡೀಫಾಲ್ಟ್'
    },
    'settings.whatsapp_alerts': {
        en: 'WhatsApp Alerts',
        hi: 'व्हाट्सएप अलर्ट',
        ml: 'വാട്ട്‌സ്ആപ്പ് അറിയിപ്പുകൾ',
        kn: 'ವಾಟ್ಸಾಪ್ ಎಚ್ಚರಿಕೆಗಳು'
    },
    'settings.daily_updates': {
        en: 'Daily rate updates',
        hi: 'दैनिक भाव अपडेट',
        ml: 'പ്രതിദിന നിരക്ക് അപ്‌ഡേറ്റുകൾ',
        kn: 'ದೈನಂದಿನ ದರ ನವೀಕರಣಗಳು'
    },
    'settings.app_language': {
        en: 'App Language',
        hi: 'ऐप की भाषा',
        ml: 'ആപ്പ് ഭാഷ',
        kn: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ'
    },
    'settings.lang_desc': {
        en: 'English, Hindi, Malayalam...',
        hi: 'अंग्रेजी, हिंदी, मलयालम...',
        ml: 'ഇംഗ്ലീഷ്, ഹിന്ദി, മലയാളം...',
        kn: 'ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ಮಲಯಾಳಂ...'
    },
    'settings.management': {
        en: 'Management',
        hi: 'प्रबंधन',
        ml: 'മാനേജ്മെന്റ്',
        kn: 'ನಿರ್ವಹಣೆ'
    },
    'settings.admin_panel': {
        en: 'Admin Panel',
        hi: 'एडमिन पैनल',
        ml: 'അഡ്മിൻ പാനൽ',
        kn: 'ನಿರ್ವಾಹಕ ಫಲಕ'
    },
    'settings.admin_desc': {
        en: 'Manage rates & users',
        hi: 'भाव और उपयोगकर्ताओं का प्रबंधन करें',
        ml: 'നിരക്കുകളും ഉപയോക്താക്കളെയും നിയന്ത്രിക്കുക',
        kn: 'ದರಗಳು ಮತ್ತು ಬಳಕೆದಾರರನ್ನು ನಿರ್ವಹಿಸಿ'
    },
    'settings.sign_out': {
        en: 'Sign Out',
        hi: 'साइन आउट',
        ml: 'സൈൻ ഔട്ട്',
        kn: 'ಸೈನ್ ಔಟ್'
    },
    // --- VOICE ASSISTANT ---
    'voice.listening': {
        en: 'Listening...',
        hi: 'सुन रहा हूँ...',
        ml: 'കേൾക്കുന്നു...',
        kn: 'ಕೇಳುತ್ತಿದ್ದೇನೆ...'
    },
    'voice.tap_to_speak': {
        en: 'Tap Mic to Speak',
        hi: 'बोलने के लिए माइक दबाएं',
        ml: 'സംസാരിക്കാൻ മൈക്ക് ടാപ്പ് ചെയ്യുക',
        kn: 'ಮಾತನಾಡಲು ಮೈಕ್ ಟ್ಯಾಪ್ ಮಾಡಿ'
    },
    'voice.hint': {
        en: "Say 'Add Seer to Cart'",
        hi: "कहें 'सीर को कार्ट में जोड़ें'",
        ml: "'സീർ കാർട്ടിലേക്ക് ചേർക്കുക' എന്ന് പറയുക",
        kn: "'ಸೀರ್ ಅನ್ನು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' ಎಂದು ಹೇಳಿ"
    }
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
