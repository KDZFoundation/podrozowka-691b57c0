import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fetchConnections = async () => {
  const { data, error } = await supabase
    .from("recipient_registrations")
    .select(`
      id, recipient_name, recipient_message, registered_at,
      inventory_units(card_designs(countries(name_pl)))
    `)
    .not("recipient_message", "is", null)
    .order("registered_at", { ascending: false })
    .limit(9);

  if (error) throw error;
  return data ?? [];
};

const ConnectionsGallery = () => {
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ["connections-gallery"],
    queryFn: fetchConnections,
  });

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <ul>
      {connections.map((c) => (
        <li key={c.id}>
          <strong>{c.recipient_name}</strong>: {c.recipient_message}
        </li>
      ))}
    </ul>
  );
};

export default ConnectionsGallery;
