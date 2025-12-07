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

        setIsProcessing(true);

        // Store phone number for later reference
        localStorage.setItem('coastal_mandi_premium_phone', `+91${phone}`);

        setTimeout(() => {
            // Get Razorpay payment link from environment variable
            // You can create this link in Razorpay Dashboard -> Payment Links
            const razorpayPaymentLink = import.meta.env.VITE_RAZORPAY_PAYMENT_LINK;

            if (razorpayPaymentLink) {
                // Redirect to Razorpay payment page
                window.open(razorpayPaymentLink, '_blank');
                setIsProcessing(false);
                setSubscribed(true);
            } else {
                // Fallback: Open WhatsApp with premium interest if no payment link configured
                const message = `💎 *Coastal Mandi PREMIUM*\n\n🌟 I want to upgrade to Premium!\n\n📱 Phone: +91${phone}\n💳 Plan: ₹99/month\n\nPlease send me the payment link.`;
                const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || ''}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
                setIsProcessing(false);
                setSubscribed(true);
            }
        }, 1000);
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
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up-spring">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 pb-12">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-white">Subscribe & Save</h2>
                            <p className="text-white/80 text-sm">Never miss a price update</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 -mt-8 space-y-4 overflow-y-auto max-h-[60vh]">
                    {subscribed ? (
                        // Success State
                        <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-slate-100">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">You're All Set! 🎉</h3>
                            <p className="text-slate-500">
                                {selectedPlan === 'premium'
                                    ? 'Complete your payment on Razorpay to activate Premium features. You\'ll receive confirmation on WhatsApp.'
                                    : 'You\'ll receive daily price updates on WhatsApp.'}
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Plan Selection */}
                            <div className="grid grid-cols-2 gap-3">
                                {plans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        onClick={() => setSelectedPlan(plan.id as 'free' | 'premium')}
                                        className={`relative p-4 rounded-2xl border-2 transition-all text-left ${selectedPlan === plan.id
                                            ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-[1.02]'
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                            }`}
                                    >
                                        {plan.badge && (
                                            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                                {plan.badge}
                                            </span>
                                        )}
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                                            <plan.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-lg font-bold text-slate-900">{plan.name}</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-slate-900">{plan.price}</span>
                                            <span className="text-xs text-slate-400">{plan.period}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Plan Features */}
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    What's Included
                                </h4>
                                <div className="space-y-2">
                                    {plans.find(p => p.id === selectedPlan)?.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                            <span className="text-slate-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="text-slate-400 font-bold">+91</span>
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Enter your WhatsApp number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    className="w-full pl-14 pr-4 py-4 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                                    maxLength={10}
                                />
                            </div>

                            {/* Subscribe Button */}
                            <button
                                onClick={selectedPlan === 'free' ? handleFreeSubscription : handlePremiumSubscription}
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg ${selectedPlan === 'premium'
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-200'
                                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200'
                                    } ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
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
                                        Subscribe Free via WhatsApp
                                    </>
                                )}
                            </button>

                            {/* Trust Badges */}
                            <div className="flex items-center justify-center gap-4 pt-2">
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Shield className="w-4 h-4" />
                                    Secure
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Zap className="w-4 h-4" />
                                    Instant
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Star className="w-4 h-4" />
                                    4.8★ Rated
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
