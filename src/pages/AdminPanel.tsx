import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, Globe2, Users, QrCode, BarChart3, ArrowLeft,
  Loader2, Search, Filter, CheckCircle, ShoppingBag, Box, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AdminCountries from "@/components/admin/AdminCountries";
import AdminCardDesigns from "@/components/admin/AdminCardDesigns";
import AdminInventory from "@/components/admin/AdminInventory";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AdminCountries from "@/components/admin/AdminCountries";
import AdminCardDesigns from "@/components/admin/AdminCardDesigns";

interface PostcardRow {
  id: string;
  serial_number: number;
  qr_token: string;
  status: string;
  buyer_display_name: string | null;
  purchased_at: string | null;
  recipient_name: string | null;
  registered_at: string | null;
  order_reference: string | null;
  design_view_name: string | null;
  country_name: string | null;
  country_flag: string | null;
}

interface AdminStats {
  total: number;
  available: number;
  purchased: number;
  registered: number;
  countries: number;
  designs: number;
}

const AdminPanel = () => {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'postcards' | 'registrations' | 'countries' | 'card-designs'>('overview');
  const [stats, setStats] = useState<AdminStats>({ total: 0, available: 0, purchased: 0, registered: 0, countries: 0, designs: 0 });
  const [postcards, setPostcards] = useState<PostcardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'purchased' | 'registered'>('all');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/dashboard");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchStats();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'postcards' || activeTab === 'registrations') {
      fetchPostcards();
    }
  }, [isAdmin, activeTab, statusFilter, page]);

  const fetchStats = async () => {
    const [
      { count: total },
      { count: available },
      { count: purchased },
      { count: registered },
      { count: countries },
      { count: designs },
    ] = await Promise.all([
      supabase.from('postcards').select('*', { count: 'exact', head: true }),
      supabase.from('postcards').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('postcards').select('*', { count: 'exact', head: true }).eq('status', 'purchased'),
      supabase.from('postcards').select('*', { count: 'exact', head: true }).eq('status', 'registered'),
      supabase.from('countries').select('*', { count: 'exact', head: true }),
      supabase.from('card_designs').select('*', { count: 'exact', head: true }),
    ]);

    setStats({
      total: total || 0,
      available: available || 0,
      purchased: purchased || 0,
      registered: registered || 0,
      countries: countries || 0,
      designs: designs || 0,
    });
    setIsLoading(false);
  };

  const fetchPostcards = async () => {
    let query = supabase
      .from('postcards')
      .select(`
        id, serial_number, qr_token, status, buyer_display_name,
        purchased_at, recipient_name, registered_at, order_reference,
        card_designs!inner(title, countries!inner(name_pl, iso2))
      `)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (activeTab === 'registrations') {
      query = query.eq('status', 'registered');
    } else if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPostcards(data.map((p: any) => ({
        id: p.id,
        serial_number: p.serial_number,
        qr_token: p.qr_token,
        status: p.status,
        buyer_display_name: p.buyer_display_name,
        purchased_at: p.purchased_at,
        recipient_name: p.recipient_name,
        registered_at: p.registered_at,
        order_reference: p.order_reference,
        design_view_name: p.card_designs?.title,
        country_name: p.card_designs?.countries?.name_pl,
        country_flag: null,
      })));
    }
  };

  const filteredPostcards = postcards.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.qr_token.toLowerCase().includes(q) ||
      p.buyer_display_name?.toLowerCase().includes(q) ||
      p.recipient_name?.toLowerCase().includes(q) ||
      p.order_reference?.toLowerCase().includes(q) ||
      p.country_name?.toLowerCase().includes(q)
    );
  });

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      available: { label: 'Dostępna', className: 'bg-muted text-muted-foreground' },
      purchased: { label: 'Kupiona', className: 'bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]' },
      registered: { label: 'Zarejestrowana', className: 'bg-accent/15 text-accent' },
    };
    const s = map[status] || map.available;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>{s.label}</span>;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: BarChart3 },
    { id: 'postcards', label: 'Magazyn kartek', icon: Package },
    { id: 'registrations', label: 'Rejestracje QR', icon: QrCode },
    { id: 'countries', label: 'Kraje', icon: Globe2 },
    { id: 'card-designs', label: 'Wzory kartek', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Dashboard</span>
              </a>
              <span className="font-display text-xl font-semibold text-primary">Panel Admina</span>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setPage(0); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Statystyki magazynu</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Box, label: 'Wszystkie', value: stats.total, color: 'text-foreground' },
                { icon: Package, label: 'Dostępne', value: stats.available, color: 'text-muted-foreground' },
                { icon: ShoppingBag, label: 'Kupione', value: stats.purchased, color: 'text-[hsl(var(--gold))]' },
                { icon: CheckCircle, label: 'Zarejestrowane', value: stats.registered, color: 'text-accent' },
                { icon: Globe2, label: 'Krajów', value: stats.countries, color: 'text-primary' },
                { icon: Package, label: 'Wzorów', value: stats.designs, color: 'text-primary' },
              ].map((s) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 shadow-soft">
                  <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
                  <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'postcards' || activeTab === 'registrations') && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Szukaj po QR, nazwisku, zamówieniu..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              {activeTab === 'postcards' && (
                <div className="flex gap-1">
                  {(['all', 'available', 'purchased', 'registered'] as const).map((f) => (
                    <button key={f} onClick={() => { setStatusFilter(f); setPage(0); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {f === 'all' ? 'Wszystkie' : f === 'available' ? 'Dostępne' : f === 'purchased' ? 'Kupione' : 'Zarejestrowane'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-medium text-muted-foreground">Kraj</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Wzór</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Nr</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">QR Token</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Kupujący</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Zamówienie</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Obdarowany</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Data rej.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPostcards.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="p-3">{p.country_flag} {p.country_name}</td>
                        <td className="p-3 text-muted-foreground">{p.design_view_name}</td>
                        <td className="p-3 font-mono text-xs">{p.serial_number}</td>
                        <td className="p-3">{statusBadge(p.status)}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{p.qr_token.slice(0, 12)}...</td>
                        <td className="p-3">{p.buyer_display_name || '—'}</td>
                        <td className="p-3 font-mono text-xs">{p.order_reference || '—'}</td>
                        <td className="p-3">{p.recipient_name || '—'}</td>
                        <td className="p-3 text-xs text-muted-foreground">{formatDate(p.registered_at)}</td>
                      </tr>
                    ))}
                    {filteredPostcards.length === 0 && (
                      <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">Brak wyników</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between p-3 border-t border-border">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Poprzednia</Button>
                <span className="text-xs text-muted-foreground">Strona {page + 1}</span>
                <Button variant="outline" size="sm" disabled={filteredPostcards.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)}>Następna</Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'countries' && <AdminCountries />}
        {activeTab === 'card-designs' && <AdminCardDesigns />}
      </main>
    </div>
  );
};

export default AdminPanel;
