import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', glow = '', onClick, hover = true }) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : {}}
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 transition-all duration-200 ${glow} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
