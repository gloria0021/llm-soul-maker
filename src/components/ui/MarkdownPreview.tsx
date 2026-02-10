
"use client";

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownPreviewProps {
    content: string;
    isDraft?: boolean;
}

export const MarkdownPreview = ({ content, isDraft = false }: MarkdownPreviewProps) => {
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleCopy = () => {
        if (isDraft) return; // Disable copy for draft
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
            className={cn(
                "w-full h-full flex flex-col relative group p-6 transition-all duration-500",
                isDraft ? "bg-slate-950/20" : "bg-transparent"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {!isDraft && (
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
            )}

            {/* Header decoration - Always colorful */}
            <div className="flex items-center gap-2 mb-3 px-2 border-b border-cyan-500/10 pb-2">
                <Terminal size={14} className="text-cyan-400" />
                <span className="text-xl tracking-widest font-bold text-cyan-400">
                    魂の設計書 (soul.md)
                </span>
            </div>

            {/* Content Container - Gray out logic applied here */}
            <div className={cn(
                "relative flex-grow overflow-hidden rounded-lg transition-all duration-500 border shadow-inner",
                isDraft
                    ? "bg-slate-900/20 border-white/5 opacity-80 saturate-50 contrast-75"
                    : "bg-black/40 border-white/5 opacity-100"
            )}>
                <div className={cn(
                    "absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-500",
                    isDraft ? "opacity-0" : "opacity-100 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0%,transparent_70%)]"
                )}></div>

                <textarea
                    ref={textareaRef}
                    readOnly
                    className={cn(
                        "w-full h-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed focus:outline-none scrollbar-thin scrollbar-thumb-cyan-900/50 scrollbar-track-transparent transition-colors duration-500",
                        isDraft ? "text-slate-400 select-none pointer-events-none" : "text-gray-300"
                    )}
                    value={content}
                    spellCheck={false}
                />
            </div>
        </motion.div>
    );
};
