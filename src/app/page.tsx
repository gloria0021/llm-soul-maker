
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Settings, Wand2, Globe } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { RadarMatrix } from '@/components/ui/RadarMatrix';
import { MarkdownPreview } from '@/components/ui/MarkdownPreview';

import { PersonaEngine } from '@/lib/engine';
import { Config, Locale, MatrixCoordinates, MatrixConfig } from '@/config/types';
import personaConfig from '@/config/persona-config.json';

export default function Home() {
  // --- Initialization ---
  const config = personaConfig as unknown as Config;
  const engine = new PersonaEngine(); // No arguments for constructor

  // --- State ---
  const [tone, setTone] = useState<string>("");
  const [coordinates, setCoordinates] = useState<MatrixCoordinates>(() => {
    // Default all quadrants to 50, 50 (center)
    const initial: MatrixCoordinates = {};
    config.matrices.forEach(m => initial[m.id] = { x: 50, y: 50 });
    return initial;
  });

  const [locale, setLocale] = useState<Locale>("ja");
  const [generatedMd, setGeneratedMd] = useState<string>("");

  // --- Effects ---
  useEffect(() => {
    // Re-generate markdown whenever inputs change
    const md = engine.generate(tone, coordinates, locale);
    setGeneratedMd(md);
  }, [tone, coordinates, locale]);

  // --- Handlers ---
  const handleMatrixChange = (id: string, x: number, y: number) => {
    setCoordinates(prev => ({
      ...prev,
      [id]: { x, y }
    }));
  };

  const toggleLocale = () => {
    setLocale(prev => prev === "ja" ? "en" : "ja");
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden p-4 md:p-8">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-purple-900/5 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">

        {/* Left Column: Controls (Matrices) */}
        <div className="lg:col-span-7 space-y-8 pb-12">

          {/* Header */}
          <header className="mb-8 pl-2 border-l-4 border-cyan-500">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
              人格出力ツール
            </h1>
            <p className="text-cyan-200/60 mt-2 text-sm md:text-base tracking-wide flex items-center gap-2">
              <BrainCircuit size={16} /> AIエージェント魂生成システム
            </p>
          </header>

          {/* Tone Input Section */}
          <GlassCard className="border-t border-white/10" delay={0.1}>
            <div className="flex items-center gap-3 mb-4">
              <Settings className="text-cyan-400" size={20} />
              <h2 className="text-xl font-semibold">口調・トーンの設定</h2>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="例：『京都弁の毒舌な執事』『冷静沈着なスナイパー』『常に眠そうな天才ハッカー』..."
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 pl-12 text-lg focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
              />
              <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            </div>
          </GlassCard>

          {/* Matrices Grid (2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.matrices.map((m: MatrixConfig, idx: number) => (
              <RadarMatrix
                key={m.id}
                config={m}
                locale="ja" // Force UI to be Japanese regardless of output locale
                x={coordinates[m.id]?.x ?? 50}
                y={coordinates[m.id]?.y ?? 50}
                onChange={(x, y) => handleMatrixChange(m.id, x, y)}
                className="h-full"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Preview (Sticky) */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <div className="sticky top-8 h-[calc(100vh-4rem)] flex flex-col gap-4">

            {/* Language Toggle Bar */}
            <div className="flex justify-end items-center gap-3 p-2 bg-slate-900/40 backdrop-blur rounded-lg border border-white/10">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">出力言語 (Output Language)</span>
              <button
                onClick={toggleLocale}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors border border-white/5 active:scale-95"
              >
                <Globe size={14} className={locale === 'en' ? 'text-cyan-400' : 'text-slate-500'} />
                <span className={locale === 'en' ? 'text-cyan-400 font-bold' : 'text-slate-300'}>EN</span>
                <span className="text-slate-600">|</span>
                <span className={locale === 'ja' ? 'text-cyan-400 font-bold' : 'text-slate-300'}>JP</span>
              </button>
            </div>

            <div className="flex-grow flex flex-col bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
              <MarkdownPreview content={generatedMd} />
            </div>
          </div>
        </div>

        {/* Mobile Preview Drawer */}
        <div className="lg:hidden fixed bottom-0 left-0 w-full h-[60vh] bg-slate-900/90 backdrop-blur-xl rounded-t-3xl border-t border-cyan-500/20 shadow-2xl z-50 transform transition-transform duration-300 translate-y-[calc(100%-3rem)] hover:translate-y-0 focus-within:translate-y-0 group flex flex-col">
          <div className="h-12 flex items-center justify-center border-b border-white/5 cursor-pointer shrink-0">
            <div className="w-12 h-1.5 bg-slate-600 rounded-full group-hover:bg-cyan-400 transition-colors"></div>
          </div>

          {/* Mobile Language Toggle */}
          <div className="flex justify-end p-2 px-4">
            <button
              onClick={toggleLocale}
              className="text-xs px-2 py-1 bg-slate-800 rounded border border-white/10"
            >
              出力言語: {locale === 'en' ? 'English' : '日本語'}
            </button>
          </div>

          <div className="flex-grow p-4 pb-20 overflow-hidden">
            <MarkdownPreview content={generatedMd} />
          </div>
        </div>

      </div>
    </main>
  );
}
