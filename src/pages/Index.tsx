import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const GODS = [
  // Core Hindu Deities
  "Krishna", "Shiva", "Ram", "Hanuman", "Ganesha", "Vishnu", "Brahma",
  "Durga", "Lakshmi", "Saraswati", "Parvati", "Kartikeya", "Nandi",
  // Vishnu Avatars
  "Matsya", "Kurma", "Varaha", "Narasimha", "Vamana", "Parashurama",
  "Buddha", "Kalki",
  // Regional / Powerful Forms
  "Kali", "Balaji", "Ayyappa", "Surya", "Chandra", "Indra", "Agni",
  "Jagannath", "Vitthal", "Murugan", "Shani", "Kuber", "Yama", "Varuna",
  "Vayu", "Ganga", "Yamuna", "Tulsi", "Annapurna", "Santoshi Maa",
  "Vaishno Devi", "Meenakshi", "Radha", "Sita", "Lakshman", "Bharat",
  // Spiritual Saints & Gurus
  "Sai Baba of Shirdi", "Swami Vivekananda", "Ramakrishna Paramahamsa",
  "Adi Shankaracharya", "Tulsidas", "Kabir Das", "Guru Nanak",
  "Mahavira", "Chaitanya Mahaprabhu", "Mirabai", "Ramana Maharshi",
  // Spiritual / Mythological Cartoon Characters
  "Bal Ganesh", "Bal Krishna", "Little Hanuman", "Little Ram",
  "Chhota Bheem", "Arjun (Mahabharat)", "Karna", "Bhishma",
  "Ravana", "Vibhishana", "Jatayu", "Garuda", "Sudama",
];

const STYLES = [
  { value: "pencil", label: "Pencil Sketch" },
  { value: "charcoal", label: "Charcoal Sketch" },
  { value: "lineart", label: "Line Art" },
  { value: "crosshatch", label: "Cross-Hatch Sketch" },
  { value: "stippling", label: "Stippling (Dot Art)" },
  { value: "ink", label: "Ink Pen Sketch" },
  { value: "realistic", label: "Hyper-Realistic Pencil" },
  { value: "cartoon", label: "Cartoon Sketch" },
  { value: "anime", label: "Anime Line Sketch" },
  { value: "watercolor-bw", label: "B&W Watercolor Sketch" },
  { value: "vintage", label: "Vintage Engraving" },
  { value: "mandala", label: "Mandala Line Art" },
];

const Index = () => {
  const [god, setGod] = useState("Krishna");
  const [style, setStyle] = useState("pencil");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setImageUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sketch", {
        body: { god, style },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.imageUrl) throw new Error("No image returned");
      setImageUrl(data.imageUrl);
      toast.success("Sketch generated!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to generate sketch";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${god}-${style}-sketch.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="min-h-screen px-4 py-10 md:py-16 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            AI Powered
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-divine)" }}>
            Sketch Generator
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Generate divine hand-drawn sketches of deities, saints & spiritual icons.
          </p>
        </header>

        <Card className="p-6 md:p-8 shadow-[var(--shadow-soft)] border-border/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="god">Select Deity / Character</Label>
              <Select value={god} onValueChange={setGod}>
                <SelectTrigger id="god"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {GODS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="style">Sketch Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger id="style"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-6 h-12 text-base font-semibold text-primary-foreground border-0 shadow-[var(--shadow-divine)] hover:opacity-95 transition-opacity"
            style={{ background: "var(--gradient-divine)" }}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2" /> Generate Sketch</>
            )}
          </Button>

          <div className="mt-6">
            {loading && (
              <div className="aspect-square w-full rounded-xl bg-muted flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Channeling divine artistry...</p>
              </div>
            )}
            {!loading && imageUrl && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-border bg-white">
                  <img
                    src={imageUrl}
                    alt={`${style} sketch of Lord ${god}`}
                    className="w-full h-auto block"
                  />
                </div>
                <Button onClick={handleDownload} variant="secondary" className="w-full h-11">
                  <Download className="w-4 h-4 mr-2" /> Download Image
                </Button>
              </div>
            )}
            {!loading && !imageUrl && (
              <div className="aspect-square w-full rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm text-center px-6">
                Your generated sketch will appear here.
              </div>
            )}
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Black & white art only. For devotional, artistic use.
        </p>
      </div>
    </main>
  );
};

export default Index;
