import React, { useState } from 'react';
import { X, Check, Crown, Bell, Zap, Shield, MessageCircle, CreditCard, Sparkles, Star } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    harbourName?: string;
}

export const SubscriptionModal: React.FC<Props> = ({ isOpen, onClose, harbourName = 'All Harbours' }) => {
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');
    const [phone, setPhone] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    if (!isOpen) return null;

    const handleFreeSubscription = () => {
        if (!phone || phone.length < 10) {
            alert('Please enter a valid phone number');
            return;
        }

        setIsProcessing(true);

        // Simulate subscription process
        setTimeout(() => {
            // Open WhatsApp with subscription confirmation
            const message = `🐟 *Coastal Mandi Subscription*\n\n✅ I want to subscribe for FREE price alerts!\n\n📍 Harbour: ${harbourName}\n📱 Phone: ${phone}\n\nPlease add me to the daily rate updates.`;
            const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');

            setIsProcessing(false);
            setSubscribed(true);
        }, 1000);
    };

    const handlePremiumSubscription = () => {
        if (!phone || phone.length < 10) {
            alert('Please enter a valid phone number');
            return;
        }

        // Store phone number for later reference
        localStorage.setItem('coastal_mandi_premium_phone', `+91${phone}`);

        // Get Razorpay payment link from environment variable
        const razorpayPaymentLink = import.meta.env.VITE_RAZORPAY_PAYMENT_LINK;
        
        // DEBUG: Check if link is loaded
        // alert(`Link: ${razorpayPaymentLink || 'NOT FOUND'}`);

        if (razorpayPaymentLink && razorpayPaymentLink.length > 5) {
            // IMPORTANT: On mobile, window.open inside setTimeout gets blocked
            // Using window.location.href for reliable mobile redirect
            // The user will be redirected to Razorpay payment page

            // Detect if mobile device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // On mobile, use a hidden anchor tag to trigger navigation
                // This is more reliable than window.location.href for deep links and WebViews
                const link = document.createElement('a');
                link.href = razorpayPaymentLink;
                // Use _system target for Capacitor/Cordova apps to open in system browser
                // For regular mobile browsers, this behaves like _blank or _self depending on settings
                link.target = '_system';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                // On desktop, open in new tab
                const newWindow = window.open(razorpayPaymentLink, '_blank');
                if (!newWindow || newWindow.closed) {
                    // If popup was blocked, redirect in same tab
                    window.location.href = razorpayPaymentLink;
                } else {
                    setIsProcessing(false);
                    setSubscribed(true);
                }
            }
        } else {
            // Fallback: Open WhatsApp with premium interest if no payment link configured
            const message = `💎 *Coastal Mandi PREMIUM*\n\n🌟 I want to upgrade to Premium!\n\n📱 Phone: +91${phone}\n💳 Plan: ₹99/month\n\nPlease send me the payment link.`;
            const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}?text=${encodeURIComponent(message)}`;

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                window.location.href = whatsappUrl;
            } else {
                window.open(whatsappUrl, '_blank');
                setIsProcessing(false);
                setSubscribed(true);
            }
        }
    };

    const plans = [
        {
            id: 'free',
            name: 'Free',
            price: '₹0',
            period: 'forever',
            icon: Bell,
            color: 'from-slate-500 to-slate-600',
            features: [
                'Daily rate updates via WhatsApp',
                'Basic price alerts',
                'Access to all harbours',
                'Market trend notifications',
            ],
            limitations: [
                'No AI predictions',
                'No priority support',
            ]
        },
        {
            id: 'premium',
            name: 'Premium',
            price: '₹99',
            period: '/month',
            icon: Crown,
            color: 'from-amber-500 to-orange-600',
            badge: 'BEST VALUE',
            features: [
                'Everything in Free',
                '🤖 AI Price Predictions',
                '⚡ Instant price alerts',
                '📊 Advanced analytics',
                '🎯 Personalized recommendations',
                '💬 Priority WhatsApp support',
                '📈 Weekly market reports',
            ],
            limitations: []
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-slate-800 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up-spring flex flex-col">
                {/* Header with Wave Design */}
                <div className="relative bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 p-6 pb-16 overflow-hidden shrink-0">
                    {/* Decorative Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10 backdrop-blur-sm"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner border border-white/10">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-white tracking-tight">Unlock Pro Features</h2>
                            <p className="text-cyan-50 text-sm font-medium">Get accurate AI predictions & alerts</p>
                        </div>
                    </div>

                    {/* Wave SVG */}
                    <div className="absolute bottom-0 left-0 right-0 translate-y-px">
                        <svg viewBox="0 0 1440 320" className="w-full h-auto text-white fill-current">
                            <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 -mt-4 space-y-6 overflow-y-auto flex-1 relative z-10">
                    {subscribed ? (
                        // Success State
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-xl border border-slate-100 dark:border-slate-700 mx-2 mb-4">
                            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-900/20 rounded-full animate-ping opacity-20" />
                                <Check className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">You're All Set! 🎉</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                                {selectedPlan === 'premium'
                                    ? 'Complete your payment on Razorpay to activate Premium features. You\'ll receive confirmation on WhatsApp.'
                                    : 'You\'ll receive daily price updates on WhatsApp.'}
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Plan Selection */}
                            <div className="grid grid-cols-2 gap-4 pt-2 px-1">
                                {plans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id as 'free' | 'premium')}
                                        className={`relative p-5 rounded-3xl border-2 transition-all duration-300 text-left group ${selectedPlan === plan.id
                                            ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 shadow-xl shadow-teal-100/50 dark:shadow-none scale-[1.02] z-10'
                                            : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-lg'
                                            }`}
                                    >
                                        {plan.badge && (
                                            <span className="absolute -top-3 -right-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-md transform group-hover:scale-110 transition-transform">
                                                {plan.badge}
                                            </span>
                                        )}
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                            <plan.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-800 dark:text-white mb-1">{plan.name}</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-heading font-bold text-slate-900 dark:text-white">{plan.price}</span>
                                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{plan.period}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Plan Features */}
                            <div className="bg-slate-50/80 dark:bg-slate-900/50 rounded-3xl p-5 border border-slate-100 dark:border-slate-700">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-500" />
                                    What's Included
                                    <span className="w-full h-px bg-slate-200 dark:bg-slate-700 ml-2" />
                                </h4>
                                <div className="space-y-3">
                                    {plans.find(p => p.id === selectedPlan)?.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3 text-sm group">
                                            <div className="p-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mt-0.5 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800 transition-colors">
                                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-slate-600 dark:text-slate-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">WhatsApp Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-slate-100 dark:border-slate-700 pr-3 my-2">
                                        <span className="text-slate-500 dark:text-slate-400 font-bold text-lg">🇮🇳 +91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className="w-full pl-28 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-0 focus:border-teal-500 focus:bg-white dark:focus:bg-slate-800 text-lg font-bold transition-all shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-600"
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            {/* Subscribe Button */}
                            <button
                                onClick={selectedPlan === 'free' ? handleFreeSubscription : handlePremiumSubscription}
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] ${selectedPlan === 'premium'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-200'
                                    : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-teal-200'
                                    } ${isProcessing ? 'opacity-80 cursor-wait' : ''}`}
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : selectedPlan === 'premium' ? (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Subscribe for ₹99/month
                                    </>
                                ) : (
                                    <>
                                        <MessageCircle className="w-5 h-5" />
                                        Subscribe Free
                                    </>
                                )}
                            </button>

                            {/* Trust Badges */}
                            <div className="flex items-center justify-center gap-6 pt-2 pb-2 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <Shield className="w-3.5 h-3.5" />
                                    Secure
                                </div>
                                <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <Zap className="w-3.5 h-3.5" />
                                    Instant
                                </div>
                                <div className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <Star className="w-3.5 h-3.5" />
                                    4.8/5
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
