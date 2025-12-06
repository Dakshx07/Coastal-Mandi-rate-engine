import React, { useState } from 'react';
import { X, MessageCircle, Check, Bell } from 'lucide-react';
import { addSubscriber } from '../services/storageService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  harbourId: string;
}

export const WhatsAppModal: React.FC<Props> = ({ isOpen, onClose, harbourId }) => {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      await addSubscriber(phone, harbourId);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setSubmitted(false);
          setPhone('');
        }, 300);
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl z-10 p-8 relative overflow-hidden animate-slide-up-spring">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors z-20">
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="bg-slate-900 p-4 rounded-2xl shadow-xl shadow-slate-900/20">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            <h3 className="text-xl font-heading font-bold text-center text-slate-900 mb-2">
              Instant Price Alerts
            </h3>
            <p className="text-center text-slate-500 font-medium text-xs mb-8 leading-relaxed px-4">
              Get notified via WhatsApp immediately when prices fluctuate significantly in this market.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-bold text-center text-lg placeholder:text-slate-300 placeholder:font-medium"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-shine w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-heading font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center transform active:scale-[0.98]"
              >
                <Bell className="w-4 h-4 mr-2" />
                Activate Alerts
              </button>

              <a
                href={`https://wa.me/?text=I%20want%20to%20subscribe%20to%20daily%20rates%20for%20${harbourId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-50 text-green-700 hover:bg-green-100 font-heading font-bold py-3 rounded-xl transition-all flex items-center justify-center text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Test Integration (Demo)
              </a>
            </form>
          </div>
        ) : (
          <div className="text-center py-8 relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse-soft">
                <Check className="w-10 h-10 text-white stroke-[3]" />
              </div>
            </div>
            <h3 className="text-xl font-heading font-extrabold text-slate-800">Subscribed!</h3>
            <p className="text-slate-500 font-medium text-sm mt-2">You'll receive the next update shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
};