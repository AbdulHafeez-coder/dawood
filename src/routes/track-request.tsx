import type { SourcingRequest } from "@/integrations/supabase/types";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatPKR } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/track-request")({
  component: TrackRequestPage,
});

function TrackRequestPage() {
  const [requestId, setRequestId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<SourcingRequest | null>(null);

  const handleSearch = async () => {
    if (!requestId || !phone) {
      toast.error("Please enter both Request ID and Phone Number");
      return;
    }

    setLoading(true);
    setRequest(null);
    try {
      const { data, error } = await supabase
        .from("sourcing_requests")
        .select("*")
        .eq("id", requestId.toUpperCase())
        .eq("customer_phone", phone)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          toast.error("Request not found. Please check your details.");
        } else {
          throw error;
        }
      } else {
        setRequest(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while fetching the request.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Under Review":
        return "bg-amber-100 text-amber-800";
      case "Quote Ready":
        return "bg-purple-100 text-purple-800";
      case "Advance Paid":
        return "bg-emerald-100 text-emerald-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFDF9] flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </Link>

        <h1 className="text-3xl font-semibold tracking-tight text-center mb-2">
          Track Custom Request
        </h1>
        <p className="text-center text-black/60 mb-8">
          Enter your Request ID and Phone Number to check the status of your sourcing request.
        </p>

        {!request ? (
          <div className="bg-white border border-black/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <Label>Request ID</Label>
              <Input
                placeholder="e.g. DM-10482"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="03XX XXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button className="w-full h-11" onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track Request"}
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 sm:p-8 border-b border-black/5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Request {request.id}</h2>
                  <p className="text-sm text-black/50 mt-1">
                    Placed {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}
                >
                  {request.status}
                </span>
              </div>

              <div className="flex gap-4">
                {request.image_url ? (
                  <SafeImage
                    src={request.image_url}
                    className="w-24 h-24 object-cover rounded-lg border border-black/10"
                    alt="Product"
                  />
                ) : (
                  <div className="w-24 h-24 bg-black/5 rounded-lg flex items-center justify-center border border-black/10">
                    <Search className="w-6 h-6 text-black/20" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-lg line-clamp-2">{request.product_query}</p>
                  <p className="text-sm text-black/60 mt-2">Quantity: {request.quantity}</p>
                  <p className="text-sm text-black/60 mt-1">Specs: {request.specs || "None"}</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-black/5 space-y-6">
              <h3 className="font-semibold text-lg">Quotation Details</h3>

              {request.quoted_price ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-black/10">
                    <span className="text-black/60">Total Estimated Cost</span>
                    <span className="font-medium">{formatPKR(request.quoted_price)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-black/10">
                    <span className="text-black/60">Estimated Delivery</span>
                    <span className="font-medium">{request.estimated_delivery || "TBD"}</span>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-black/10 shadow-sm mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-brand-ink">Required Advance (10%)</span>
                      <span className="font-bold text-lg">{formatPKR(request.advance_amount)}</span>
                    </div>
                    <p className="text-xs text-black/50 mb-4">
                      Please pay the advance to confirm the sourcing process.
                    </p>
                    <Button
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
                      onClick={() =>
                        window.open(
                          `https://wa.me/923024201342?text=${encodeURIComponent(`Hi, I'm ready to pay the 10% advance for my custom request ${request.id}.`)}`,
                          "_blank",
                        )
                      }
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm & Pay via WhatsApp
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-black/30 mb-3" />
                  <p className="text-sm text-black/60">
                    Our team is currently reviewing supplier availability and pricing. Please check
                    back later.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white text-center">
              <button
                onClick={() => setRequest(null)}
                className="text-sm text-brand-mute hover:text-brand-ink underline underline-offset-4 transition-colors"
              >
                Track another request
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
