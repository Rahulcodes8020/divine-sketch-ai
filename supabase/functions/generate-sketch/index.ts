const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { god, style, category } = await req.json();
    if (!god || !style) {
      return new Response(JSON.stringify({ error: "Missing subject or style" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const styleMap: Record<string, string> = {
      pencil: "graphite pencil sketch, soft shading, fine hatching",
      charcoal: "charcoal drawing, deep shadows, high contrast, smudged textures",
      lineart: "clean line art, minimal shading, bold outlines",
      crosshatch: "cross-hatched pencil sketch, intricate hatching lines, ink-like depth",
      stippling: "stippling dot art, pointillism style, fine ink dots forming shading",
      ink: "ink pen sketch, bold strokes, fine nib detailing, classic illustration style",
      realistic: "hyper-realistic graphite pencil drawing, photorealistic shading, ultra-fine detail",
      cartoon: "black and white cartoon sketch, clean cel-shaded line drawing, expressive features",
      anime: "anime-style line sketch, manga ink drawing, sharp clean lines, screentone shading",
      "watercolor-bw": "monochrome black and white watercolor sketch, soft ink wash, expressive brush strokes",
      vintage: "vintage engraving illustration, old-world etching, intricate line engraving style",
      mandala: "intricate mandala line art, symmetrical sacred geometry patterns, fine ornamental detailing",
    };
    const styleText = styleMap[style] ?? styleMap.pencil;

    const isCelebrity = category === "celebrity";

    // Iconographic descriptions for deities whose form the AI may not know well
    const deityIconography: Record<string, string> = {
      "Sawariya Seth Ji": "Sanwariya Seth (Sanwaliya Seth) of Mandphia Rajasthan — child form of Lord Krishna depicted as a small standing deity idol with a dark/black complexion, wearing an ornate royal crown (mukut), elaborate jewelry, peacock feather, holding a flute (bansuri), dressed in heavily decorated traditional Rajasthani temple attire with flower garlands, standing in tribhanga pose on a decorated pedestal, temple sanctum background",
      "Khatu Shyam Ji": "Khatu Shyam Ji of Rajasthan — depicted as a severed head deity (Sheesh ke Daani Barbarika) with a royal crown, peacock feathers, elaborate jewelry, kind smiling face, devotional temple iconography, garlands of flowers",
      "Shrinathji": "Shrinathji of Nathdwara — seven-year-old child form of Krishna with left arm raised lifting Govardhan hill, dark complexion, large lotus eyes, wearing ornate shringar, traditional Pushtimarg temple iconography",
      "Banke Bihari Ji": "Banke Bihari Ji of Vrindavan — tribhanga (three-bend) standing pose Krishna idol with flute, peacock feather crown, lotus eyes, ornate Vrindavan temple shringar, dark complexion",
      "Balaji": "Lord Venkateswara Balaji of Tirupati — standing four-armed Vishnu form with tall conical crown (kireeta mukut), namam tilak on forehead covering the eyes, conch and discus in upper hands, lower hands in varada and katyavalambita pose, heavily ornamented",
      "Sai Baba of Shirdi": "Sai Baba of Shirdi — elderly saint seated cross-legged with right leg over left, white head cloth, simple kafni robe, kind weathered face with white beard, peaceful expression, hand raised in blessing",
      "Shirdi Sai Baba": "Sai Baba of Shirdi — elderly saint seated cross-legged with right leg over left, white head cloth, simple kafni robe, kind weathered face with white beard, peaceful expression, hand raised in blessing",
      "Ayyappa": "Lord Ayyappa of Sabarimala — seated in yogic padmasana with yoga-patta band around knees, holding bow, Chinmudra hand gesture, jewelry and crown, serene youthful face",
      "Jagannath": "Lord Jagannath of Puri — distinctive wooden idol form with large round eyes, stub arms, no visible legs, brightly decorated, traditional Puri temple iconography",
      "Vitthal": "Lord Vitthal/Vithoba of Pandharpur — standing on a brick with arms akimbo (hands on hips), tall crown, simple symmetrical posture",
      "Murugan": "Lord Murugan/Kartikeya — youthful warrior god holding the Vel spear, peacock vahana, six faces optional, royal crown, ornate jewelry",
      "Santoshi Maa": "Goddess Santoshi Maa — four-armed seated on lotus, holding sword and trishul, bowl of rice and jaggery, kind motherly face, red sari",
    };

    const iconography = deityIconography[god];
    const subjectPhrase = isCelebrity
      ? `a recognizable portrait of ${god}, the famous film actor/actress`
      : iconography
        ? `${iconography}, divine aura, perfect symmetry`
        : `Lord ${god}, traditional authentic Hindu iconography, divine aura, perfect symmetry`;

    const prompt = `A masterpiece highly accurate ${styleText} of ${subjectPhrase}. Extremely detailed face and traditional iconography, fine line art, graphite drawing style, ultra HD 4K, clean white background, professional hand-drawn portrait sketch, black and white only, true to authentic religious depiction. Avoid: color, blur, low quality, distorted face, extra limbs, wrong iconography, watermark, text, logo.`;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    // Call Google Gemini directly (free tier — no Lovable credits used)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Free tier rate limit reached. Please wait a minute and try again.", code: "RATE_LIMIT" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 401 || response.status === 403) {
        return new Response(JSON.stringify({ error: "Invalid Gemini API key. Please update GEMINI_API_KEY.", code: "INVALID_KEY" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Image generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p?.inlineData?.data);
    if (!imgPart) {
      console.error("No image in Gemini response:", JSON.stringify(data).slice(0, 500));
      throw new Error("No image returned");
    }
    const mime = imgPart.inlineData.mimeType || "image/png";
    const imageUrl = `data:${mime};base64,${imgPart.inlineData.data}`;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-sketch error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
