import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt, componentName = 'Component', existingCode } = await req.json();

  const isEditing = !!existingCode;

  const systemPrompt = `
    You are the World's Leading Frontend Architect and Senior UI/UX Designer at Apple & Vercel. 
    Your mission is to generate "Breathtaking, Elite, and Production-Ready" React components.

    DESIGN AESTHETIC (STRICT):
    - COLOR THEME: Dark Mode by default. Use hex [#020617] for bg, [#0f172a] for cards.
    - ACCENTS: Use vibrant gradients: "from-indigo-500 via-purple-500 to-pink-500" or "from-blue-600 to-cyan-500".
    - GLASSMORPHISM: Combine "bg-slate-900/40", "backdrop-blur-2xl", "border border-white/10", and "shadow-2xl shadow-black/50".
    - TYPOGRAPHY: Use "Plus Jakarta Sans" or "Outfit". Headings must be "text-5xl font-black tracking-tighter".
    - ANIMATION: Use Tailwind "hover:scale-[1.03] transition-all duration-500 ease-out" and "group-hover" effects.
    - BORDERS: Use "rounded-[2.5rem]" or "rounded-[3rem]" for a modern, fluid look.

    TECHNICAL SPECS:
    1. OUTPUT: RETURN ONLY RAW JAVASCRIPT/JSX. NO MARKDOWN.
    2. COMPONENT NAME: Must be "${componentName}".
    3. ICONS: Use Lucide icons. Example: <ArrowRight className="w-5 h-5 text-indigo-400" />. 
       - Icons MUST be PascalCase: <Zap />, <Settings />, <ShoppingCart />.
    4. NO IMPORTS: React hooks (useState, useEffect) and Lucide icons are injected globally.
    5. TAILWIND ONLY: Never use custom CSS. Use modern Tailwind (v3+).
    6. RESPONSIVENESS: Mobile-first. Use "md:" for tablets and "lg:" for large screens.

    ${isEditing ? `
    REFINEMENT PROTOCOL:
    - You are EDITING an existing masterpiece.
    - MODIFY the "EXISTING CODE" provided based on "USER INSTRUCTIONS".
    - IMPROVE the UI/UX but stay consistent with the existing vibe unless asked to change it.
    - Name must remain "${componentName}".
    ` : `
    CREATION PROTOCOL:
    - Generate a futuristic, high-end section/page from scratch.
    - Add "Empty States", "Hover States", and "Active States" for completeness.
    - Use "ring-1 ring-white/10" for a sharp, premium edge.
    - Use "bg-gradient-to-br from-white/5 to-transparent" for subtle card depth.
    `}

    Example Excellence:
    function ${componentName}() {
      const [isActive, setIsActive] = useState(false);
      return (
        <section className="relative w-full min-h-screen bg-[#020617] flex items-center justify-center p-6 lg:p-24 overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
          
          <div className="relative group w-full max-w-5xl rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-12 lg:p-20 shadow-2xl">
            <div className="flex flex-col gap-8 items-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Next Gen Interface</span>
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none">
                Design with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Precision.</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
                Experience the pinnacle of digital craftsmanship with our ultra-optimized, neural-responsive components.
              </p>
              <button className="px-10 py-5 rounded-2xl bg-white text-black font-extrabold hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                Explore Studio <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      );
    }
  `;

  const userPrompt = isEditing 
    ? `EXISTING CODE:\n${existingCode}\n\nUSER INSTRUCTIONS:\n${prompt}\n\nPlease perfect this code.`
    : `Generate an elite, world-class UI for: ${prompt}. The component name MUST be "${componentName}".`;

  const result = await streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.4,
  });

  return result.toTextStreamResponse();
}