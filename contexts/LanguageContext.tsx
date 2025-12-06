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
