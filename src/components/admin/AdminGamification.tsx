import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Trophy } from "lucide-react";
import { toast } from "sonner";

interface Tier {
  id: string;
  name: string;
  min_points: number;
}

const AdminGamification = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [deletingTier, setDeletingTier] = useState<Tier | null>(null);
  const [formName, setFormName] = useState("");
  const [formMinPoints, setFormMinPoints] = useState("");

  const { data: tiers = [], isLoading } = useQuery({
    queryKey: ["admin-gamification-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gamification_tiers")
        .select("id, name, min_points")
        .order("min_points", { ascending: true });
      if (error) throw error;
      return data as Tier[];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ id, name, min_points }: { id?: string; name: string; min_points: number }) => {
      if (id) {
        const { error } = await supabase.from("gamification_tiers").update({ name, min_points }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("gamification_tiers").insert({ name, min_points });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gamification-tiers"] });
      toast.success(editingTier ? "Zaktualizowano rangę" : "Dodano nową rangę");
      closeDialog();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gamification_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-gamification-tiers"] });
      toast.success("Usunięto rangę");
      setDeleteDialogOpen(false);
      setDeletingTier(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const openAdd = () => {
    setEditingTier(null);
    setFormName("");
    setFormMinPoints("");
    setDialogOpen(true);
  };

  const openEdit = (tier: Tier) => {
    setEditingTier(tier);
    setFormName(tier.name);
    setFormMinPoints(String(tier.min_points));
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTier(null);
  };

  const handleSubmit = () => {
    const name = formName.trim();
    const min_points = parseInt(formMinPoints, 10);
    if (!name) return toast.error("Nazwa jest wymagana");
    if (isNaN(min_points) || min_points < 0) return toast.error("Punkty muszą być liczbą >= 0");
    upsertMutation.mutate({ id: editingTier?.id, name, min_points });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">Progi grywalizacji</h2>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Dodaj rangę
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-primary" /> Rangi i progi punktowe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : tiers.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">Brak zdefiniowanych rang.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa rangi</TableHead>
                  <TableHead className="text-right">Min. punktów</TableHead>
                  <TableHead className="text-right w-[120px]">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell className="text-right">{tier.min_points.toLocaleString("pl-PL")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(tier)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setDeletingTier(tier); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier ? "Edytuj rangę" : "Dodaj rangę"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tier-name">Nazwa rangi</Label>
              <Input id="tier-name" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="np. Ambasador" />
            </div>
            <div>
              <Label htmlFor="tier-points">Minimalna liczba punktów</Label>
              <Input id="tier-points" type="number" min="0" value={formMinPoints} onChange={(e) => setFormMinPoints(e.target.value)} placeholder="0" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Anuluj</Button>
            <Button onClick={handleSubmit} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingTier ? "Zapisz" : "Dodaj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń rangę</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Czy na pewno chcesz usunąć rangę <strong>{deletingTier?.name}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Anuluj</Button>
            <Button variant="destructive" onClick={() => deletingTier && deleteMutation.mutate(deletingTier.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGamification;
