import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, User, MessageSquare, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import type { PostcardInfo } from "@/pages/RegisterPostcard";

interface Props {
  postcard: PostcardInfo;
  onSubmit: (data: {
    recipientName: string;
    recipientMessage: string;
    recipientEmail: string;
    contactOptIn: boolean;
  }) => Promise<void>;
}

const RegisterPostcardForm = ({ postcard, onSubmit }: Props) => {
  const { toast } = useToast();
  const [recipientName, setRecipientName] = useState("");
  const [recipientMessage, setRecipientMessage] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [contactOptIn, setContactOptIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim()) {
      toast({ title: "Podaj swoje imię", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ recipientName, recipientMessage, recipientEmail, contactOptIn });
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🇵🇱</span>
            <h1 className="font-display text-2xl font-bold text-foreground mb-1">
              Masz Podróżówkę!
            </h1>
            <p className="text-muted-foreground">
              {postcard.design.country_name} — {postcard.design.title}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Od: <strong className="text-foreground">{postcard.traveler_name || "Podróżnik"}</strong>
            </p>
          </div>

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
                Email (opcjonalnie)
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
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="contact-opt-in"
                checked={contactOptIn}
                onCheckedChange={(checked) => setContactOptIn(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="contact-opt-in" className="text-sm text-muted-foreground cursor-pointer">
                Wyrażam zgodę na kontakt ze strony Podróżnika, który wysłał tę kartkę
              </label>
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

export default RegisterPostcardForm;
