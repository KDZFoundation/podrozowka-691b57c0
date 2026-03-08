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
import { Loader2, ShoppingCart, ArrowLeft, Plus, Minus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  items_count?: number;
}

interface OrderDetail extends Order {
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  notes: string | null;
  paid_at: string | null;
  fulfilled_at: string | null;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  card_design_id: string;
  design_title: string | null;
  country_name: string | null;
  view_no: number | null;
}

interface DesignOption {
  id: string;
  title: string | null;
  view_no: number;
  country_id: string;
  country_name: string;
}

interface CartItem {
  design_id: string;
  quantity: number;
  design: DesignOption;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Oczekujące", className: "bg-muted text-muted-foreground" },
  paid: { label: "Opłacone", className: "bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))]" },
  fulfilled: { label: "Zrealizowane", className: "bg-accent/15 text-accent" },
  cancelled: { label: "Anulowane", className: "bg-destructive/15 text-destructive" },
};

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Nieopłacone",
  paid: "Opłacone",
  refunded: "Zwrócone",
  failed: "Nieudane",
};

const MyOrders = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // New order
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [designs, setDesigns] = useState<DesignOption[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Polska");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, status, payment_status, total_amount, currency, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setIsLoading(false);
  };

  const fetchOrderDetail = async (orderId: string) => {
    setDetailLoading(true);
    const [{ data: order }, { data: items }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase
        .from("order_items")
        .select(`
          id, quantity, unit_price, total_price, card_design_id,
          card_designs!inner(title, view_no, countries!inner(name_pl))
        `)
        .eq("order_id", orderId),
    ]);

    if (order) {
      setSelectedOrder({
        ...order,
        items: (items || []).map((i: any) => ({
          id: i.id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          total_price: i.total_price,
          card_design_id: i.card_design_id,
          design_title: i.card_designs?.title,
          country_name: i.card_designs?.countries?.name_pl,
          view_no: i.card_designs?.view_no,
        })),
      });
    }
    setDetailLoading(false);
  };

  const loadDesigns = async () => {
    const { data } = await supabase
      .from("card_designs")
      .select("id, title, view_no, country_id, countries!inner(name_pl)")
      .eq("active", true)
      .order("view_no");

    if (data) {
      setDesigns(
        data.map((d: any) => ({
          id: d.id,
          title: d.title,
          view_no: d.view_no,
          country_id: d.country_id,
          country_name: d.countries?.name_pl || "",
        }))
      );
    }
  };

  const openNewOrder = () => {
    setShowNewOrder(true);
    setCart([]);
    loadDesigns();
  };

  const addToCart = (designId: string) => {
    const design = designs.find((d) => d.id === designId);
    if (!design) return;
    const existing = cart.find((c) => c.design_id === designId);
    if (existing) {
      setCart(cart.map((c) => (c.design_id === designId ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { design_id: designId, quantity: 1, design }]);
    }
  };

  const updateCartQty = (designId: string, delta: number) => {
    setCart(
      cart
        .map((c) => (c.design_id === designId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const UNIT_PRICE = 9.99;

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast({ title: "Dodaj przynajmniej jedną pozycję", variant: "destructive" });
      return;
    }
    if (!shippingName || !shippingAddress || !shippingCity || !shippingPostalCode) {
      toast({ title: "Uzupełnij dane wysyłki", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const totalAmount = cart.reduce((sum, c) => sum + c.quantity * UNIT_PRICE, 0);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        shipping_name: shippingName,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_postal_code: shippingPostalCode,
        shipping_country: shippingCountry,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      toast({ title: "Błąd tworzenia zamówienia", description: orderError?.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const items = cart.map((c) => ({
      order_id: order.id,
      card_design_id: c.design_id,
      quantity: c.quantity,
      unit_price: UNIT_PRICE,
      total_price: c.quantity * UNIT_PRICE,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(items);

    if (itemsError) {
      toast({ title: "Błąd dodawania pozycji", description: itemsError.message, variant: "destructive" });
    } else {
      toast({ title: "Zamówienie złożone!" });
      setShowNewOrder(false);
      setCart([]);
      fetchOrders();
    }
    setIsSubmitting(false);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusBadge = (status: string) => {
    const s = STATUS_LABELS[status] || STATUS_LABELS.pending;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>{s.label}</span>;
  };

  // Order detail view
  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Wróć do listy
        </button>

        {detailLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">{selectedOrder.order_number}</h3>
                {statusBadge(selectedOrder.status)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Data:</span><p>{formatDate(selectedOrder.created_at)}</p></div>
                <div><span className="text-muted-foreground">Płatność:</span><p>{PAYMENT_LABELS[selectedOrder.payment_status]}</p></div>
                <div><span className="text-muted-foreground">Kwota:</span><p className="font-bold">{Number(selectedOrder.total_amount).toFixed(2)} {selectedOrder.currency}</p></div>
                <div><span className="text-muted-foreground">Pozycji:</span><p>{selectedOrder.items.length}</p></div>
              </div>
              {selectedOrder.shipping_name && (
                <div className="border-t border-border pt-4 text-sm">
                  <p className="text-muted-foreground mb-1">Adres wysyłki:</p>
                  <p>{selectedOrder.shipping_name}</p>
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_postal_code} {selectedOrder.shipping_city}</p>
                  <p>{selectedOrder.shipping_country}</p>
                </div>
              )}
            </div>

            <div className="bg-card rounded-xl shadow-soft overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">Wzór</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Kraj</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Ilość</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Cena jedn.</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Suma</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="p-3">V{item.view_no} {item.design_title || ""}</td>
                      <td className="p-3">{item.country_name}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">{Number(item.unit_price).toFixed(2)} PLN</td>
                      <td className="p-3 text-right font-medium">{Number(item.total_price).toFixed(2)} PLN</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  }

  // New order form
  if (showNewOrder) {
    return (
      <div className="space-y-6">
        <button onClick={() => setShowNewOrder(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Wróć do listy
        </button>

        <h2 className="font-display text-xl font-bold">Nowe zamówienie</h2>

        {/* Design picker */}
        <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
          <h3 className="font-medium">Wybierz kartki</h3>
          <Select onValueChange={addToCart}>
            <SelectTrigger><SelectValue placeholder="Dodaj wzór kartki..." /></SelectTrigger>
            <SelectContent>
              {designs.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.country_name} — Widok {d.view_no} {d.title ? `(${d.title})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {cart.length > 0 && (
            <div className="space-y-2">
              {cart.map((c) => (
                <div key={c.design_id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <span className="text-sm">{c.design.country_name} — V{c.design.view_no} {c.design.title || ""}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQty(c.design_id, -1)} className="p-1 hover:bg-muted rounded"><Minus className="w-4 h-4" /></button>
                    <span className="font-mono text-sm w-8 text-center">{c.quantity}</span>
                    <button onClick={() => updateCartQty(c.design_id, 1)} className="p-1 hover:bg-muted rounded"><Plus className="w-4 h-4" /></button>
                    <button onClick={() => setCart(cart.filter((x) => x.design_id !== c.design_id))} className="p-1 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="w-4 h-4" /></button>
                    <span className="text-sm font-medium w-20 text-right">{(c.quantity * UNIT_PRICE).toFixed(2)} PLN</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-border">
                <span className="font-display font-bold">
                  Razem: {cart.reduce((s, c) => s + c.quantity * UNIT_PRICE, 0).toFixed(2)} PLN
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Shipping */}
        <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
          <h3 className="font-medium">Dane wysyłki</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Imię i nazwisko" value={shippingName} onChange={(e) => setShippingName(e.target.value)} />
            <Input placeholder="Adres" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
            <Input placeholder="Miasto" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} />
            <Input placeholder="Kod pocztowy" value={shippingPostalCode} onChange={(e) => setShippingPostalCode(e.target.value)} />
            <Input placeholder="Kraj" value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)} />
          </div>
        </div>

        <Button onClick={submitOrder} disabled={isSubmitting || cart.length === 0} className="gap-2">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          Złóż zamówienie
        </Button>
      </div>
    );
  }

  // Orders list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Moje zamówienia</h2>
        <Button onClick={openNewOrder} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Nowe zamówienie</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-xl p-12 text-center shadow-soft">
          <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nie masz jeszcze żadnych zamówień</p>
          <Button onClick={openNewOrder} className="mt-4 gap-2"><Plus className="w-4 h-4" /> Złóż pierwsze zamówienie</Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Nr zamówienia</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Płatność</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Kwota</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => fetchOrderDetail(o.id)}>
                  <td className="p-3 font-mono text-xs">{o.order_number}</td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDate(o.created_at)}</td>
                  <td className="p-3">{statusBadge(o.status)}</td>
                  <td className="p-3 text-xs">{PAYMENT_LABELS[o.payment_status]}</td>
                  <td className="p-3 text-right font-medium">{Number(o.total_amount).toFixed(2)} {o.currency}</td>
                  <td className="p-3 text-xs text-primary">Szczegóły →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
