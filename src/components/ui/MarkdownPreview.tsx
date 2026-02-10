
"use client";

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
    content: string;
}

export const MarkdownPreview = ({ content }: MarkdownPreviewProps) => {
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopy = () => {
        if (textareaRef.current) {
            textareaRef.current.select();
            document.execCommand('copy'); // Fallback for older browsers
            navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div
            className="w-full h-full flex flex-col relative group p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={handleCopy}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg border backdrop-blur-md",
                        copied
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 ring-1 ring-emerald-500/50"
                            : "bg-black/40 text-cyan-100 border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40"
                    )}
                >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "コピーしました！" : ""}
                </button>
            </div>

            {/* Header decoration */}
            <div className="flex items-center gap-2 mb-3 px-2 border-b border-cyan-500/10 pb-2">
                <Terminal size={14} className="text-cyan-400" />
                <span className="text-xl tracking-widest text-cyan-400 font-bold">魂の設計書 (soul.md)</span>
            </div>

            {/* Content Container */}
            <div className="relative flex-grow overflow-hidden rounded-lg bg-black/40 border border-white/5 shadow-inner">
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]"></div>

                <textarea
                    ref={textareaRef}
                    readOnly
                    className="w-full h-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-gray-300 focus:outline-none scrollbar-thin scrollbar-thumb-cyan-900/50 scrollbar-track-transparent"
                    value={content}
                    spellCheck={false}
                />
            </div>
        </motion.div>
    );
};
