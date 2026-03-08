import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Clock } from "lucide-react";

interface EventLogEntry {
  id: string;
  unit_code: string;
  country_name: string | null;
  design_title: string | null;
  view_no: number | null;
  fulfillment_status: string;
  business_status: string | null;
  traveler_name: string | null;
  order_id: string | null;
  created_at: string;
  qr_generated_at: string | null;
  qr_applied_at: string | null;
  shipped_at: string | null;
  registered_at: string | null;
}

const FULFILLMENT_LABELS: Record<string, string> = {
  in_stock: "W magazynie",
  reserved: "Zarezerwowana",
  qr_generated: "QR wygenerowany",
  qr_applied: "QR naklejony",
  shipped: "Wysłana",
  voided: "Anulowana",
  damaged: "Uszkodzona",
};

const PAGE_SIZE = 50;

const AdminEventLog = () => {
  const [entries, setEntries] = useState<EventLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchLog();
  }, [statusFilter, page]);

  const fetchLog = async () => {
    setIsLoading(true);

    let query = supabase
      .from("inventory_units")
      .select(`
        id, internal_inventory_code, fulfillment_status, business_status,
        traveler_user_id, order_id,
        created_at, qr_generated_at, qr_applied_at, shipped_at, registered_at,
        card_designs!inner(title, view_no, countries!inner(name_pl))
      `)
      .order("updated_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (statusFilter !== "all") {
      query = query.eq("fulfillment_status", statusFilter as any);
    }

    const { data, error } = await query;

    if (!error && data) {
      const travelerIds = [...new Set(data.map((u: any) => u.traveler_user_id).filter(Boolean))];
      let nameMap = new Map<string, string>();
      if (travelerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", travelerIds);
        if (profiles) nameMap = new Map(profiles.map((p) => [p.user_id, p.display_name || ""]));
      }

      setEntries(
        data.map((u: any) => ({
          id: u.id,
          unit_code: u.internal_inventory_code,
          country_name: u.card_designs?.countries?.name_pl,
          design_title: u.card_designs?.title,
          view_no: u.card_designs?.view_no,
          fulfillment_status: u.fulfillment_status,
          business_status: u.business_status,
          traveler_name: nameMap.get(u.traveler_user_id) || null,
          order_id: u.order_id,
          created_at: u.created_at,
          qr_generated_at: u.qr_generated_at,
          qr_applied_at: u.qr_applied_at,
          shipped_at: u.shipped_at,
          registered_at: u.registered_at,
        }))
      );
    }
    setIsLoading(false);
  };

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.unit_code.toLowerCase().includes(q) ||
      e.country_name?.toLowerCase().includes(q) ||
      e.traveler_name?.toLowerCase().includes(q) ||
      e.order_id?.toLowerCase().includes(q)
    );
  });

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null;

  const fulfillmentBadge = (status: string) => {
    const colors: Record<string, string> = {
      in_stock: "bg-muted text-muted-foreground",
      reserved: "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]",
      qr_generated: "bg-primary/15 text-primary",
      qr_applied: "bg-primary/25 text-primary",
      shipped: "bg-accent/15 text-accent",
      voided: "bg-destructive/15 text-destructive",
      damaged: "bg-destructive/25 text-destructive",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>
        {FULFILLMENT_LABELS[status] || status}
      </span>
    );
  };

  const buildTimeline = (e: EventLogEntry) => {
    const steps: { label: string; date: string | null }[] = [
      { label: "Utworzono", date: e.created_at },
      { label: "QR gen.", date: e.qr_generated_at },
      { label: "QR naklej.", date: e.qr_applied_at },
      { label: "Wysłano", date: e.shipped_at },
      { label: "Rejestracja", date: e.registered_at },
    ];
    return steps.filter((s) => s.date);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" /> Log zdarzeń kartki
      </h2>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Szukaj po kodzie, kraju, podróżniku, zamówieniu..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            {Object.entries(FULFILLMENT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Kod</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Kraj / Wzór</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Biznesowy</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Podróżnik</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Oś czasu</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Brak wyników</td></tr>
              ) : (
                filtered.map((e) => {
                  const timeline = buildTimeline(e);
                  return (
                    <tr key={e.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs">{e.unit_code}</td>
                      <td className="p-3">
                        <span className="text-foreground">{e.country_name}</span>
                        <span className="text-muted-foreground ml-1 text-xs">V{e.view_no} {e.design_title || ""}</span>
                      </td>
                      <td className="p-3">{fulfillmentBadge(e.fulfillment_status)}</td>
                      <td className="p-3">
                        {e.business_status ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.business_status === 'registered' ? 'bg-accent/15 text-accent' : 'bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]'}`}>
                            {e.business_status === 'registered' ? 'Zarejestrowana' : 'Kupiona'}
                          </span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="p-3 text-xs">{e.traveler_name || "—"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {timeline.map((step, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground" title={formatDate(step.date) || ""}>
                              {step.label}: {formatDate(step.date)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between p-3 border-t border-border">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Poprzednia</Button>
          <span className="text-xs text-muted-foreground">Strona {page + 1}</span>
          <Button variant="outline" size="sm" disabled={filtered.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>Następna</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminEventLog;
