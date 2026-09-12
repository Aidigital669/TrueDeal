"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Shield, Cpu } from "lucide-react";

interface Intro3DAnimationProps {
  onComplete: () => void;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  origX: number;
  origY: number;
  origZ: number;
  size: number;
  color: string;
}

export function Intro3DAnimation({ onComplete }: Intro3DAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing Neural Core...");
  const [isExiting, setIsExiting] = useState(false);

  // Mouse interaction state for 3D tilt
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Progress sequence
  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds total intro

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 25) {
        setStatusText("Calibrating TrueDeal Neural Matrix...");
      } else if (pct < 55) {
        setStatusText("Mapping Direct Seller Network...");
      } else if (pct < 85) {
        setStatusText("Synchronizing AI Marketplace Engine...");
      } else {
        setStatusText("TrueDeal AI Online");
      }

      if (pct >= 100) {
        clearInterval(timer);
        handleTriggerExit();
      }
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const handleTriggerExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 700);
  };

  // Mouse tilt handler
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseRef.current.targetX = (clientX / innerWidth - 0.5) * 2;
    mouseRef.current.targetY = (clientY / innerHeight - 0.5) * 2;
  };

  // 3D Canvas Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Create 3D spherical point cloud (Fibonacci distribution for perfect sphere)
    const points: Point3D[] = [];
    const numPoints = 280;
    const sphereRadius = Math.min(width, height) * 0.28;
    const colors = ["#818cf8", "#c084fc", "#38bdf8", "#f472b6", "#a855f7", "#ffffff"];

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      const pX = x * sphereRadius;
      const pY = y * sphereRadius;
      const pZ = z * sphereRadius;

      points.push({
        x: pX,
        y: pY,
        z: pZ,
        origX: pX,
        origY: pY,
        origZ: pZ,
        size: Math.random() * 2.2 + 1.2,
        color: colors[i % colors.length]
      });
    }

    // Add extra outer orbital rings points
    const numRingPoints = 120;
    const ringRadius = sphereRadius * 1.35;
    for (let i = 0; i < numRingPoints; i++) {
      const angle = (i / numRingPoints) * Math.PI * 2;
      const pX = Math.cos(angle) * ringRadius;
      const pZ = Math.sin(angle) * ringRadius;
      const pY = (Math.random() - 0.5) * 20;

      points.push({
        x: pX,
        y: pY,
        z: pZ,
        origX: pX,
        origY: pY,
        origZ: pZ,
        size: Math.random() * 2.5 + 1.5,
        color: i % 2 === 0 ? "#6366f1" : "#ec4899"
      });
    }

    let angleX = 0;
    let angleY = 0;
    let angleZ = 0;

    const render = () => {
      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Deep space ambient radial glow in background
      const ambientGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        sphereRadius * 1.8
      );
      ambientGrad.addColorStop(0, "rgba(99, 102, 241, 0.18)");
      ambientGrad.addColorStop(0.4, "rgba(168, 85, 247, 0.12)");
      ambientGrad.addColorStop(0.8, "rgba(236, 72, 153, 0.04)");
      ambientGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      const fov = 420;
      const centerX = width / 2;
      const centerY = height / 2;

      // Rotate angles
      angleX += 0.006 + mouseRef.current.y * 0.01;
      angleY += 0.01 + mouseRef.current.x * 0.01;
      angleZ += 0.003;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      // Transform 3D coordinates
      const transformedPoints = points.map(p => {
        // Y rotation
        let x1 = p.origX * cosY - p.origZ * sinY;
        let z1 = p.origZ * cosY + p.origX * sinY;

        // X rotation
        let y2 = p.origY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.origY * sinX;

        // Z rotation
        let x3 = x1 * cosZ - y2 * sinZ;
        let y3 = y2 * cosZ + x1 * sinZ;

        // Perspective projection
        const scale = fov / (fov + z2 + sphereRadius * 1.5);
        const projX = x3 * scale + centerX;
        const projY = y3 * scale + centerY;

        return {
          projX,
          projY,
          scale,
          z: z2,
          size: p.size * scale,
          color: p.color
        };
      });

      // Sort points back-to-front (Painter's algorithm)
      transformedPoints.sort((a, b) => b.z - a.z);

      // Draw glowing constellation links between close points
      ctx.lineWidth = 0.6;
      for (let i = 0; i < transformedPoints.length; i += 2) {
        const p1 = transformedPoints[i];
        if (p1.z < -sphereRadius * 0.5) continue; // Skip far back for performance

        for (let j = i + 1; j < Math.min(i + 8, transformedPoints.length); j++) {
          const p2 = transformedPoints[j];
          const dx = p1.projX - p2.projX;
          const dy = p1.projY - p2.projY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            const alpha = (1 - dist / 60) * 0.25 * p1.scale;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.projX, p1.projY);
            ctx.lineTo(p2.projX, p2.projY);
            ctx.stroke();
          }
        }
      }

      // Render 3D points
      for (const p of transformedPoints) {
        const alpha = Math.max(0.15, Math.min(1, (p.z + sphereRadius) / (sphereRadius * 2)));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.scale > 1 ? 12 : 6;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.projX, p.projY, Math.max(0.8, p.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="intro-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.4,
            filter: "blur(20px)",
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
          }}
          onMouseMove={handleMouseMove}
          className="fixed inset-0 w-screen h-screen top-0 left-0 right-0 bottom-0 z-[99999] flex flex-col items-center justify-between bg-[#07070b] text-white font-sans overflow-hidden select-none"
        >
          {/* Background Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0 block"
            style={{ width: "100vw", height: "100vh" }}
          />

          {/* Top Status & Skip Bar */}
          <div className="relative z-10 w-full px-6 py-6 flex items-center justify-between max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-gray-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span>TrueDeal AI Engine</span>
            </motion.div>

            {/* Skip Button */}
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleTriggerExit}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white backdrop-blur-md transition-all cursor-pointer group hover:scale-105 active:scale-95"
            >
              <span>Skip Intro</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          </div>

          {/* ========================================================= */}
          {/* SLEEK LOW-EFFECT LASER LIGHT (PRECISION SCANNER) */}
          {/* ========================================================= */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
            {/* Fine Vertical/Horizontal Laser Scanner Line */}
            <motion.div
              animate={{
                y: ["-140px", "140px", "-140px"],
                opacity: [0.35, 0.75, 0.35]
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-[320px] sm:w-[460px] flex flex-col items-center pointer-events-none"
            >
              {/* Subtle Laser Scan Wave */}
              <div className="w-full h-6 bg-gradient-to-b from-transparent to-cyan-400/10 pointer-events-none" />
              {/* Sharp 1px Laser Line */}
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_6px_#22d3ee]" />
            </motion.div>

            {/* Subtle Static Horizontal Laser Guide */}
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />
          </div>

          {/* Central 3D Hologram & Title Stack */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 my-auto">
            
            {/* 3D Holographic Gyroscope Core Container */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center mb-8 perspective-[1000px]">
              
              {/* Fine Sleek Laser Beam Through Core */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 via-white to-transparent shadow-[0_0_8px_#38bdf8] pointer-events-none z-20 opacity-80" />

              {/* Outer 3D Gyroscopic Ring 1 */}
              <motion.div
                animate={{ rotateX: [65, 65], rotateZ: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 border-b-purple-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] pointer-events-none [transform-style:preserve-3d]"
              />

              {/* 3D Gyroscopic Ring 2 (Counter-Rotating) */}
              <motion.div
                animate={{ rotateY: [65, 65], rotateZ: [360, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full border-2 border-pink-500/40 border-l-pink-400 border-r-cyan-400 shadow-[0_0_30px_rgba(236,72,153,0.3)] pointer-events-none [transform-style:preserve-3d]"
              />

              {/* 3D Pulsing Energy Core */}
              <motion.div
                animate={{
                  scale: [0.95, 1.08, 0.95],
                  boxShadow: [
                    "0 0 40px rgba(99,102,241,0.5)",
                    "0 0 80px rgba(168,85,247,0.8)",
                    "0 0 40px rgba(99,102,241,0.5)"
                  ]
                }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white relative z-10 border border-white/30 backdrop-blur-xl shadow-2xl"
              >
                {/* Floating "TD" Insignia */}
                <span className="font-black text-3xl sm:text-4xl tracking-tight text-white drop-shadow-md">
                  TD
                </span>

                {/* Sparkling Orbiters */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-2 rounded-3xl pointer-events-none border border-cyan-400/50 border-dashed"
                />
              </motion.div>
            </div>

            {/* Glowing Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2 max-w-lg"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200 drop-shadow-sm">
                TrueDeal AI
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base font-medium text-indigo-200/80 max-w-md mx-auto">
                Next-Generation Direct Marketplace Intelligence
              </p>
            </motion.div>
          </div>

          {/* Bottom High-Tech Telemetry Loader */}
          <div className="relative z-10 w-full max-w-md px-6 pb-10 flex flex-col items-center space-y-3">
            
            {/* Status Text & Percentage */}
            <div className="w-full flex items-center justify-between text-xs font-mono">
              <span className="text-indigo-300 font-medium flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>{statusText}</span>
              </span>
              <span className="text-white font-bold tracking-wider">{progress}%</span>
            </div>

            {/* Neon Glowing Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative border border-white/10 p-0.5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
            </div>

            {/* Sub-label */}
            <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest pt-1">
              <span>Verified Sellers</span>
              <span>•</span>
              <span>Direct Contacts</span>
              <span>•</span>
              <span>Instant AI Search</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
