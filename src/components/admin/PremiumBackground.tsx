import React from "react";
import { motion } from "framer-motion";

const PremiumBackground: React.FC = () => (
  <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#F3E8FF] dark:bg-[#F3E8FF] transition-colors duration-700">
    {/* Base Gradient Layer */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#F3E8FF_0%,#E9D5FF_100%)] dark:bg-[radial-gradient(circle_at_50%_0%,#F3E8FF_0%,#E9D5FF_100%)] transition-opacity duration-700" />

    {/* Dynamic Soft Aurora Blobs - Reduced Blur and added will-change for performance */}
    <motion.div
      style={{ willChange: "transform" }}
      animate={{
        scale: [1, 1.05, 1],
        x: [0, 30, 0],
        y: [0, 20, 0],
        rotate: [0, 10, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[-10%] left-[-5%] w-[70%] h-[70%] bg-blue-400/10 dark:bg-indigo-500/15 blur-[80px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-700"
    />
    
    <motion.div
      style={{ willChange: "transform" }}
      animate={{
        scale: [1, 1.1, 1],
        x: [0, -40, 0],
        y: [0, 30, 0],
        rotate: [0, -15, 0],
      }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-[-20%] right-[-5%] w-[80%] h-[80%] bg-indigo-300/10 dark:bg-violet-600/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-700"
    />

    <motion.div
      style={{ willChange: "transform" }}
      animate={{
        scale: [1, 1.02, 1],
        x: [0, 20, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      className="absolute top-[30%] right-[15%] w-[40%] h-[40%] bg-violet-200/15 dark:bg-indigo-400/5 blur-[70px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-700"
    />

    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_200_200%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22noiseFilter%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%220.65%22_numOctaves=%223%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.01] dark:opacity-[0.02] contrast-125 brightness-110 pointer-events-none" />

    {/* Subtle Grid overlay for 'Tech' feel */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.015)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_70%,transparent_100%)] transition-opacity duration-700" />
  </div>
);

export default PremiumBackground;
