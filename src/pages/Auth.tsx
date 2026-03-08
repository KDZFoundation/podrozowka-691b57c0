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
          toast({
            title: "Błąd logowania",
            description: error.message.includes("Invalid login credentials")
              ? "Nieprawidłowy email lub hasło."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "Zalogowano!", description: "Witaj z powrotem." });
          navigate("/dashboard");
        }
      } else {
        const displayName = `${firstName} ${lastName}`.trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName },
          },
        });

        if (error) {
          toast({
            title: "Błąd rejestracji",
            description: error.message.includes("already registered")
              ? "Ten email jest już zarejestrowany."
              : error.message,
            variant: "destructive",
          });
        } else if (data.user) {
          // Update profile with first/last name (trigger already created profile)
          await supabase
            .from('profiles')
            .update({
              first_name: firstName,
              last_name: lastName,
              display_name: displayName,
            })
            .eq('user_id', data.user.id);

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
