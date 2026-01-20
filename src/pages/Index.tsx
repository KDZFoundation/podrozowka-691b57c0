import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import EuropeMap from "@/components/EuropeMap";
import CountryCategories from "@/components/CountryCategories";
import LanguageShowcase from "@/components/LanguageShowcase";
import PhotoGallery from "@/components/PhotoGallery";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <About />
      <EuropeMap />
      <CountryCategories />
      <LanguageShowcase />
      <PhotoGallery />
      <Footer />
    </div>
  );
};

export default Index;
