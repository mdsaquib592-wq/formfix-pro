import React, { useState } from "react";
import { useSubscription } from "../hooks/useSubscription";
import PaywallModal from "./PaywallModal";

export default function ProFeatureWrapper({ children, title = "Pro Feature" }) {
  const { subscription } = useSubscription();
  const [showPaywall, setShowPaywall] = useState(false);

  if (!subscription.isSubscribed) {
    return (
      <div className="text-center py-20 space-y-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <span className="text-4xl">🔒</span>
        <h3 className="text-lg font-bold text-white">{title} is Locked</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Upgrade to FormFix Pro (₹59/month or ₹399/year) to unlock unlimited AI
          background removal and professional studio tools.
        </p>
        <button
          onClick={() => setShowPaywall(true)}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer transition hover:scale-105"
        >
          ⚡ Unlock Full Access Now
        </button>
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
        />
      </div>
    );
  }

  return <>{children}</>;
}
