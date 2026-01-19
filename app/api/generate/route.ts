import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

// Configure OpenRouter provider
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const systemPrompt = `
    You are a world-class React & Tailwind CSS developer specializing in high-end, premium SaaS and Consumer web interfaces.
    
    TASK:
    Generate a stunning, fully-functional React component based on the user's prompt.
    
    CORE RULES (STRICT):
    1. OUTPUT ONLY THE JAVASCRIPT/JSX CODE. 
    2. DO NOT USE MARKDOWN BLOCKS (No \`\`\`jsx or \`\`\`).
    3. DO NOT INCLUDE IMPORTS. React and Lucide icons are injected globally.
    4. ALWAYS name your main functional component "Component".
    5. USE ONLY TAILWIND CSS classes. 
    6. Use Lucide React icons by their component names (e.g., <ArrowRight />, <Settings />, <Zap />). 
    7. Designs must be PREMIUM: Use sleek grays (#020617, #0f172a), accent colors (Indigo, Blue, Rose), glassmorphism, subtle gradients, and smooth hover effects.
    8. Accessibility: Ensure proper contrast and semantic HTML.
    9. Mobile-First: Ensure the component is responsive.
    
    AESTHETIC GUIDELINES:
    - Backgrounds: Use "bg-slate-950/50 backdrop-blur-xl" for containers.
    - Borders: Use "border border-white/10" or "border border-slate-800".
    - Shadows: Use deep, subtle shadows like "shadow-2xl shadow-black/40".
    - Typography: Use "tracking-tight" for headings and "leading-relaxed" for body.
    - Accents: Use "bg-gradient-to-br from-blue-500 to-indigo-600".

    Example Output Structure:
    function Component() {
      // Use React hooks if needed (useState, useEffect etc are available globally)
      const [active, setActive] = useState(false);
      
      return (
        <section className="min-h-[400px] w-full p-12 bg-slate-950 flex flex-col items-center justify-center">
          <div className="max-w-xl p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
             {/* Content here */}
          </div>
        </section>
      );
    }
  `;

  const result = await streamText({
    model: openrouter('anthropic/claude-3.5-sonnet'),
    system: systemPrompt,
    prompt: `Generate a premium, modern UI for: ${prompt}. Ensure it looks elite and professional.`,
    temperature: 0.5,
    headers: {
      'HTTP-Referer': 'https://umerlabs.com', // Optional: Replace with your actual site URL
      'X-Title': 'Umer Labs UI Generator', // Optional: Replace with your app name
    }
  });

  return result.toTextStreamResponse();
}