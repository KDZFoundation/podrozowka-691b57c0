import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Camera, Upload, MapPin, User, MessageSquare, 
  Globe2, Loader2, CheckCircle, ImageIcon, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const formSchema = z.object({
  givenToName: z.string().min(1, "Podaj imię odbiorcy").max(100),
  givenToCountry: z.string().min(1, "Podaj kraj").max(100),
  language: z.string().min(1, "Wybierz język"),
  message: z.string().max(500, "Wiadomość może mieć maksymalnie 500 znaków").optional(),
});

interface RegisterPostcardFormProps {
  userId: string;
  onSuccess: () => void;
}

const languages = [
  { code: "de", name: "Niemiecki", flag: "🇩🇪" },
  { code: "it", name: "Włoski", flag: "🇮🇹" },
  { code: "es", name: "Hiszpański", flag: "🇪🇸" },
  { code: "en", name: "Angielski", flag: "🇬🇧" },
  { code: "fr", name: "Francuski", flag: "🇫🇷" },
  { code: "uk", name: "Ukraiński", flag: "🇺🇦" },
  { code: "th", name: "Tajski", flag: "🇹🇭" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "tr", name: "Turecki", flag: "🇹🇷" },
  { code: "en-us", name: "Angielski (USA)", flag: "🇺🇸" },
  { code: "cs", name: "Czeski", flag: "🇨🇿" },
  { code: "hr", name: "Chorwacki", flag: "🇭🇷" },
  { code: "el", name: "Grecki", flag: "🇬🇷" },
  { code: "hu", name: "Węgierski", flag: "🇭🇺" },
  { code: "zh", name: "Chiński", flag: "🇨🇳" },
  { code: "no", name: "Norweski", flag: "🇳🇴" },
];

const countries = [
  "Niemcy", "Włochy", "Hiszpania", "Wielka Brytania", "Francja", 
  "Ukraina", "Tajlandia", "Indie", "Turcja", "USA", 
  "Czechy", "Chorwacja", "Grecja", "Węgry", "Chiny", "Norwegia",
  "Austria", "Holandia", "Belgia", "Portugalia", "Szwecja", "Dania",
  "Szwajcaria", "Japonia", "Korea Południowa", "Australia", "Kanada",
  "Meksyk", "Brazylia", "Argentyna", "Inne"
];

const RegisterPostcardForm = ({ userId, onSuccess }: RegisterPostcardFormProps) => {
  const [givenToName, setGivenToName] = useState("");
  const [givenToCountry, setGivenToCountry] = useState("");
  const [language, setLanguage] = useState("");
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Plik za duży",
          description: "Maksymalny rozmiar zdjęcia to 5MB",
          variant: "destructive",
        });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateTrackingCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'PL-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = formSchema.safeParse({ givenToName, givenToCountry, language, message });
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl: string | null = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('postcard-photos')
          .upload(fileName, photoFile);

        if (uploadError) {
          throw new Error("Nie udało się przesłać zdjęcia");
        }

        const { data: urlData } = supabase.storage
          .from('postcard-photos')
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;
      }

      // Generate tracking code
      const newTrackingCode = generateTrackingCode();

      // Create postcard record
      const { error: insertError } = await supabase
        .from('postcards')
        .insert({
          owner_id: userId,
          tracking_code: newTrackingCode,
          language,
          given_to_name: givenToName,
          given_to_country: givenToCountry,
          given_at: new Date().toISOString(),
          status: 'in_transit',
          photo_url: photoUrl,
          message: message || null,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setTrackingCode(newTrackingCode);
      setIsSuccess(true);
      onSuccess();

      toast({
        title: "Podróżówka zarejestrowana!",
        description: `Kod śledzenia: ${newTrackingCode}`,
      });

    } catch (error) {
      console.error("Error registering postcard:", error);
      toast({
        title: "Wystąpił błąd",
        description: error instanceof Error ? error.message : "Spróbuj ponownie później",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setGivenToName("");
    setGivenToCountry("");
    setLanguage("");
    setMessage("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsSuccess(false);
    setTrackingCode(null);
    setErrors({});
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto"
      >
        <div className="bg-card rounded-2xl p-8 shadow-soft text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Podróżówka zarejestrowana!
          </h2>
          <p className="text-muted-foreground mb-6">
            Twoja Podróżówka jest teraz w podróży. Gdy odbiorca ją zarejestruje, 
            zostanie oznaczona jako dostarczona.
          </p>

          <div className="bg-secondary rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Kod śledzenia</p>
            <p className="font-mono text-2xl font-bold text-primary">{trackingCode}</p>
          </div>

          <div className="space-y-3">
            <Button onClick={resetForm} className="w-full">
              Zarejestruj kolejną
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'} className="w-full">
              Wróć do panelu
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft">
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          Zarejestruj rozdaną Podróżówkę
        </h2>
        <p className="text-muted-foreground mb-6">
          Przekazałeś komuś Podróżówkę? Zarejestruj ją tutaj i śledź jej podróż!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Zdjęcie momentu wręczenia (opcjonalne)
            </label>
            
            {photoPreview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
                <img
                  src={photoPreview}
                  alt="Podgląd"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 p-2 bg-foreground/80 text-background rounded-full hover:bg-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-3 bg-muted/30"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">Dodaj zdjęcie</p>
                  <p className="text-sm text-muted-foreground">Max 5MB, JPG lub PNG</p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Recipient name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Imię odbiorcy *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="np. Marco, Yuki, Hans..."
                value={givenToName}
                onChange={(e) => setGivenToName(e.target.value)}
                className="pl-10"
              />
            </div>
            {errors.givenToName && (
              <p className="text-sm text-destructive mt-1">{errors.givenToName}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Kraj odbiorcy *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
              <select
                value={givenToCountry}
                onChange={(e) => setGivenToCountry(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Wybierz kraj</option>
                {countries.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            {errors.givenToCountry && (
              <p className="text-sm text-destructive mt-1">{errors.givenToCountry}</p>
            )}
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Język na Podróżówce *
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    language === lang.code
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  title={lang.name}
                >
                  <span className="text-2xl">{lang.flag}</span>
                </button>
              ))}
            </div>
            {errors.language && (
              <p className="text-sm text-destructive mt-1">{errors.language}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Historia / wiadomość (opcjonalne)
            </label>
            <Textarea
              placeholder="Opowiedz jak poznałeś odbiorcę, gdzie go spotkałeś..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-destructive mt-1">{errors.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{message.length}/500 znaków</p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejestrowanie...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Zarejestruj Podróżówkę
              </>
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default RegisterPostcardForm;
