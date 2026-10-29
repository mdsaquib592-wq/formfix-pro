import React from "react";
import { useSubscription } from "../hooks/useSubscription";

export default function PaywallModal({ isOpen, onClose }) {
  const { upgradeSubscription, loginWithGoogle, user } = useSubscription();

  if (!isOpen) return null;

  const handleSubscribe = async (plan) => {
    if (!user) {
      await loginWithGoogle();
      return;
    }
    // Integrate payment gateway (Razorpay/Stripe) here. Upon success:
    await upgradeSubscription(plan);
    alert(`Successfully upgraded to Pro (${plan})!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center space-y-2">
          <span className="text-3xl">🚀</span>
          <h3 className="text-xl font-black text-white">
            Unlock FormFix Pro Features
          </h3>
          <p className="text-xs text-slate-400">
            Get unlimited AI background removal, bulk PDF conversion, and exam
            presets.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between text-center space-y-3">
            <div>
              <span className="text-xs text-slate-400 font-bold">
                Monthly Plan
              </span>
              <div className="text-2xl font-black text-[#00e5ff] mt-1">
                ₹59 <span className="text-xs text-slate-400">/mo</span>
              </div>
            </div>
            <button
              onClick={() => handleSubscribe("monthly")}
              className="w-full py-2 bg-[#00e5ff] text-black font-black text-xs rounded-xl cursor-pointer"
            >
              Choose Monthly
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 flex flex-col justify-between text-center space-y-3 relative overflow-hidden">
            <span className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-xl">
              SAVE 45%
            </span>
            <div>
              <span className="text-xs text-amber-400 font-bold">
                Yearly Plan
              </span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                ₹399 <span className="text-xs text-slate-400">/yr</span>
              </div>
            </div>
            <button
              onClick={() => handleSubscribe("yearly")}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs rounded-xl cursor-pointer"
            >
              Choose Yearly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
