import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { usePvcSizes, type PvcSize } from "@/lib/pvc-sizes";

function SizeRow({ initial }: { initial: PvcSize }) {
  const [saved, setSaved] = useState(initial);
  const [price, setPrice] = useState(String(initial.price));
  const [stock, setStock] = useState(String(initial.available));
  async function save() {
    const update = { price: Number(price), available: Number(stock) };
    if (!stock || !Number.isSafeInteger(update.available) || update.available < 0 ||
        !Number.isSafeInteger(update.price) || update.price < 1) return toast.error("Enter a valid price and stock count.");
    const { data } = await supabase.from("pvc_sheet_sizes").update(update)
      .eq("size", saved.size).eq("available", saved.available).eq("price", saved.price).select().maybeSingle();
    if (!data) return toast.error("Could not save. Reopen this product to refresh stock.");
    setSaved(data);
    toast.success("Shared size updated");
  }
  return <div className="flex flex-wrap items-center gap-2">
    <strong>{initial.size} inches</strong>
    <label>Price (Rs.) <input className="mt-input" type="number" min="1" value={price} onChange={e=>setPrice(e.target.value)} /></label>
    <label>Available <input className="mt-input" type="number" min="0" value={stock} onChange={e=>setStock(e.target.value)} /></label>
    <button type="button" onClick={save}>Save size</button>
  </div>;
}
export function PvcSizeEditor() {
  const sizes = usePvcSizes(true);
  return <fieldset><legend>Shared PVC sheet prices and stock</legend>{sizes.map(row=><SizeRow key={row.size} initial={row}/>)}</fieldset>;
}
