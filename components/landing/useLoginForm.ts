import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { validateEmail, validatePassword } from "@/lib/utils/validation";

export function useLoginForm(onAuthSuccess?: () => void) {
  const router = useRouter();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleEmailChange = (value: string) => {
    const lowerValue = value.toLowerCase();
    setEmail(lowerValue);
    if (emailError) setEmailError(validateEmail(lowerValue));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordError) setPasswordError(validatePassword(value));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const eError = validateEmail(email);
    const pError = validatePassword(password);

    if (eError) { setEmailError(eError); return; }
    if (pError) { setPasswordError(pError); return; }

    setLoading(true);
    setMessage(null);
    await supabase.auth.signOut();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) setMessage({ text: error.message, ok: false });
      else if (data.session) {
        setMessage({ text: "✓ Account created! Redirecting...", ok: true });
        setTimeout(() => { onAuthSuccess?.(); router.refresh(); router.push("/onboarding"); }, 1000);
      } else {
        setMessage({ text: "✓ Account created! Please check your email to confirm.", ok: true });
        setTimeout(() => { setIsSignUp(false); setMessage(null); }, 3000);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ text: "Invalid email or password.", ok: false });
      else {
        onAuthSuccess?.();
        router.refresh();
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setMessage(null);
    setPassword("");
    setPasswordError("");
    setEmailError("");
  };

  return {
    isSignUp, email, emailError, password, passwordError, loading, message,
    handleEmailChange, handlePasswordChange, handleAuth, toggleAuthMode,
    setEmailError, setPasswordError, validateEmail, validatePassword
  };
}