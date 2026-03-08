import { useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminDevTools = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // TODO: implement mock data generation
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Dane testowe zostały wygenerowane!");
    } catch {
      toast.error("Błąd podczas generowania danych testowych.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-foreground">Narzędzia Dev</h2>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Generowanie danych testowych
          </CardTitle>
          <CardDescription>
            Symuluj ruch w aplikacji — wygeneruj testowe zamówienia, kartki pocztowe i rejestracje odbiorców. Idealne do testowania dashboardu, powiadomień i statystyk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {isGenerating ? "Generowanie…" : "Wygeneruj paczkę testową (Mock Data)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDevTools;
