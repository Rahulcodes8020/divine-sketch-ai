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
    const subjectPhrase = isCelebrity
      ? `a recognizable portrait of ${god}, the famous film actor/actress`
      : `Lord ${god}, divine aura, perfect symmetry`;

    const prompt = `A masterpiece realistic ${styleText} of ${subjectPhrase}, extremely detailed face, fine line art, graphite drawing style, ultra HD 4K, clean white background, professional hand-drawn portrait sketch, black and white only. Avoid: color, blur, low quality, distorted face, extra limbs, watermark, text, logo.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Image generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("No image returned");

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
