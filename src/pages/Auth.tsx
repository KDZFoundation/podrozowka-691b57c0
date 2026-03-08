import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { lovable } from "@/integrations/lovable/index";

const emailSchema = z.string().email("Podaj prawidłowy adres email");
const passwordSchema = z.string().min(6, "Hasło musi mieć minimum 6 znaków");
const firstNameSchema = z.string().min(1, "Podaj imię").max(50);
const lastNameSchema = z.string().min(1, "Podaj nazwisko").max(50);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;

    if (!isLogin) {
      const fnResult = firstNameSchema.safeParse(firstName);
      if (!fnResult.success) newErrors.firstName = fnResult.error.errors[0].message;
      const lnResult = lastNameSchema.safeParse(lastName);
      if (!lnResult.success) newErrors.lastName = lnResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          const description = error.message.includes("Invalid login credentials")
              ? "Nieprawidłowy email lub hasło."
              : "Wystąpił błąd podczas logowania. Spróbuj ponownie.";
          console.error("Login error:", error.message);
          toast({
            title: "Błąd logowania",
            description,
            variant: "destructive",
          });
        } else {
          toast({ title: "Zalogowano!", description: "Witaj z powrotem." });
          navigate("/dashboard");
        }
      } else {
        const displayName = `${firstName} ${lastName}`.trim();
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              display_name: displayName,
              first_name: firstName,
              last_name: lastName,
            },
          },
        });

        if (error) {
          const description = error.message.includes("already registered")
              ? "Ten email jest już zarejestrowany."
              : "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.";
          console.error("Signup error:", error.message);
          toast({
            title: "Błąd rejestracji",
            description,
            variant: "destructive",
          });
        } else {
          toast({ title: "Konto utworzone!", description: "Sprawdź email, aby potwierdzić konto." });
        }
      }
    } catch {
      toast({ title: "Wystąpił błąd", description: "Spróbuj ponownie.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <a href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />Powrót do strony głównej
        </a>

        <div className="bg-card rounded-2xl shadow-card p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {isLogin ? "Zaloguj się" : "Dołącz do społeczności"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin ? "Wróć do swojego konta Podróżówka" : "Utwórz konto i zacznij kupować Podróżówki"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Imię</label>
                  <Input placeholder="Jan" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} />
                  {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nazwisko</label>
                  <Input placeholder="Kowalski" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading} />
                  {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="email" placeholder="twoj@email.pl" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" disabled={isLoading} />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Hasło</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" disabled={isLoading} />
              </div>
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isLogin ? "Logowanie..." : "Tworzenie konta..."}</>) : (isLogin ? "Zaloguj się" : "Utwórz konto")}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">lub kontynuuj przez</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading || !!isOAuthLoading}
              onClick={async () => {
                setIsOAuthLoading("google");
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (error) {
                  toast({ title: "Błąd logowania Google", description: String(error.message || error), variant: "destructive" });
                }
                setIsOAuthLoading(null);
              }}
            >
              {isOAuthLoading === "google" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              )}
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading || !!isOAuthLoading}
              onClick={async () => {
                setIsOAuthLoading("apple");
                const { error } = await lovable.auth.signInWithOAuth("apple", {
                  redirect_uri: window.location.origin,
                });
                if (error) {
                  toast({ title: "Błąd logowania Apple", description: String(error.message || error), variant: "destructive" });
                }
                setIsOAuthLoading(null);
              }}
            >
              {isOAuthLoading === "apple" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              )}
              Apple
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Nie masz konta?" : "Masz już konto?"}{" "}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setErrors({}); }} className="text-primary font-medium hover:underline" disabled={isLoading}>
                {isLogin ? "Zarejestruj się" : "Zaloguj się"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
