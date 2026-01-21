import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Gift, Package, MapPin, ArrowLeft, Plus, 
  Camera, Loader2, CheckCircle, Clock, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import RegisterPostcardForm from "@/components/dashboard/RegisterPostcardForm";
import UserStats from "@/components/dashboard/UserStats";
import MyPostcards from "@/components/dashboard/MyPostcards";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  country: string | null;
  city: string | null;
  postcards_given: number;
  postcards_received: number;
}

const Dashboard = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'register' | 'my-postcards'>('overview');

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
        setProfile(data);
      } else if (!data) {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (!createError && newProfile) {
          setProfile(newProfile);
        }
      }
      setIsLoading(false);
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: User },
    { id: 'register', label: 'Zarejestruj Podróżówkę', icon: Plus },
    { id: 'my-postcards', label: 'Moje Podróżówki', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Powrót</span>
              </a>
              <span className="font-display text-xl font-semibold text-foreground">
                Panel Podróżówka
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {profile?.display_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profile?.postcards_given || 0} rozdanych
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <UserStats profile={profile} userId={user.id} />
        )}
        {activeTab === 'register' && (
          <RegisterPostcardForm 
            userId={user.id} 
            onSuccess={() => {
              // Refresh profile stats
              supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle()
                .then(({ data }) => {
                  if (data) setProfile(data);
                });
            }}
          />
        )}
        {activeTab === 'my-postcards' && (
          <MyPostcards userId={user.id} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
