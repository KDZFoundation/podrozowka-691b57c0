import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PostcardPreview from "@/components/PostcardPreview";
import PlatformStats from "@/components/PlatformStats";
import About from "@/components/About";
import DistributionMap from "@/components/DistributionMap";
import CountryCategories from "@/components/CountryCategories";
import UserRanking from "@/components/UserRanking";
import CommunityGallery from "@/components/CommunityGallery";
import LanguageShowcase from "@/components/LanguageShowcase";
import PhotoGallery from "@/components/PhotoGallery";
import Footer from "@/components/Footer";
import ConnectionsGallery from "@/components/ConnectionsGallery";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

const Index = () => {
  const { isAdmin } = useAuth();
  const { flags } = useFeatureFlags();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <PostcardPreview />
      <PlatformStats />
      <About />
      <DistributionMap />
      <CountryCategories />
      <UserRanking />
      <CommunityGallery />
      <LanguageShowcase />
      <PhotoGallery />
      <Footer />
    </div>
  );
};

export default Index;
