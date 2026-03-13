import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">
            Polityka prywatności
          </h1>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground/70">Ostatnia aktualizacja: 13 marca 2026</p>

            <h2 className="text-xl font-semibold text-foreground mt-8">1. Administrator danych</h2>
            <p>
              Administratorem Twoich danych osobowych jest Podróżówka z siedzibą w Polsce. 
              Kontakt: <a href="mailto:kontakt@podrozowka.pl" className="text-primary hover:underline">kontakt@podrozowka.pl</a>.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">2. Jakie dane zbieramy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dane konta: adres e-mail, imię, nazwisko, nazwa wyświetlana, zdjęcie profilowe.</li>
              <li>Dane zamówień: adres dostawy, historia zakupów.</li>
              <li>Dane rejestracji pocztówek: imię odbiorcy, opcjonalna wiadomość, lokalizacja (za zgodą).</li>
              <li>Dane techniczne: adres IP, typ przeglądarki, czas wizyt.</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8">3. Cel przetwarzania</h2>
            <p>
              Twoje dane przetwarzamy w celu realizacji zamówień, prowadzenia konta użytkownika, 
              obsługi systemu grywalizacji oraz komunikacji związanej z projektem Podróżówka.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">4. Udostępnianie danych</h2>
            <p>
              Nie sprzedajemy Twoich danych. Możemy je udostępniać wyłącznie zaufanym partnerom 
              w celu realizacji usług (np. dostawcom przesyłek).
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">5. Twoje prawa</h2>
            <p>
              Masz prawo do dostępu, sprostowania, usunięcia swoich danych oraz ograniczenia 
              ich przetwarzania. Skontaktuj się z nami pod adresem kontakt@podrozowka.pl.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">6. Pliki cookies</h2>
            <p>
              Strona wykorzystuje pliki cookies w celu zapewnienia prawidłowego działania serwisu 
              oraz analizy ruchu. Możesz zarządzać ustawieniami cookies w przeglądarce.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
