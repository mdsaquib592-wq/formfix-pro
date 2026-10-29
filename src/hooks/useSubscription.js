import { useState, useEffect } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "../firebase";

export function useSubscription() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState({
    isSubscribed: false,
    plan: "free", // 'free', 'monthly', 'yearly'
    expiresAt: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch subscription status from Firestore database
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          const expiresAt = data.expiresAt?.toDate();
          const isSubscribed = expiresAt && expiresAt > new Date();

          setSubscription({
            isSubscribed: !!isSubscribed,
            plan: data.plan || "free",
            expiresAt: expiresAt || null,
          });
        } else {
          // Initialize new user record as free tier
          await setDoc(userDocRef, {
            email: currentUser.email,
            name: currentUser.displayName,
            plan: "free",
            isSubscribed: false,
            createdAt: serverTimestamp(),
          });
        }
      } else {
        setSubscription({ isSubscribed: false, plan: "free", expiresAt: null });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  const logout = () => signOut(auth);

  // Function to simulate upgrading user after payment gateway success (Razorpay/Stripe)
  const upgradeSubscription = async (planType) => {
    if (!user) return;
    const durationDays = planType === "yearly" ? 365 : 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const userDocRef = doc(db, "users", user.uid);
    await setDoc(
      userDocRef,
      {
        plan: planType,
        isSubscribed: true,
        expiresAt: expiresAt,
      },
      { merge: true },
    );

    setSubscription({
      isSubscribed: true,
      plan: planType,
      expiresAt: expiresAt,
    });
  };

  return {
    user,
    subscription,
    loading,
    loginWithGoogle,
    logout,
    upgradeSubscription,
  };
}
