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
  // Spiritual Saints & Gurus (Hindu)
  "Sai Baba of Shirdi", "Swami Vivekananda", "Ramakrishna Paramahamsa",
  "Adi Shankaracharya", "Tulsidas", "Kabir Das", "Guru Nanak",
  "Mahavira", "Chaitanya Mahaprabhu", "Mirabai", "Ramana Maharshi",
  "Paramahansa Yogananda", "Sri Aurobindo", "The Mother (Mirra Alfassa)",
  "Swami Sivananda", "Swami Chinmayananda", "Sant Tukaram", "Sant Dnyaneshwar",
  "Sant Eknath", "Sant Namdev", "Surdas", "Ravidas", "Tyagaraja",
  "Madhvacharya", "Ramanujacharya", "Vallabhacharya", "Basavanna",
  "Akka Mahadevi", "Andal", "Lalleshwari", "Sant Gadge Maharaj",
  "Neem Karoli Baba", "Anandamayi Ma", "Mata Amritanandamayi (Amma)",
  "Sri Sri Ravi Shankar", "Sadhguru Jaggi Vasudev", "Sathya Sai Baba",
  "Mahatma Gandhi", "Mother Teresa", "Dalai Lama", "Thich Nhat Hanh",
  // Sikh Gurus
  "Guru Angad", "Guru Amar Das", "Guru Ram Das", "Guru Arjan",
  "Guru Hargobind", "Guru Har Rai", "Guru Har Krishan", "Guru Tegh Bahadur",
  "Guru Gobind Singh",
  // Buddhist Figures
  "Gautama Buddha", "Bodhisattva Avalokiteshvara", "Tara", "Padmasambhava",
  "Milarepa", "Nagarjuna",
  // Jain Tirthankaras
  "Rishabhanatha", "Parshvanatha", "Neminatha",
  // Abrahamic / World Spiritual Figures
  "Jesus Christ", "Mother Mary", "Saint Joseph", "Saint Peter",
  "Saint Francis of Assisi", "Saint Anthony", "Saint Jude",
  "Prophet Muhammad (PBUH)", "Prophet Moses", "Prophet Abraham",
  "Prophet Noah", "Prophet Jesus (Isa)", "Rumi", "Khwaja Moinuddin Chishti",
  "Nizamuddin Auliya", "Shirdi Sai Baba",
  // Zoroastrian
  "Zarathustra (Zoroaster)",
  // Spiritual / Mythological Cartoon Characters
  "Bal Ganesh", "Bal Krishna", "Little Hanuman", "Little Ram",
  "Chhota Bheem", "Arjun (Mahabharat)", "Karna", "Bhishma",
  "Ravana", "Vibhishana", "Jatayu", "Garuda", "Sudama",
  "Dhruv", "Prahlad", "Markandeya", "Eklavya", "Abhimanyu",
];

const CELEBRITIES = [
  // Bollywood Legends
  "Amitabh Bachchan", "Dilip Kumar", "Raj Kapoor", "Dev Anand", "Rajesh Khanna",
  "Shashi Kapoor", "Sanjeev Kumar", "Rishi Kapoor", "Vinod Khanna", "Jeetendra",
  "Dharmendra", "Sunil Dutt", "Ashok Kumar", "Guru Dutt", "Shammi Kapoor",
  // Bollywood Actors (Modern)
  "Shah Rukh Khan", "Salman Khan", "Aamir Khan", "Akshay Kumar", "Hrithik Roshan",
  "Ajay Devgn", "Saif Ali Khan", "Anil Kapoor", "Sanjay Dutt", "Govinda",
  "Ranbir Kapoor", "Ranveer Singh", "Varun Dhawan", "Sidharth Malhotra",
  "Tiger Shroff", "Vicky Kaushal", "Kartik Aaryan", "Ayushmann Khurrana",
  "Rajkummar Rao", "Nawazuddin Siddiqui", "Irrfan Khan", "Manoj Bajpayee",
  "Pankaj Tripathi", "Boman Irani", "Paresh Rawal", "Naseeruddin Shah",
  "Om Puri", "Anupam Kher", "Shahid Kapoor", "John Abraham", "Abhishek Bachchan",
  // Bollywood Actresses (Legends)
  "Madhubala", "Meena Kumari", "Nargis", "Waheeda Rehman", "Hema Malini",
  "Rekha", "Sridevi", "Madhuri Dixit", "Juhi Chawla", "Kajol", "Karisma Kapoor",
  // Bollywood Actresses (Modern)
  "Aishwarya Rai Bachchan", "Priyanka Chopra", "Deepika Padukone", "Katrina Kaif",
  "Anushka Sharma", "Kareena Kapoor Khan", "Vidya Balan", "Rani Mukerji",
  "Alia Bhatt", "Shraddha Kapoor", "Kriti Sanon", "Kiara Advani", "Sara Ali Khan",
  "Janhvi Kapoor", "Disha Patani", "Jacqueline Fernandez", "Parineeti Chopra",
  "Sonam Kapoor", "Bhumi Pednekar", "Taapsee Pannu", "Tabu", "Konkona Sen Sharma",
  // South Indian Superstars
  "Rajinikanth", "Kamal Haasan", "Mohanlal", "Mammootty", "Chiranjeevi",
  "Nagarjuna", "Venkatesh", "Mahesh Babu", "Pawan Kalyan", "Allu Arjun",
  "Ram Charan", "Jr NTR", "Prabhas", "Vijay (Thalapathy)", "Ajith Kumar",
  "Suriya", "Vikram", "Dhanush", "Vijay Sethupathi", "Yash", "Sudeep",
  "Puneeth Rajkumar", "Dulquer Salmaan", "Fahadh Faasil", "Nani", "Ravi Teja",
  // South Indian Actresses
  "Jayalalithaa", "Savitri", "Khushbu", "Trisha Krishnan",
  "Nayanthara", "Samantha Ruth Prabhu", "Rashmika Mandanna", "Pooja Hegde",
  "Tamannaah Bhatia", "Kajal Aggarwal", "Anushka Shetty", "Sai Pallavi",
  "Keerthy Suresh", "Shruti Haasan",
  // Hollywood Legends
  "Marilyn Monroe", "Audrey Hepburn", "Charlie Chaplin", "Humphrey Bogart",
  "Marlon Brando", "James Dean", "Elizabeth Taylor", "Grace Kelly",
  "Clint Eastwood", "Robert De Niro", "Al Pacino", "Jack Nicholson",
  "Anthony Hopkins", "Morgan Freeman", "Sean Connery",
  // Hollywood Actors (Modern)
  "Tom Cruise", "Tom Hanks", "Brad Pitt", "Leonardo DiCaprio", "Johnny Depp",
  "Will Smith", "Denzel Washington", "Keanu Reeves", "Hugh Jackman",
  "Robert Downey Jr.", "Chris Hemsworth", "Chris Evans", "Mark Ruffalo",
  "Christian Bale", "Matt Damon", "Ben Affleck", "Ryan Reynolds", "Ryan Gosling",
  "Dwayne Johnson", "Jason Statham", "Vin Diesel", "Daniel Craig",
  "Joaquin Phoenix", "Cillian Murphy", "Timothée Chalamet", "Tom Holland",
  // Hollywood Actresses (Modern)
  "Meryl Streep", "Julia Roberts", "Nicole Kidman", "Angelina Jolie",
  "Jennifer Lawrence", "Scarlett Johansson", "Anne Hathaway", "Natalie Portman",
  "Emma Stone", "Emma Watson", "Jennifer Aniston", "Cate Blanchett",
  "Charlize Theron", "Gal Gadot", "Margot Robbie", "Zendaya", "Florence Pugh",
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
  const [category, setCategory] = useState<"spiritual" | "celebrity">("spiritual");
  const [god, setGod] = useState("Krishna");
  const [celebrity, setCelebrity] = useState("Amitabh Bachchan");
  const [style, setStyle] = useState("pencil");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const subject = category === "spiritual" ? god : celebrity;

  const handleGenerate = async () => {
    setLoading(true);
    setImageUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-sketch", {
        body: { god: subject, style, category },
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
    a.download = `${subject}-${style}-sketch.png`;
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
            Generate hand-drawn sketches of deities, saints & film stars.
          </p>
        </header>

        <Card className="p-6 md:p-8 shadow-[var(--shadow-soft)] border-border/60">
          <div className="space-y-2 mb-4">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as "spiritual" | "celebrity")}>
              <SelectTrigger id="category"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="spiritual">Spiritual / Mythological</SelectItem>
                <SelectItem value="celebrity">Film Industry (Actors & Actresses)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">
                {category === "spiritual" ? "Select Deity / Character" : "Select Actor / Actress"}
              </Label>
              {category === "spiritual" ? (
                <Select value={god} onValueChange={setGod}>
                  <SelectTrigger id="subject"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {GODS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={celebrity} onValueChange={setCelebrity}>
                  <SelectTrigger id="subject"><SelectValue /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {CELEBRITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                    alt={`${style} sketch of ${subject}`}
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
