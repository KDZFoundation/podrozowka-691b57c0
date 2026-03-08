import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle, Heart, MapPin, User, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PostcardInfo {
  status: string;
  buyer_display_name: string | null;
  recipient_name: string | null;
  registered_at: string | null;
  design: {
    title: string;
    image_front_url: string | null;
    country_name: string;
    country_iso2: string;
  };
}

const RegisterPostcard = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const { toast } = useToast();
  const [postcard, setPostcard] = useState<PostcardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recipientName, setRecipientName] = useState("");
  const [recipientMessage, setRecipientMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchPostcard = async () => {
      if (!qrToken) {
        setError("Brak kodu QR");
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('register-postcard', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: undefined,
        });

        // Use fetch directly since functions.invoke doesn't support GET with query params well
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/register-postcard?qr_token=${encodeURIComponent(qrToken)}`,
          {
            method: 'GET',
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          setError(errData.error || "Nie znaleziono kartki");
          setIsLoading(false);
          return;
        }

        const postcardData = await response.json();
        setPostcard(postcardData);
      } catch {
        setError("Wystąpił błąd podczas ładowania");
      }
      setIsLoading(false);
    };

    fetchPostcard();
  }, [qrToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim()) {
      toast({ title: "Podaj swoje imię", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/register-postcard`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            qr_token: qrToken,
            recipient_name: recipientName.trim(),
            recipient_message: recipientMessage.trim() || undefined,
            recipient_email: recipientEmail.trim() || undefined,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Wystąpił błąd");
      }

      setIsSuccess(true);
      toast({ title: "Kartka zarejestrowana! 🎉" });
    } catch (err) {
      toast({
        title: "Wystąpił błąd",
        description: err instanceof Error ? err.message : "Spróbuj ponownie",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Nie znaleziono kartki</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <a href="/" className="text-primary hover:underline">Wróć na stronę główną</a>
        </motion.div>
      </div>
    );
  }

  if (!postcard) return null;

  // Already registered
  if (postcard.status === 'registered') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Kartka już zarejestrowana</h1>
          <p className="text-muted-foreground mb-2">
            Ta Podróżówka została zarejestrowana przez <strong>{postcard.recipient_name}</strong>.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {postcard.design.country_name} — {postcard.design.title}
          </p>
          <a href="/" className="text-primary hover:underline">Dowiedz się więcej o Podróżówce</a>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-accent" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Dziękujemy! 🎉</h1>
          <p className="text-muted-foreground mb-4">
            Twoja Podróżówka z <strong>{postcard.design.country_name}</strong> została zarejestrowana.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Wysłana przez: <strong>{postcard.buyer_display_name || "Podróżnik"}</strong>
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
            Dowiedz się więcej o Podróżówce
          </a>
        </motion.div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">{postcard.design.country_flag}</span>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Masz Podróżówkę!
            </h1>
            <p className="text-muted-foreground">
              {postcard.design.country_name} — {postcard.design.view_name}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Od: <strong className="text-foreground">{postcard.buyer_display_name || "Podróżnik"}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Twoje imię *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Jak masz na imię?"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="pl-10"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Krótka wiadomość (opcjonalne)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Textarea
                  placeholder="Napisz coś do Podróżnika..."
                  value={recipientMessage}
                  onChange={(e) => setRecipientMessage(e.target.value)}
                  className="pl-10"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{recipientMessage.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email (opcjonalnie, jeśli chcesz nawiązać kontakt)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="twoj@email.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Podanie emaila oznacza chęć kontaktu z Podróżnikiem
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Rejestrowanie...</>
              ) : (
                <><CheckCircle className="w-4 h-4 mr-2" />Zarejestruj kartkę</>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <a href="/" className="hover:text-foreground transition-colors">podrozowka.pl</a> — Kartki z Polski dla świata
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPostcard;
