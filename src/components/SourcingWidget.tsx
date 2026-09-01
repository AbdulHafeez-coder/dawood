import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, Search, UploadCloud, MessageCircle, Loader2 } from "lucide-react";
import { useProducts, type Product } from "@/lib/shop";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SafeImage } from "./ui/SafeImage";

type Step = "initial" | "catalog_search" | "specs" | "contact" | "success";

export function SourcingWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("initial");
  const [query, setQuery] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Product[]>([]);
  
  // Form Data
  const [quantity, setQuantity] = useState("");
  const [specs, setSpecs] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [requestId, setRequestId] = useState("");

  const { products } = useProducts();

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      // reset on close
      setTimeout(() => {
        setStep("initial");
        setQuery("");
        setImage(null);
        setPreview(null);
        setMatches([]);
      }, 300);
    }
    setOpen(v);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSearch = () => {
    if (!query && !image) {
      toast.error("Please enter a product name or upload a picture");
      return;
    }
    
    setLoading(true);
    // Simulate AI/Search delay
    setTimeout(() => {
      // Basic local catalog search
      if (query) {
        const q = query.toLowerCase();
        const found = products.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.category?.toLowerCase().includes(q) || 
          p.tagline?.toLowerCase().includes(q)
        );
        setMatches(found.slice(0, 3));
      } else {
        setMatches([]);
      }
      setStep("catalog_search");
      setLoading(false);
    }, 800);
  };

  const handleSubmit = async () => {
    if (!name || !phone || !quantity) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      let imageUrl = null;
      const rid = `DM-${Math.floor(10000 + Math.random() * 90000)}`;
      setRequestId(rid);

      // Upload image if exists
      if (image) {
        const ext = image.name.split('.').pop();
        const fileName = `${rid}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("sourcing_images")
          .upload(fileName, image);
        
        if (uploadError) {
          console.error("Upload error:", uploadError);
          // don't fail completely if image fails, just continue without it
        } else {
          const { data: pubData } = supabase.storage.from("sourcing_images").getPublicUrl(fileName);
          imageUrl = pubData.publicUrl;
        }
      }

      // Insert Request
      const { error } = await (supabase as any).from("sourcing_requests").insert({
        id: rid,
        customer_name: name,
        customer_phone: phone,
        product_query: query || "Image based request",
        image_url: imageUrl,
        quantity: quantity,
        specs: specs,
        status: "New"
      });

      if (error) throw error;
      
      setStep("success");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const text = `Dawood Mart Product Request\n\nRequest ID: ${requestId}\nProduct: ${query || "Image attached"}\nQuantity: ${quantity}\nRequirements: ${specs}\nCustomer: ${name}\nPhone: ${phone}`;
    window.open(`https://wa.me/923024201342?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <Button 
          onClick={() => setOpen(true)}
          className="rounded-full shadow-xl bg-brand-ink hover:bg-brand-ink/90 text-white flex items-center gap-2 h-12 px-5 transition-transform hover:scale-105"
        >
          <Search className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Can't Find What You Need?</span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Need Something Special?</DialogTitle>
            <DialogDescription>
              Tell us what you're looking for. You can search by name or upload a picture.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {step === "initial" && (
              <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="space-y-2">
                  <Label>Search by Name</Label>
                  <Input 
                    placeholder="e.g., White ceramic dinner set" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-brand-line" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-brand-paper px-2 text-brand-mute">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Upload Product Picture</Label>
                  <div className="border-2 border-dashed border-brand-line rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-brand-sand hover:bg-brand-stone transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageChange}
                    />
                    {preview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                        <img src={preview} alt="Preview" className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-brand-mute" />
                        <span className="text-sm font-medium text-brand-ink">Tap to upload a photo</span>
                      </>
                    )}
                  </div>
                </div>

                <Button className="w-full" onClick={handleSearch} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check Availability"}
                </Button>
              </div>
            )}

            {step === "catalog_search" && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                {matches.length > 0 ? (
                  <>
                    <div className="bg-brand-sand p-3 rounded-lg text-sm text-brand-ink">
                      We found some products that may match what you're looking for:
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {matches.map(p => (
                        <div key={p.id} className="flex gap-3 items-center border border-brand-line rounded-lg p-2">
                          <SafeImage src={p.img} alt={p.name} className="w-16 h-16 object-cover rounded-md" />
                          <div className="flex-1">
                            <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                            <p className="text-sm font-semibold text-brand-ink">Rs. {p.price}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => {
                            setOpen(false);
                            window.location.href = `/product/${p.id}`;
                          }}>View</Button>
                        </div>
                      ))}
                    </div>
                    <div className="relative pt-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-brand-line" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-brand-paper px-2 text-brand-mute">Not what you need?</span>
                      </div>
                    </div>
                    <Button variant="secondary" className="w-full" onClick={() => setStep("specs")}>
                      Create Custom Request
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-amber-50 text-amber-900 p-4 rounded-lg text-sm text-center">
                      We couldn't find this exact product in our current catalog.
                    </div>
                    <p className="text-center text-brand-ink text-sm font-medium">
                      But we may be able to arrange it for you!
                    </p>
                    <p className="text-center text-brand-mute text-xs">
                      Our team will check availability and supplier pricing first.
                    </p>
                    <Button className="w-full mt-4" onClick={() => setStep("specs")}>
                      Continue Request
                    </Button>
                  </>
                )}
              </div>
            )}

            {step === "specs" && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label>How many pieces do you need?</Label>
                  <Input 
                    placeholder="e.g., 50 pieces" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preferred Specifications (Optional)</Label>
                  <Textarea 
                    placeholder="Color, Size, Material, Brand, etc." 
                    value={specs}
                    onChange={(e) => setSpecs(e.target.value)}
                    className="resize-none"
                  />
                </div>
                <Button className="w-full" onClick={() => setStep("contact")}>
                  Next Step
                </Button>
              </div>
            )}

            {step === "contact" && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label>Your Name <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp / Mobile Number <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="03XX XXXXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Product Request"}
                </Button>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-4 text-center animate-in zoom-in duration-300 py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-brand-ink">Request Received!</h3>
                <p className="text-sm font-medium text-brand-ink bg-brand-sand py-2 rounded-md">
                  Request #{requestId}
                </p>
                <p className="text-sm text-brand-mute">
                  Our team will check availability, supplier pricing and expected delivery time. We'll contact you with the quotation.
                </p>
                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white flex gap-2" 
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Send Request on WhatsApp
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
