import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, AlertCircle, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import RegisterPostcardForm from "@/components/register/RegisterPostcardForm";
import RegisterPostcardSuccess from "@/components/register/RegisterPostcardSuccess";
import RegisterPostcardAlreadyRegistered from "@/components/register/RegisterPostcardAlreadyRegistered";

export interface PostcardInfo {
  unit_id: string;
  business_status: string | null;
  fulfillment_status: string;
  registered_at: string | null;
  traveler_name: string | null;
  recipient_name: string | null;
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
  const queryClient = useQueryClient();
  const [postcard, setPostcard] = useState<PostcardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchPostcard = async () => {
      if (!qrToken) {
        setError("Brak kodu QR");
        setIsLoading(false);
        return;
      }

      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/register-postcard?token=${encodeURIComponent(qrToken)}`,
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

        setPostcard(await response.json());
      } catch {
        setError("Wystąpił błąd podczas ładowania");
      }
      setIsLoading(false);
    };

    fetchPostcard();
  }, [qrToken]);

  const handleSubmit = async (data: {
    recipientName: string;
    recipientMessage: string;
    recipientEmail: string;
    contactOptIn: boolean;
  }) => {
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
          token: qrToken,
          recipient_name: data.recipientName.trim(),
          recipient_message: data.recipientMessage.trim() || undefined,
          recipient_email: data.recipientEmail.trim() || undefined,
          contact_opt_in: data.contactOptIn,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Wystąpił błąd");
    }

    setIsSuccess(true);
    toast({ title: "Kartka zarejestrowana! 🎉" });

    // Invalidate related queries so dashboard/stats refresh automatically
    queryClient.invalidateQueries({ queryKey: ['platform-stats'] });
    queryClient.invalidateQueries({ queryKey: ['community-gallery'] });
    queryClient.invalidateQueries({ queryKey: ['user-ranking'] });
    queryClient.invalidateQueries({ queryKey: ['postcards'] });
    queryClient.invalidateQueries({ queryKey: ['user-stats'] });
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

  if (postcard.business_status === 'registered') {
    return <RegisterPostcardAlreadyRegistered postcard={postcard} />;
  }

  if (isSuccess) {
    return <RegisterPostcardSuccess postcard={postcard} />;
  }

  return <RegisterPostcardForm postcard={postcard} onSubmit={handleSubmit} />;
};

export default RegisterPostcard;
