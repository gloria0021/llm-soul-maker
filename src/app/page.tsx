
"use client";

export const runtime = 'edge';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BrainCircuit, Settings, Wand2, Globe, RotateCcw } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { RadarMatrix } from '@/components/ui/RadarMatrix';
import { MarkdownPreview } from '@/components/ui/MarkdownPreview';

import { PersonaEngine } from '@/lib/engine';
import { Config, Locale, MatrixCoordinates, MatrixConfig } from '@/config/types';
import personaConfig from '@/config/persona-config.json';

const config = personaConfig as unknown as Config;
const engine = new PersonaEngine();

export default function Home() {
  // --- State ---
  const [convTone, setConvTone] = useState<'ため口' | '普通' | '敬語'>('普通');
  const [convAmount, setConvAmount] = useState<'少ない' | '普通' | '多い'>('普通');
  const [useEmoji, setUseEmoji] = useState<boolean>(false);
  const [additionalSettings, setAdditionalSettings] = useState<string>("");

  const [coordinates, setCoordinates] = useState<MatrixCoordinates>(() => {
    // Default all quadrants to 50, 50 (center)
    const initial: MatrixCoordinates = {};
    config.matrices.forEach(m => initial[m.id] = { x: 50, y: 50 });
    return initial;
  });

  const [locale, setLocale] = useState<Locale>("ja");
  const [generatedMd, setGeneratedMd] = useState<string>("");
  const [isRefining, setIsRefining] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  // --- Helpers ---
  const currentSettings = useMemo(() => ({
    tone: convTone,
    amount: convAmount,
    useEmoji,
    additional: additionalSettings
  }), [convTone, convAmount, useEmoji, additionalSettings]);

  // --- Effects ---
  useEffect(() => {
    // Re-generate basic markdown whenever inputs change
    const md = engine.generate(currentSettings, coordinates, locale);
    setGeneratedMd(md);
    setIsAIGenerated(false); // Reset AI status when parameters change
  }, [currentSettings, coordinates, locale]);

  // --- Handlers ---
  const handleMatrixChange = (id: string, x: number, y: number) => {
    setCoordinates(prev => ({
      ...prev,
      [id]: { x, y }
    }));
  };

  const handleRefineWithAI = async () => {
    const { refineSoulWithAI } = await import('./actions');
    setIsRefining(true);
    try {
      const refined = await refineSoulWithAI(generatedMd, currentSettings, coordinates, locale);
      setGeneratedMd(refined);
      setIsAIGenerated(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "錬成に失敗しました");
    } finally {
      setIsRefining(false);
    }
  };

  const toggleLocale = () => {
    setLocale(prev => prev === "ja" ? "en" : "ja");
  };

  const handleReset = () => {
    if (confirm("すべての設定をリセットしますか？")) {
      setConvTone('普通');
      setConvAmount('普通');
      setUseEmoji(false);
      setAdditionalSettings("");
      const initial: MatrixCoordinates = {};
      config.matrices.forEach(m => initial[m.id] = { x: 50, y: 50 });
      setCoordinates(initial);
      setIsAIGenerated(false);
    }
  };

  const ChoiceButton = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 rounded-lg text-sm font-bold transition-all border shrink-0 duration-500",
        active
          ? "bg-cyan-500/10 border-cyan-600 text-cyan-700 shadow-[0_0_15px_rgba(6,182,212,0.2)] dark:bg-cyan-500/20 dark:border-cyan-500 dark:text-cyan-400 dark:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          : "bg-white/40 border-slate-200/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-900/40 dark:border-white/5 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:border-white/10"
      )}
    >
      {label}
    </button>
  );

  return (
    <main className={cn(
      "min-h-screen font-sans p-4 md:p-8 transition-colors duration-[1000ms] ease-in-out",
      isAIGenerated ? "bg-slate-50/80 text-slate-800" : "dark bg-black text-white"
    )}>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 dark:bg-cyan-900/10 rounded-full blur-[120px] animate-pulse-slow transition-colors duration-[1000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000 transition-colors duration-[1000ms]"></div>
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-purple-500/5 dark:bg-purple-900/5 rounded-full blur-[80px] transition-colors duration-[1000ms]"></div>
      </div>

      {/* Sticky Header */}
      <header className={cn(
        "sticky top-0 z-30 pl-6 py-4 md:py-6 border-l-4 backdrop-blur-xl transition-colors duration-[1000ms]",
        isAIGenerated
          ? "border-cyan-600 bg-slate-50/80"
          : "border-cyan-500 bg-black/80"
      )}>
        <div className="max-w-7xl mx-auto">
          <h1 className={cn(
            "text-3xl md:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r transition-all duration-[1000ms]",
            isAIGenerated
              ? "from-cyan-900 via-cyan-600 to-blue-600"
              : "from-white via-cyan-100 to-cyan-400"
          )}>
            魂の生き写し
          </h1>
          <p className="text-cyan-700/60 dark:text-cyan-200/60 mt-1 text-sm md:text-base tracking-wide flex items-center gap-2 transition-colors duration-[1000ms]">
            <BrainCircuit size={16} /> 自己深層心理のデジタル錬成システム
          </p>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

        {/* Left Column: Controls (Matrices) */}
        <div className="lg:col-span-7 space-y-8 pb-36 lg:pb-12">

          {/* Tone & Style Settings Section */}
          <GlassCard className="border-t border-white/20 dark:border-white/10" delay={0.1}>
            <div className="flex items-center gap-3 mb-8">
              <Settings className="text-cyan-600 dark:text-cyan-400 transition-colors duration-[1000ms]" size={24} />
              <h2 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-gray-100 transition-colors duration-[1000ms]">会話のスタイル</h2>
            </div>

            <div className="space-y-10">
              {/* Row 1: Tone, Amount, Emoji in one row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] pl-1 transition-colors duration-[1000ms]">会話のトーン</label>
                  <div className="flex flex-wrap gap-2">
                    <ChoiceButton active={convTone === 'ため口'} label="ため口" onClick={() => setConvTone('ため口')} />
                    <ChoiceButton active={convTone === '普通'} label="普通" onClick={() => setConvTone('普通')} />
                    <ChoiceButton active={convTone === '敬語'} label="敬語" onClick={() => setConvTone('敬語')} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] pl-1 transition-colors duration-[1000ms]">会話量</label>
                  <div className="flex flex-wrap gap-2">
                    <ChoiceButton active={convAmount === '少ない'} label="少ない" onClick={() => setConvAmount('少ない')} />
                    <ChoiceButton active={convAmount === '普通'} label="普通" onClick={() => setConvAmount('普通')} />
                    <ChoiceButton active={convAmount === '多い'} label="多い" onClick={() => setConvAmount('多い')} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] pl-1 transition-colors duration-[1000ms]">絵文字の使用</label>
                  <div className="flex gap-2">
                    <ChoiceButton active={!useEmoji} label="OFF" onClick={() => setUseEmoji(false)} />
                    <ChoiceButton active={useEmoji} label="ON" onClick={() => setUseEmoji(true)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] pl-1 transition-colors duration-[1000ms]">追加のこだわり（任意）</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={additionalSettings}
                    onChange={(e) => setAdditionalSettings(e.target.value)}
                    placeholder="例：『時折ため息を吐く』『結論から話す』..."
                    className="w-full bg-white/50 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-700/50 rounded-xl p-4 pl-12 text-base text-slate-800 dark:text-gray-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 duration-[1000ms]"
                  />
                  <Wand2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors duration-500" size={20} />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Matrices Grid (2x2) */}
          < div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
            {
              config.matrices.map((m: MatrixConfig) => (
                <RadarMatrix
                  key={m.id}
                  config={m}
                  locale="ja" // Force UI to be Japanese regardless of output locale
                  x={coordinates[m.id]?.x ?? 50}
                  y={coordinates[m.id]?.y ?? 50}
                  onChange={(x, y) => handleMatrixChange(m.id, x, y)}
                  className="h-full"
                />
              ))
            }
          </div >
        </div >

        {/* Right Column: Preview (Sticky) */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <div className="sticky top-8 h-[calc(100vh-4rem)] flex flex-col gap-4">

            {/* Header Bar: Status & Language */}
            <div className="flex items-center justify-between p-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur rounded-lg border border-slate-200/50 dark:border-white/10 transition-colors duration-[1000ms]">
              <div className="flex items-center gap-4 pl-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${isAIGenerated ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold transition-colors duration-[1000ms]">
                    {isAIGenerated ? 'AI錬成済' : 'DRAFT'}
                  </span>
                </div>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition-all border border-transparent hover:border-slate-300 dark:hover:border-white/5 active:scale-95 duration-300"
                  title="設定をリセット"
                >
                  <RotateCcw size={14} />
                  <span className="text-sm font-bold tracking-wider">リセット</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold transition-colors duration-[1000ms]">出力言語</span>
                <button
                  onClick={toggleLocale}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-white/5 active:scale-95 duration-300"
                >
                  <Globe size={14} className={locale === 'en' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'} />
                  <span className={locale === 'en' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-300'}>EN</span>
                  <span className="text-slate-300 dark:text-slate-600">|</span>
                  <span className={locale === 'ja' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-500 dark:text-slate-300'}>JP</span>
                </button>
              </div>
            </div>

            {/* AI Action Button in the gap */}
            <button
              onClick={handleRefineWithAI}
              disabled={isRefining}
              className="relative group overflow-hidden w-full py-4 rounded-xl font-bold transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-xl shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_auto] animate-gradient-x group-hover:scale-105 transition-transform duration-500"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)] transition-opacity"></div>

              <span className="relative flex items-center justify-center gap-4 text-xl tracking-[0.3em] font-black text-white drop-shadow-lg">
                {isRefining ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    魂を錬成中...
                  </>
                ) : (
                  <>
                    <Wand2 size={24} className="animate-pulse" />
                    魂の錬成
                  </>
                )}
              </span>

              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-cyan-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            </button>

            <div className={`flex-grow flex flex-col bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-2xl border transition-colors duration-[1000ms] overflow-hidden relative shadow-2xl ${isAIGenerated ? 'border-cyan-500/50 shadow-cyan-500/10' : 'border-slate-200 dark:border-white/10'}`}>
              <MarkdownPreview
                content={generatedMd}
                isDraft={!isAIGenerated}
                onChange={setGeneratedMd}
              />
              {isRefining && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-in fade-in transition-all">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="text-cyan-400 animate-pulse" size={24} />
                    </div>
                  </div>
                  <p className="mt-4 text-cyan-400 font-bold tracking-widest animate-pulse">錬成中...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Floating AI Button */}
        <div className="lg:hidden fixed bottom-16 left-0 w-full px-4 z-[60]">
          <button
            onClick={handleRefineWithAI}
            disabled={isRefining}
            className="relative group overflow-hidden w-full py-3.5 rounded-2xl font-bold transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-[0_4px_30px_rgba(6,182,212,0.4)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 bg-[length:200%_auto] animate-gradient-x"></div>
            <div className="absolute inset-0 opacity-0 group-active:opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)] transition-opacity"></div>

            <span className="relative flex items-center justify-center gap-3 text-lg tracking-[0.2em] font-black text-white drop-shadow-lg">
              {isRefining ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  魂を錬成中...
                </>
              ) : (
                <>
                  <Wand2 size={20} className="animate-pulse" />
                  魂の錬成
                </>
              )}
            </span>

            <div className="absolute -inset-1 bg-cyan-500/30 blur-xl opacity-50 group-active:opacity-100 transition-opacity duration-700"></div>
          </button>
        </div>

        {/* Mobile Preview Drawer */}
        <div className={cn(
          "lg:hidden fixed bottom-0 left-0 w-full backdrop-blur-xl border-t shadow-2xl z-50 transform transition-all duration-500 group flex flex-col",
          isAIGenerated
            ? "h-full bg-white/95 border-cyan-500/30 shadow-cyan-500/10 rounded-none"
            : "h-[70vh] bg-slate-900/90 border-cyan-500/20 rounded-t-3xl",
          isAIGenerated
            ? "translate-y-0"
            : "translate-y-[calc(100%-3rem)] hover:translate-y-0 focus-within:translate-y-0"
        )}>
          <div className={cn(
            "h-12 flex items-center justify-center border-b cursor-pointer shrink-0 transition-colors duration-500",
            isAIGenerated ? "border-slate-200" : "border-white/5"
          )}>
            <div className={cn(
              "w-12 h-1.5 rounded-full transition-colors",
              isAIGenerated ? "bg-slate-300 group-hover:bg-cyan-500" : "bg-slate-600 group-hover:bg-cyan-400"
            )}></div>
          </div>

          {/* Mobile Header Bar */}
          <div className="flex justify-between p-2 px-4 items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${isAIGenerated ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                <span className={cn(
                  "text-[10px] font-bold transition-colors duration-500",
                  isAIGenerated ? "text-slate-600" : "text-slate-400"
                )}>{isAIGenerated ? 'AI錬成済み' : 'ドラフト'}</span>
              </div>

              {/* Mobile Reset Button */}
              {isAIGenerated && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 active:scale-95 transition-all"
                >
                  <RotateCcw size={12} />
                  <span className="text-[10px] font-bold">リセット</span>
                </button>
              )}
            </div>

            <button
              onClick={toggleLocale}
              className={cn(
                "text-xs px-2 py-1 rounded border transition-colors duration-500",
                isAIGenerated
                  ? "bg-slate-100 border-slate-300 text-slate-700"
                  : "bg-slate-800 border-white/10 text-slate-300"
              )}
            >
              出力言語: {locale === 'en' ? 'English' : '日本語'}
            </button>
          </div>

          <div className="flex-grow p-4 pb-20 overflow-auto relative">
            <MarkdownPreview content={generatedMd} isDraft={!isAIGenerated} />
            {isRefining && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

      </div >
    </main >
  );
}
