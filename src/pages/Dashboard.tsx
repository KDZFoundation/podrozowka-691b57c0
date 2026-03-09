import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Package, ArrowLeft, Loader2, Shield, ShoppingCart, Truck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import useRealtimeNotifications from "@/hooks/useRealtimeNotifications";
import UserStats from "@/components/dashboard/UserStats";
import RankCard from "@/components/dashboard/RankCard";
import MyPostcards from "@/components/dashboard/MyPostcards";
import MyOrders from "@/components/dashboard/MyOrders";
import MyShipments from "@/components/dashboard/MyShipments";
import CulturalMissions from "@/components/dashboard/CulturalMissions";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

interface Profile {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  postcards_purchased: number;
  postcards_received: number;
  total_points: number;
  current_rank: string;
}

const Dashboard = () => {
  const { user, isLoading: authLoading, isAdmin, signOut } = useAuth();
  useRealtimeNotifications();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'my-postcards' | 'my-orders' | 'my-shipments'>('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
      }
      setIsLoading(false);
    };

    if (user) fetchProfile();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: User },
    { id: 'my-orders', label: 'Moje zamówienia', icon: ShoppingCart },
    { id: 'my-shipments', label: 'Moje wysyłki', icon: Truck },
    { id: 'my-postcards', label: 'Moje Podróżówki', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Powrót</span>
              </a>
              <span className="font-display text-xl font-semibold text-foreground">Panel Podróżówka</span>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <a href="/admin" className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
                  <Shield className="w-4 h-4" />Admin
                </a>
              )}
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{profile?.display_name || user.email}</p>
                <p className="text-xs text-muted-foreground">{profile?.postcards_purchased || 0} zakupionych</p>
              </div>
              <button onClick={signOut} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Wyloguj
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <RankCard userId={user.id} />
        {activeTab === 'overview' && <UserStats profile={profile} userId={user.id} />}
        {activeTab === 'my-orders' && <MyOrders userId={user.id} />}
        {activeTab === 'my-shipments' && <MyShipments userId={user.id} />}
        {activeTab === 'my-postcards' && <MyPostcards userId={user.id} />}
      </main>
    </div>
  );
};

export default Dashboard;
