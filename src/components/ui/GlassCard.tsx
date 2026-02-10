
"use client";

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const GlassCard = ({ children, className = '', delay = 0 }: GlassCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay, duration: 0.5, ease: "easeInOut" }} // Increased from 0.05
            className={`glass-panel p-6 rounded-2xl ${className}`}
        >
            {children}
        </motion.div>
    );
};
