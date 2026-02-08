import { ApiKeyCheck } from "@/components/ApiKeyCheck";
import Image from "next/image";
import * as React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-[family-name:var(--font-geist-sans)]">
      {/* High-tech background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500 rounded-full blur-[120px] mix-blend-screen" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <main className="max-w-4xl w-full space-y-12 relative z-10 py-12">
        <header className="flex flex-col items-center space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <a
              href="https://tambo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block bg-[#0b0e14] rounded-full p-4"
            >
              <Image
                src="/Octo-Icon.svg"
                alt="Tambo AI Logo"
                width={60}
                height={60}
                className="brightness-110"
              />
            </a>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-6xl font-black tracking-tighter uppercase italic">
              PIT <span className="text-blue-500">WALL</span>
            </h1>
            <p className="text-slate-400 font-mono tracking-widest text-sm uppercase">
              // Advanced Racing Telemetry & Analytics
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-stretch pt-8">
          {/* Action Card */}
          <section className="glass-panel p-8 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-white/10 transition-all group">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                <h2 className="text-lg font-bold tracking-tight uppercase">Mission Control</h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Connect to the telemetry stream and start analyzing live F1 data with generative AI tools.
              </p>
            </div>

            <ApiKeyCheck>
              <div className="pt-4">
                <a
                  href="/chat"
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95 group-hover:-translate-y-1 transform uppercase tracking-wider"
                >
                  Enter Pit Wall →
                </a>
              </div>
            </ApiKeyCheck>
          </section>

          {/* Info Card */}
          <section className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <h2 className="text-lg font-bold tracking-tight uppercase mb-4">Telemetry Suite</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <span className="text-blue-400 text-xs font-mono">01</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">AI Insights</h3>
                  <p className="text-xs text-slate-500">Natural language interaction for complex race data.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <span className="text-red-400 text-xs font-mono">02</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">Dynamic Canvas</h3>
                  <p className="text-xs text-slate-500">Drag & drop charts to build your perfect telemetry dashboard.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <span className="text-emerald-400 text-xs font-mono">03</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-tight">FastF1 Integration</h3>
                  <p className="text-xs text-slate-500">Real-world data processing powered by FastF1 APIs.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="pt-12 flex justify-center gap-8 border-t border-white/5 mx-auto max-w-lg">
          <a
            href="https://tambo.co/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-blue-400 text-xs font-mono transition-colors"
          >
            DOCUMENTATION
          </a>
          <a
            href="https://github.com/tambo-ai/tambo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-blue-400 text-xs font-mono transition-colors"
          >
            SOURCE
          </a>
          <span className="text-slate-500 text-xs font-mono">• v1.0.RC</span>
        </footer>
      </main>
    </div>
  );
}
