
"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MatrixConfig, Locale } from '@/config/types';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/GlassCard';

interface RadarMatrixProps {
    config: MatrixConfig;
    locale: Locale;
    x: number;
    y: number;
    onChange: (x: number, y: number) => void;
    className?: string;
}

export const RadarMatrix = ({
    config,
    locale,
    x,
    y,
    onChange,
    className
}: RadarMatrixProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Position logic
    // x, y are 0-100.
    // Visual position needs to be mapped to the container size.

    const handleInteraction = (clientX: number, clientY: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        // Calculate 0-100 coordinates
        let newX = ((clientX - rect.left) / rect.width) * 100;
        let newY = 100 - ((clientY - rect.top) / rect.height) * 100; // Y is inverted in CSS (top is 0) but conceptually 100 is "Top"

        // Clamp
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        onChange(Math.round(newX), Math.round(newY));
    };

    const onMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e.clientX, e.clientY);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    };

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (isDragging) handleInteraction(e.clientX, e.clientY);
        };
        const onUp = () => setIsDragging(false);

        const onTouchMove = (e: TouchEvent) => {
            if (isDragging) handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
        };

        if (isDragging) {
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
            window.addEventListener('touchmove', onTouchMove);
            window.addEventListener('touchend', onUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onUp);
        };
    }, [isDragging]);

    // Determine current quadrant for dynamic background
    const isRight = x >= 50;
    const isTop = y >= 50;

    let quadrantName = "";
    if (isRight && isTop) quadrantName = locale === 'en' ? config.quadrants.topRight.labelEn : config.quadrants.topRight.label;
    if (!isRight && isTop) quadrantName = locale === 'en' ? config.quadrants.topLeft.labelEn : config.quadrants.topLeft.label;
    if (isRight && !isTop) quadrantName = locale === 'en' ? config.quadrants.bottomRight.labelEn : config.quadrants.bottomRight.label;
    if (!isRight && !isTop) quadrantName = locale === 'en' ? config.quadrants.bottomLeft.labelEn : config.quadrants.bottomLeft.label;

    return (
        <GlassCard className={cn("flex flex-col gap-4", className)}>
            <div className="pb-2 border-b border-white/5 mb-4">
                <h3 className="font-bold text-lg text-white/90">
                    {locale === 'en' ? config.labelEn : config.label}
                </h3>
                {(config.source || config.sourceEn) && (
                    <p className="text-xs text-slate-400 mt-1">
                        Source: {locale === 'en' ? config.sourceEn : config.source}
                    </p>
                )}
            </div>

            {/* Grid Container */}
            <div
                ref={containerRef}
                className="relative w-full aspect-square bg-slate-900/50 rounded-lg border border-white/10 overflow-hidden cursor-crosshair touch-none select-none"
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className={cn("border-r border-b border-white/5 transition-colors duration-500", !isRight && isTop ? "bg-cyan-500/10" : "")}></div>
                    <div className={cn("border-b border-white/5 transition-colors duration-500", isRight && isTop ? "bg-purple-500/10" : "")}></div>
                    <div className={cn("border-r border-white/5 transition-colors duration-500", !isRight && !isTop ? "bg-blue-500/10" : "")}></div>
                    <div className={cn("transition-colors duration-500", isRight && !isTop ? "bg-emerald-500/10" : "")}></div>
                </div>

                {/* Center Crosshair */}
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20"></div>
                <div className="absolute left-1/2 top-0 w-[1px] h-full bg-white/20"></div>

                {/* Axis Labels (Absolute positioning) - Updated for visibility and orientation */}
                {/* Top (Y Max) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs md:text-sm text-cyan-200/80 font-bold tracking-widest text-center bg-slate-900/50 px-2 rounded backdrop-blur-sm z-0">
                    {locale === 'en' ? config.yAxis.labelMaxEn : config.yAxis.labelMax} ↑
                </div>
                {/* Bottom (Y Min) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs md:text-sm text-cyan-200/80 font-bold tracking-widest text-center bg-slate-900/50 px-2 rounded backdrop-blur-sm z-0">
                    {locale === 'en' ? config.yAxis.labelMinEn : config.yAxis.labelMin} ↓
                </div>

                {/* Left (X Min) */}
                <div className="absolute top-1/2 left-2 -translate-y-1/2 text-xs md:text-sm text-cyan-200/80 font-bold tracking-widest text-left bg-slate-900/50 px-1 py-1 rounded backdrop-blur-sm z-0">
                    ← {locale === 'en' ? config.xAxis.labelMinEn : config.xAxis.labelMin}
                </div>
                {/* Right (X Max) */}
                <div className="absolute top-1/2 right-2 -translate-y-1/2 text-xs md:text-sm text-cyan-200/80 font-bold tracking-widest text-right bg-slate-900/50 px-1 py-1 rounded backdrop-blur-sm z-0">
                    {locale === 'en' ? config.xAxis.labelMaxEn : config.xAxis.labelMax} →
                </div>

                {/* The Dot */}
                <motion.div
                    className="absolute w-5 h-5 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] border-2 border-cyan-500 z-10"
                    style={{
                        left: `calc(${x}% - 10px)`,
                        top: `calc(${100 - y}% - 10px)`, // Invert Y for CSS top
                    }}
                    animate={{ scale: isDragging ? 1.5 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                    <div className="absolute inset-0 rounded-full bg-cyan-400 animate-pulse opacity-50 blur-sm"></div>
                </motion.div>
            </div>
        </GlassCard>
    );
};
