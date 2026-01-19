'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Code,
  Copy,
  Check,
  Terminal,
  Layout,
  Eye,
  History,
  X,
  Smartphone,
  ChevronRight,
  Monitor,
  RotateCcw,
  Zap,
  Globe,
  Layers,
  Cpu
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [view, setView] = useState<'code' | 'preview'>('preview');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ui_gen_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('ui_gen_history', JSON.stringify(history));
  }, [history]);

  const getPreviewHtml = (code: string) => {
    const cleanCode = code
      .replace(/```(?:jsx|javascript|tsx|typescript)?\n?/gi, '')
      .replace(/```/g, '')
      .replace(/import\s+.*?\s+from\s+['"].*?['"];?/g, '')
      .replace(/export\s+default\s+/g, '')
      .replace(/export\s+/g, '')
      .trim();

    const detectedIcons = Array.from(cleanCode.matchAll(/<([A-Z][a-zA-Z0-9]+)/g))
      .map(match => match[1])
      .filter(name => !['div', 'span', 'button', 'App', 'Component', 'Main', 'section', 'header', 'footer', 'input', 'label', 'Nav', 'Link'].includes(name));

    const iconDeclarations = Array.from(new Set(detectedIcons))
      .map(name => `window.${name} = IconProxy['${name}'];`)
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://unpkg.com/lucide@latest"></script>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box; }
            body { 
              background: #020617; 
              color: white; 
              margin: 0; 
              padding: 0; 
              font-family: 'Plus Jakarta Sans', sans-serif;
              overflow-x: hidden;
            }
            .lucide { width: 1.25em; height: 1.25em; display: inline-block; vertical-align: middle; }
            ::-webkit-scrollbar { width: 5px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
            #root { width: 100%; min-height: 100vh; }
            ${device === 'mobile' ? 'body { padding-top: 20px; } #root { max-width: 400px; margin: 0 auto; }' : ''}
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            const { useState, useEffect, useMemo, useRef, useCallback } = React;
            
            const IconProxy = new Proxy({}, {
              get: (target, name) => (props) => {
                if (typeof lucide === 'undefined') return <span className="w-4 h-4 bg-slate-800 rounded animate-pulse inline-block" />;
                const iconName = name.charAt(0).toLowerCase() + name.slice(1);
                const iconDef = lucide.icons[iconName] || lucide.icons['helpCircle'];
                if (!iconDef) return null;
                const [tag, attrs, children] = iconDef;
                return React.createElement(
                  tag,
                  {
                    ...attrs,
                    ...props,
                    className: \`lucide lucide-\${iconName} \${props.className || ''}\`,
                    width: props.size || attrs.width,
                    height: props.size || attrs.height,
                  },
                  children ? children.map(([childTag, childAttrs], idx) => 
                    React.createElement(childTag, { ...childAttrs, key: idx })
                  ) : null
                );
              }
            });

            window.LucideIcons = IconProxy;
            ${iconDeclarations}
            window.Lucide = IconProxy;

            try {
              ${cleanCode}
              const root = ReactDOM.createRoot(document.getElementById('root'));
              let Target = typeof Component !== 'undefined' ? Component : (typeof App !== 'undefined' ? App : null);
              
              if (!Target) {
                const functions = Object.keys(window).filter(key => 
                  typeof window[key] === 'function' && 
                  key.charAt(0) === key.charAt(0).toUpperCase() && 
                  !['React', 'ReactDOM', 'Babel', 'IconProxy'].includes(key)
                );
                if (functions.length > 0) Target = window[functions[functions.length - 1]];
              }

              if (Target) {
                root.render(<Target />);
              } else {
                root.render(<div className="p-10 text-slate-500 text-center font-bold uppercase tracking-widest text-[10px]">Component Signature Not Found</div>);
              }
            } catch (err) {
              document.getElementById('root').innerHTML = \`
                <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.2); padding: 32px; border-radius: 24px; max-width: 500px; margin: 60px auto; font-family: sans-serif; backdrop-blur: 20px;">
                  <h3 style="color: #fb7185; margin-top: 0; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">Runtime Exception</h3>
                  <p style="color: #fda4af; font-size: 12px; line-height: 1.6; font-weight: 500;">\${err.message}</p>
                </div>
              \`;
            }
          </script>
        </body>
      </html>
    `;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setCompletion('');
    setView('preview');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader found');

      const decoder = new TextDecoder();
      let done = false;
      let fullText = '';
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        fullText += chunkValue;
        setCompletion(fullText);
      }

      if (!history.includes(prompt)) {
        setHistory(prev => [prompt, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Generation error:', error);
      setCompletion('Error: Magic circuit interrupted. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(completion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setPrompt('');
    setCompletion('');
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 selection:bg-blue-500/40 flex flex-col font-jakarta overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;600;800&display=swap');
        
        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }

        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        .glass-card {
          background: rgba(10, 10, 15, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }

        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to bottom right,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
          );
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }

        .animated-bg {
          background: radial-gradient(circle at 50% 50%, #0a0a0f 0%, #000000 100%);
        }

        .glow-point {
          position: absolute;
          width: 40vw;
          height: 40vw;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* Futuristic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none animated-bg">
        <div className="glow-point top-[-10%] left-[-10%] bg-blue-600 animate-[float_15s_infinite]" />
        <div className="glow-point bottom-[-10%] right-[-10%] bg-purple-600 animate-[float_20s_infinite_reverse]" />
        <div className="glow-point top-[40%] right-[10%] bg-indigo-500 animate-[float_25s_infinite]" style={{ animationDelay: '-5s' }} />

        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Main Header / Navigation */}
      <header className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl h-20 shrink-0">
        <div className="max-w-[1800px] mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-3 bg-blue-500/20 rounded-full blur-xl scale-0 group-hover:scale-100 transition-transform duration-500" />
              <div className="relative bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-outfit font-extrabold tracking-tight text-white flex items-center gap-2">
                UMER <span className="text-blue-500">LABS</span>
                <Badge variant="outline" className="text-[10px] font-bold border-blue-500/30 text-blue-400 bg-blue-500/5 px-2 py-0">v4.0 PRO</Badge>
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Advanced Component Synthesis</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => setView('preview')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  view === 'preview' ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                <Eye className="w-4 h-4" /> PREVIEW
              </button>
              <button
                onClick={() => setView('code')}
                className={cn(
                  "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
                  view === 'code' ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"
                )}
              >
                <Code className="w-4 h-4" /> CODE
              </button>
            </div>

            <div className="w-[1px] h-8 bg-white/10 mx-2" />

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className={cn(
                  "h-11 w-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-all",
                  isHistoryOpen && "bg-white/20 border-white/20"
                )}
              >
                <History className="w-4 h-4 text-slate-400" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleClear}
                className="h-11 w-11 rounded-xl border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 group transition-all"
              >
                <RotateCcw className="w-4 h-4 text-slate-400 group-hover:text-rose-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex gap-8 p-8 max-w-[1800px] mx-auto w-full min-h-0 relative z-10 overflow-hidden">
        {/* Sidebar / History Panel */}
        <aside className={cn(
          "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] flex flex-col gap-6",
          isHistoryOpen ? "w-[300px] opacity-100" : "w-0 opacity-0 pointer-events-none"
        )}>
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Synthesis History</h2>
            <Badge variant="secondary" className="bg-white/5 text-slate-500 text-[9px]">{history.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
            {history.length === 0 ? (
              <div className="p-8 rounded-3xl border border-dashed border-white/10 text-center flex flex-col items-center gap-4">
                <Layers className="w-8 h-8 text-white/5" />
                <p className="text-[10px] font-bold text-slate-600 uppercase">No recent records found</p>
              </div>
            ) : (
              history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(h)}
                  className="w-full text-left p-4 rounded-2xl glass-card hover:border-blue-500/30 transition-all group"
                >
                  <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed group-hover:text-white transition-colors">{h}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[8px] font-black text-slate-600 tracking-widest uppercase">P-{history.length - i}</span>
                    <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Top Bar / Status */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <div className={cn("w-2 h-2 rounded-full", isLoading ? "bg-blue-500 animate-pulse" : "bg-green-500")} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {isLoading ? "Synthesizing Core Components..." : "Neural Engine Ready"}
                </span>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 group cursor-default">
                  <Cpu className="w-3 h-3 text-blue-500 group-hover:animate-spin" />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-blue-500/60">Claude 3.5 Sonnet @ OpenRouter</span>
                </div>
              )}
            </div>

            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setDevice('desktop')}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all",
                  device === 'desktop' ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "text-slate-500 hover:text-white"
                )}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase transition-all",
                  device === 'mobile' ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "text-slate-500 hover:text-white"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* Main Visual Display */}
          <div className={cn(
            "flex-1 relative transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]",
            device === 'mobile' && view === 'preview' ? "max-w-[420px] mx-auto w-full" : "w-full"
          )}>
            <div className="absolute inset-0 bg-blue-500/5 rounded-[40px] blur-3xl opacity-20 pointer-events-none" />

            <div className="w-full h-full glass-card rounded-[32px] overflow-hidden flex flex-col relative group">
              {/* Internal Bar */}
              <div className="h-14 bg-black/40 border-b border-white/5 flex items-center px-8 gap-6 shrink-0">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/5" />
                </div>
                <div className="h-6 w-[1px] bg-white/5 mx-2" />
                <div className="flex-1 flex items-center justify-center">
                  <div className="px-4 py-1.5 rounded-lg bg-black/50 border border-white/5 text-[9px] font-mono text-slate-500 tracking-widest uppercase flex items-center gap-3">
                    <Globe className="w-3 h-3 text-slate-700" />
                    preview.umerlabs.com
                  </div>
                </div>
                {completion && (
                  <Button
                    variant="ghost"
                    onClick={copyCode}
                    className="h-9 px-4 rounded-xl bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 hover:text-blue-400 transition-all font-black text-[9px] uppercase tracking-widest gap-2"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "COPIED" : "COPY CODE"}
                  </Button>
                )}
              </div>

              {/* Interaction Canvas */}
              <div className="flex-1 relative bg-black/40 group-hover:bg-black/20 transition-colors duration-500">
                {!completion && !isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                    <div className="relative mb-12">
                      <div className="absolute -inset-12 bg-blue-600/20 rounded-full blur-[80px] animate-pulse" />
                      <div className="relative w-40 h-40 rounded-[3rem] glass-card flex items-center justify-center border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] group-hover:rotate-3 transition-transform duration-700">
                        <Sparkles className="w-16 h-16 text-blue-500/30 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                    <h2 className="text-4xl font-outfit font-extrabold text-white mb-6 tracking-tight">System Ready for <span className="text-blue-500">Synthesis</span></h2>
                    <p className="text-slate-500 text-sm max-w-[440px] leading-relaxed font-medium">
                      Enter a description or component name below. Our advanced neural engine will generate a stunning, production-ready UI in seconds.
                    </p>

                    <div className="mt-12 flex items-center gap-6">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                          <Zap className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Fast Execution</span>
                      </div>
                      <div className="w-12 h-[1px] bg-white/5" />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                          <Layout className="w-4 h-4 text-indigo-500" />
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Tailwind Ready</span>
                      </div>
                      <div className="w-12 h-[1px] bg-white/5" />
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                          <Smartphone className="w-4 h-4 text-purple-500" />
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Responsive</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-px">
                    {view === 'code' ? (
                      <div className="p-12 font-mono text-[13px] leading-relaxed overflow-auto h-full text-blue-100/60 no-scrollbar">
                        <pre className="whitespace-pre-wrap"><code>{completion}</code></pre>
                      </div>
                    ) : (
                      <iframe
                        key={completion.substring(0, 50) + device}
                        srcDoc={getPreviewHtml(completion)}
                        className="w-full h-full border-none bg-transparent"
                        title="Preview"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synthesis Command Input */}
          <div className="shrink-0 pb-4">
            <div className="max-w-[1000px] mx-auto w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-20 group-focus-within:opacity-40 transition-all duration-700" />
              <div className="relative glass-card rounded-[28px] p-2 flex items-end gap-4 shadow-2xl transition-all border-white/10 group-focus-within:border-blue-500/30">
                <div className="flex-1 flex flex-col p-4">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    placeholder="Describe the component (e.g., 'Modern Hero Section with 3D elements')..."
                    className="w-full bg-transparent border-none text-white placeholder:text-slate-600 text-lg focus:ring-0 outline-none transition-all resize-none font-outfit font-semibold min-h-[50px] max-h-[200px] no-scrollbar py-1"
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleGenerate())}
                    rows={1}
                  />
                </div>
                <div className="p-3">
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="h-16 px-10 bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-slate-700 rounded-2xl flex items-center gap-3 transition-all duration-500 active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)] group/btn"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <Terminal className="w-5 h-5 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest">Synthesizing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Launch Genius</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-10">
              <div className="flex gap-6">
                {['SAAS DASHBOARD', 'GLASSMORPHIC CARDS', '3D HERO', 'PREMIUM PRICING'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setPrompt(tag)}
                    className="text-[9px] font-black text-slate-700 hover:text-blue-500 uppercase tracking-[0.4em] transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Finishing Touch: Bottom Line */}
      <div className="fixed bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-[100]" />
    </div>
  );
}