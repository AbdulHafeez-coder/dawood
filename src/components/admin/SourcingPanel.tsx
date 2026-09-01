import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SafeImage } from "@/components/ui/SafeImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

export function SourcingPanel() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("sourcing_requests")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet
          toast.error("Database migration required for Sourcing Requests.");
        } else {
          throw error;
        }
      }
      setRequests(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    setUpdating(id);
    try {
      const { error } = await (supabase as any)
        .from("sourcing_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      toast.success("Request updated");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-medium tracking-tight">Sourcing Requests</h2>
          <p className="text-sm text-black/55 mt-1">
            Manage customer requests for items not in the catalog.
          </p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-black/50 w-8 h-8" /></div>
      ) : requests.length === 0 ? (
        <div className="text-center p-12 border border-black/10 border-dashed rounded-xl bg-black/5">
          <Search className="w-8 h-8 text-black/30 mx-auto mb-3" />
          <h3 className="font-medium text-black/70">No Requests Yet</h3>
          <p className="text-sm text-black/50">When customers submit custom requests, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white border border-black/10 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {req.image_url ? (
                    <SafeImage src={req.image_url} alt="Requested item" className="w-20 h-20 object-cover rounded-md border" />
                  ) : (
                    <div className="w-20 h-20 bg-black/5 rounded-md flex items-center justify-center text-xs text-black/40">
                      No Image
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-base">Request {req.id}</h3>
                    <p className="text-sm text-black/70 mt-1">Customer: {req.customer_name} ({req.customer_phone})</p>
                    <p className="text-sm text-black/70">Query: <span className="font-semibold">{req.product_query}</span></p>
                    <p className="text-sm text-black/50 text-xs mt-1">Placed: {new Date(req.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <Select 
                    value={req.status} 
                    onValueChange={(val) => handleUpdate(req.id, { status: val })}
                    disabled={updating === req.id}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Supplier Check">Supplier Check</SelectItem>
                      <SelectItem value="Quote Ready">Quote Ready</SelectItem>
                      <SelectItem value="Awaiting Advance">Awaiting Advance</SelectItem>
                      <SelectItem value="Advance Paid">Advance Paid</SelectItem>
                      <SelectItem value="Procurement Started">Procurement Started</SelectItem>
                      <SelectItem value="Ready for Customer">Ready for Customer</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/5 p-4 rounded-lg text-sm">
                <div>
                  <p className="text-black/50 text-[10px] uppercase tracking-wider mb-1">Quantity</p>
                  <p className="font-medium">{req.quantity || "N/A"}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-black/50 text-[10px] uppercase tracking-wider mb-1">Specifications</p>
                  <p>{req.specs || "None provided"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-black/50">Total Price (PKR)</label>
                  <Input 
                    type="number" 
                    defaultValue={req.quoted_price || ""} 
                    placeholder="e.g. 50000"
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== Number(req.quoted_price)) {
                        handleUpdate(req.id, { quoted_price: val, advance_amount: val * 0.10 });
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-black/50">10% Advance</label>
                  <Input 
                    type="number" 
                    value={req.advance_amount || ""}
                    disabled
                    className="bg-black/5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-black/50">Delivery Estimate</label>
                  <Input 
                    defaultValue={req.estimated_delivery || ""}
                    placeholder="e.g. 10-15 days"
                    onBlur={(e) => {
                      if (e.target.value !== req.estimated_delivery) {
                        handleUpdate(req.id, { estimated_delivery: e.target.value });
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
