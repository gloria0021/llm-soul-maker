
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeonSliderProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
    label: string;
    leftLabel?: string;
    rightLabel?: string;
    className?: string;
}

export const NeonSlider = ({
    value,
    min = 0,
    max = 100,
    onChange,
    label,
    leftLabel,
    rightLabel,
    className
}: NeonSliderProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const trackRef = useRef<HTMLDivElement>(null);

    const percentage = ((value - min) / (max - min)) * 100;

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;

        // Calculate percentage based on click position
        let newPercentage = ((clientX - rect.left) / rect.width) * 100;

        // Clamp between 0 and 100
        newPercentage = Math.max(0, Math.min(100, newPercentage));

        // Convert back to value
        const newValue = Math.round((newPercentage / 100) * (max - min) + min);

        onChange(newValue);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleInteraction(e);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        handleInteraction(e);
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                handleInteraction(e);
            }
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        const handleGlobalTouchMove = (e: TouchEvent) => {
            if (isDragging) {
                handleInteraction(e);
            }
        };

        const handleGlobalTouchEnd = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleGlobalMouseMove);
            window.addEventListener('mouseup', handleGlobalMouseUp);
            window.addEventListener('touchmove', handleGlobalTouchMove);
            window.addEventListener('touchend', handleGlobalTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('touchmove', handleGlobalTouchMove);
            window.removeEventListener('touchend', handleGlobalTouchEnd);
        };
    }, [isDragging, max, min, onChange]);

    return (
        <div className={cn("w-full py-4 select-none", className)}>
            {/* Label Header */}
            <div className="flex justify-between items-end mb-3">
                <span className="text-white/90 font-medium tracking-wide text-sm md:text-base">
                    {label}
                </span>
                <span className="text-cyan-400 font-mono text-xs md:text-sm bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                    {value}%
                </span>
            </div>

            {/* Slider Track Area */}
            <div
                ref={trackRef}
                className="relative h-6 flex items-center cursor-pointer group"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                {/* Background Track */}
                <div className="absolute w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/30">
                    {/* Active Fill with Gradient */}
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-900 via-cyan-500 to-blue-500"
                        style={{ width: `${percentage}%` }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                </div>

                {/* Thumb (The glowing orb) */}
                <motion.div
                    className="absolute h-5 w-5 bg-white rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)] border-2 border-cyan-400 z-10"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                    animate={{ scale: isDragging ? 1.2 : 1 }}
                    whileHover={{ scale: 1.2 }}
                >
                    <div className="absolute inset-0 rounded-full bg-cyan-400 animate-pulse opacity-50 blur-sm"></div>
                </motion.div>
            </div>

            {/* Axis Labels */}
            <div className="flex justify-between mt-2 text-[10px] md:text-xs text-slate-400 font-light">
                <span className={cn("transition-colors duration-300", percentage < 30 ? "text-cyan-200/80" : "")}>
                    {leftLabel}
                </span>
                <span className={cn("transition-colors duration-300", percentage > 70 ? "text-cyan-200/80" : "")}>
                    {rightLabel}
                </span>
            </div>
        </div>
    );
};
