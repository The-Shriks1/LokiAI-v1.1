/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX, ShieldAlert, CheckCircle2 } from "lucide-react";

// 5x7 Dot-matrix representation of digits 0-9
const BITMAPS: Record<number, number[][]> = {
  0: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  1: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  2: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  3: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  4: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
  ],
  5: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  6: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  7: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  8: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
  9: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ],
};

// Represents a single physical 5x7 mechanical grid segment
interface MechanicalMatrixDigitProps {
  value: number;
  isRust?: boolean;
  isComplete?: boolean;
}

function MechanicalMatrixDigit({ value, isRust = false, isComplete = false }: MechanicalMatrixDigitProps) {
  const grid = BITMAPS[value] || BITMAPS[0];

  return (
    <div className="grid grid-cols-5 gap-[0.5px] sm:gap-[1px] md:gap-[1.5px] p-[1.5px] sm:p-[2.5px] md:p-[3px] bg-basalt-950 rounded basalt-well relative overflow-hidden w-[16px] h-[24px] xs:w-[20px] xs:h-[30px] sm:w-[26px] sm:h-[38px] md:w-[34px] md:h-[50px] lg:w-[36px] lg:h-[52px] xl:w-[42px] xl:h-[60px] select-none border border-basalt-800 shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex-shrink-0">
      {grid.map((row, rIdx) =>
         row.map((active, cIdx) => {
          const isActive = active === 1;
          
          let activeClass = "bg-[#f5f5f0] shadow-[0_0_8px_2px_rgba(255,255,255,0.95)]";
          let coreClass = "bg-white";
          if (isComplete) {
            activeClass = "bg-[#4CAF50] shadow-[0_0_10px_3px_rgba(76,175,80,0.95)]";
            coreClass = "bg-[#e8f5e9]";
          } else if (isRust) {
            activeClass = "bg-[#66BB6A] shadow-[0_0_10px_3px_rgba(102,187,106,0.95)]";
            coreClass = "bg-[#e8f5e9]";
          }

          return (
            <div
              key={`${rIdx}-${cIdx}`}
              className="relative w-full h-full rounded-[0.5px] bg-[#050607] flex items-center justify-center overflow-hidden"
            >
              {/* LED die emitter */}
              <div
                className={`w-[85%] h-[85%] rounded-[0.5px] transition-all duration-150 relative flex items-center justify-center ${
                  isActive 
                    ? `${activeClass} scale-100` 
                    : "bg-basalt-900/10 opacity-[0.05] scale-50"
                }`}
              >
                {isActive && (
                  <div className={`w-[50%] h-[50%] rounded-[0.2px] ${coreClass} shadow-[0_0_4px_rgba(255,255,255,1)] z-10`} />
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Physical coverplate glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.08] pointer-events-none z-20" />
      
      {/* Dynamic scanline grid to make it look like a physical cathode display element */}
      <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(0,0,0,0.5)_50%,transparent_50%)] bg-[size:100%_2px] pointer-events-none z-10" />
    </div>
  );
}

// Delimiter dots component that blinks or stays solid
interface DelimiterProps {
  blink?: boolean;
  isRust?: boolean;
  isComplete?: boolean;
}

function Delimiter({ blink = false, isRust = false, isComplete = false }: DelimiterProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!blink) return;
    const interval = setInterval(() => {
      setVisible((v) => !v);
    }, 1000);
    return () => clearInterval(interval);
  }, [blink]);

  let activeClass = "bg-ivory shadow-[0_0_6px_1px_rgba(240,238,233,0.6),inset_0.5px_0.5px_1px_rgba(255,255,255,0.8)]";
  let coreClass = "bg-white";
  if (isComplete) {
    activeClass = "bg-[#6cad6c] shadow-[0_0_8px_2px_rgba(108,173,108,0.7),inset_0.5px_0.5px_1px_rgba(255,255,255,0.9)]";
    coreClass = "bg-[#d4f0d4]";
  } else if (isRust) {
    activeClass = "bg-[#43A047] shadow-[0_0_8px_2px_rgba(67,160,71,0.85),inset_0.5px_0.5px_1px_rgba(255,255,255,0.9)]";
    coreClass = "bg-[#e8f5e9]";
  }

  return (
    <div className="flex flex-col justify-center items-center gap-1 xs:gap-1.5 md:gap-3 px-0.5 md:px-1 select-none flex-shrink-0">
      {/* Upper Dot Cup */}
      <div 
        className="w-1.5 xs:w-2 md:w-2.5 h-1.5 xs:h-2 md:h-2.5 rounded-full bg-[#0c0d0e] flex items-center justify-center border-[0.3px] border-basalt-950/40"
        style={{ boxShadow: "inset 0.5px 0.5px 1px rgba(0, 0, 0, 0.95)" }}
      >
        <div
          className={`w-[60%] h-[60%] rounded-full transition-all duration-[240ms] relative flex items-center justify-center ${
            visible ? `${activeClass} scale-100` : "bg-basalt-900/20 opacity-[0.12] scale-75"
          }`}
        >
          {visible && (
            <div className={`w-[35%] h-[35%] rounded-full ${coreClass} shadow-[0_0_3px_rgba(255,255,255,0.9)] z-10`} />
          )}
        </div>
      </div>

      {/* Lower Dot Cup */}
      <div 
        className="w-1.5 xs:w-2 md:w-2.5 h-1.5 xs:h-2 md:h-2.5 rounded-full bg-[#0c0d0e] flex items-center justify-center border-[0.3px] border-basalt-950/40"
        style={{ boxShadow: "inset 0.5px 0.5px 1px rgba(0, 0, 0, 0.95)" }}
      >
        <div
          className={`w-[60%] h-[60%] rounded-full transition-all duration-[240ms] relative flex items-center justify-center ${
            visible ? `${activeClass} scale-100` : "bg-basalt-900/20 opacity-[0.12] scale-75"
          }`}
        >
          {visible && (
            <div className={`w-[35%] h-[35%] rounded-full ${coreClass} shadow-[0_0_3px_rgba(255,255,255,0.9)] z-10`} />
          )}
        </div>
      </div>
    </div>
  );
}

// Main App component
export default function App() {
  const TARGET_DATE = new Date("2026-07-19T19:00:00");
  const TOTAL_DURATION_SEC = 24 * 60 * 60; // 24 hours reference frame for percentage calculation
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    ms: 0,
    percentage: 0,
    isComplete: false,
  });

  const [soundEnabled, setSoundEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // High performance SVG path & Ring refs to bypass React render bottleneck
  const wavePathRef1 = useRef<SVGPathElement>(null);
  const wavePathRef2 = useRef<SVGPathElement>(null);
  const ringRef1 = useRef<SVGGElement>(null);
  const ringRef2 = useRef<SVGGElement>(null);
  const ringRef3 = useRef<SVGGElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Synchronized continuous loop for sub-second precision & smooth drawing
  useEffect(() => {
    let animationFrameId: number;
    
    const updateTimer = () => {
      const now = new Date();
      const diffMs = TARGET_DATE.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          ms: 0,
          percentage: 100.0,
          isComplete: true,
        });

        // Flatten the waves in the complete state
        if (wavePathRef1.current) wavePathRef1.current.setAttribute("d", "M 0 40 L 400 40");
        if (wavePathRef2.current) wavePathRef2.current.setAttribute("d", "M 0 40 L 400 40");

        // Stop high frequency audio
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.5);
        }
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        const ms = Math.floor(diffMs % 1000);
        
        // Dynamic alignment percentage tracking (high-precision cosmic factor)
        const totalMsRemaining = diffMs;
        const totalMsInRefFrame = TOTAL_DURATION_SEC * 1000;
        const progressFrac = Math.max(0, 1 - totalMsRemaining / totalMsInRefFrame);
        const percentage = progressFrac * 100;

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          ms,
          percentage,
          isComplete: false,
        });

        // 1. Direct high-performance SVG wave manipulation (60fps)
        const timeFactor = Date.now() * 0.0035;
        // Convergence scaling: waves become denser & lower amplitude as we approach target
        const distanceScale = Math.min(1.0, totalMsRemaining / (12 * 60 * 60 * 1000)); // scale based on last 12 hours
        const amp = 8 + 15 * distanceScale;
        const freq = 0.015 + 0.035 * (1 - distanceScale);

        // Path 1 (Gravitational Primary Wave)
        let d1 = "M 0 40";
        for (let x = 0; x <= 400; x += 4) {
          const y = 40 + Math.sin(x * freq + timeFactor) * amp * Math.cos(x * 0.005 - timeFactor * 0.3);
          d1 += ` L ${x} ${y.toFixed(2)}`;
        }
        if (wavePathRef1.current) wavePathRef1.current.setAttribute("d", d1);

        // Path 2 (Interfering Secondary Wave)
        let d2 = "M 0 40";
        for (let x = 0; x <= 400; x += 4) {
          const y = 40 + Math.sin(x * freq * 1.4 - timeFactor * 1.2) * (amp * 0.5) * Math.sin(x * 0.008 + timeFactor * 0.5);
          d2 += ` L ${x} ${y.toFixed(2)}`;
        }
        if (wavePathRef2.current) wavePathRef2.current.setAttribute("d", d2);

        // 2. Direct high-performance rotation of orbital alignment rings
        if (ringRef1.current) {
          const deg1 = (timeFactor * 2) % 360;
          ringRef1.current.style.transform = `rotate(${deg1.toFixed(3)}deg)`;
        }
        if (ringRef2.current) {
          const deg2 = (-timeFactor * 0.8) % 360;
          ringRef2.current.style.transform = `rotate(${deg2.toFixed(3)}deg)`;
        }
        if (ringRef3.current) {
          const deg3 = (timeFactor * 0.3) % 360;
          ringRef3.current.style.transform = `rotate(${deg3.toFixed(3)}deg)`;
        }

        // 3. Modulate Audio Synthesizer based on remaining time (Subtle cosmic frequency)
        if (soundEnabled && audioContextRef.current && oscillatorRef.current && filterRef.current && gainNodeRef.current) {
          // As we get closer, the pitch very slowly shifts down into a heavy mechanical hum
          const baseFreq = 50 + 40 * distanceScale; // Hum from 90Hz down to a heavy 50Hz
          oscillatorRef.current.frequency.setTargetAtTime(baseFreq, audioContextRef.current.currentTime, 0.1);
          
          // Modulation based on wave amplitude
          const cutoff = 150 + 200 * Math.sin(timeFactor * 0.5);
          filterRef.current.frequency.setTargetAtTime(Math.max(80, cutoff), audioContextRef.current.currentTime, 0.1);
        }
      }

      animationFrameId = requestAnimationFrame(updateTimer);
    };

    animationFrameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(animationFrameId);
  }, [soundEnabled]);

  // Audio initialization (Web Audio API Synthesizer)
  const toggleSound = () => {
    if (!soundEnabled) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Subtly warm low-frequency mechanical synthesizer
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(200, ctx.currentTime);
        filter.Q.setValueAtTime(4, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.setTargetAtTime(0.04, ctx.currentTime, 0.3); // Safe, low volume atmospheric rumble

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();

        oscillatorRef.current = osc;
        filterRef.current = filter;
        gainNodeRef.current = gain;
        setSoundEnabled(true);
      } catch (err) {
        console.warn("Audio context failed to start:", err);
      }
    } else {
      if (gainNodeRef.current && audioContextRef.current) {
        gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.15);
        setTimeout(() => {
          oscillatorRef.current?.stop();
          audioContextRef.current?.close();
          oscillatorRef.current = null;
          audioContextRef.current = null;
          filterRef.current = null;
          gainNodeRef.current = null;
          setSoundEnabled(false);
        }, 200);
      }
    }
  };

  // Convert digits to separate array values
  const formatNum = (num: number, digits: number = 2): number[] => {
    const s = String(num).padStart(digits, "0");
    return s.split("").map(Number);
  };

  const dArr = formatNum(timeLeft.days);
  const hArr = formatNum(timeLeft.hours);
  const mArr = formatNum(timeLeft.minutes);
  const sArr = formatNum(timeLeft.seconds);
  const msArr = formatNum(timeLeft.ms, 3);

  return (
    <div 
      ref={containerRef}
      style={{
        "--mx": "0.25",
        "--my": "-0.45",
      } as React.CSSProperties}
      className="relative h-screen w-screen flex flex-col items-center justify-center bg-basalt-950 p-2 sm:p-4 md:p-6 lg:p-8 select-none overflow-hidden"
    >
      {/* Organic Texture Overlay */}
      <div className="noise-overlay" />

      {/* Extreme Background: Deep Coordinate Grid (Tactile mechanical alignment feel) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none">
        <div className="w-[120vh] h-[120vh] border border-basalt-800 rounded-full flex items-center justify-center">
          <div className="w-[90vh] h-[90vh] border border-dashed border-basalt-800 rounded-full flex items-center justify-center">
            <div className="w-[60vh] h-[60vh] border border-basalt-800 rounded-full flex items-center justify-center">
              <div className="w-[30vh] h-[30vh] border border-dashed border-basalt-800 rounded-full" />
            </div>
          </div>
        </div>
        {/* Grid Lines */}
        <div className="absolute w-[140vw] h-[1px] bg-basalt-800" />
        <div className="absolute h-[140vh] w-[1px] bg-basalt-800" />
      </div>

      {/* Ambient Audio Control (Grounded physical instrument design) */}
      <button
        onClick={toggleSound}
        className="absolute top-4 right-4 p-1.5 rounded-full border border-basalt-800 bg-basalt-900/60 text-sand hover:text-ivory hover:border-sand/40 transition-all z-50 cursor-pointer basalt-plate flex items-center gap-2 text-[10px] md:text-xs font-mono tracking-widest px-2.5 py-1"
      >
        {soundEnabled ? (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#43A047] animate-ping" />
            <span className="text-[#43A047]">SOUND: ON</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-basalt-800" />
            <span>SOUND: OFF</span>
          </div>
        )}
      </button>

      {/* Main Central Monolith (3D Tablet) */}
      <div
        className="relative w-full max-w-5xl bg-basalt-900 rounded-xl border border-basalt-800 p-3 sm:p-5 md:p-6 lg:p-8 basalt-plate flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 z-10"
      >
        {/* Physical industrial machined screws in 4 corners of faceplate */}
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-gradient-to-br from-basalt-600 to-basalt-950 border border-basalt-800 shadow-[inset_0.5px_0.5px_1px_rgba(255,255,255,0.15),_0.5px_0.5px_1px_rgba(0,0,0,0.8)] flex items-center justify-center opacity-70 pointer-events-none">
          <div className="w-[1.2px] h-[5px] bg-basalt-900/60 rotate-45" />
        </div>
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gradient-to-br from-basalt-600 to-basalt-950 border border-basalt-800 shadow-[inset_0.5px_0.5px_1px_rgba(255,255,255,0.15),_0.5px_0.5px_1px_rgba(0,0,0,0.8)] flex items-center justify-center opacity-70 pointer-events-none">
          <div className="w-[1.2px] h-[5px] bg-basalt-900/60 -rotate-12" />
        </div>
        <div className="absolute bottom-2.5 left-2.5 w-2 h-2 rounded-full bg-gradient-to-br from-basalt-600 to-basalt-950 border border-basalt-800 shadow-[inset_0.5px_0.5px_1px_rgba(255,255,255,0.15),_0.5px_0.5px_1px_rgba(0,0,0,0.8)] flex items-center justify-center opacity-70 pointer-events-none">
          <div className="w-[1.2px] h-[5px] bg-basalt-900/60 rotate-[70deg]" />
        </div>
        <div className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full bg-gradient-to-br from-basalt-600 to-basalt-950 border border-basalt-800 shadow-[inset_0.5px_0.5px_1px_rgba(255,255,255,0.15),_0.5px_0.5px_1px_rgba(0,0,0,0.8)] flex items-center justify-center opacity-70 pointer-events-none">
          <div className="w-[1.2px] h-[5px] bg-basalt-900/60 rotate-12" />
        </div>

        {/* LokiAI Brand Header */}
        <div className="flex items-center justify-between border-b border-basalt-800 pb-3">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="LokiAI Logo" className="w-8 h-8 rounded-lg shadow-md" />
            <div className="flex flex-col">
              <span className="font-mono text-sm md:text-base text-ivory font-bold tracking-wider">LokiAI</span>
              <span className="font-mono text-[9px] text-sand/60 tracking-widest uppercase">Edge AI Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${timeLeft.isComplete ? 'bg-moss animate-pulse' : 'bg-rust animate-pulse'}`} />
          </div>
        </div>

        {/* Target Info Bar */}
        <div className="flex justify-between items-center text-xs font-mono text-sand/70 pb-1">
          <span>TARGET LAUNCH:</span>
          <span className="text-ivory font-semibold tracking-wider">19 JULY 2026, 19:00</span>
        </div>

        {/* Tactical Interior Layout (Grid: Left Countdown / Right Astrolabe) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Section A: Countdown Block Matrix (8 Columns in LG) */}
          <div className="lg:col-span-8 flex flex-col gap-4 md:gap-6 w-full min-w-0">
            
            {/* The Digital Block Console - Perfectly responsive matrix console with zero clipping */}
            <div className="w-full bg-basalt-950/40 rounded-lg basalt-well border border-basalt-950/80 overflow-hidden select-none p-1.5 xs:p-2 sm:p-3 md:p-4">
              <div className="flex flex-nowrap items-center justify-between sm:justify-center gap-x-0.5 xs:gap-x-1 sm:gap-x-2 md:gap-x-2.5 lg:gap-x-3 w-full">
                
                {/* DAYS GROUP */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="flex gap-0.5 md:gap-1">
                    <MechanicalMatrixDigit value={dArr[0]} isComplete={timeLeft.isComplete} />
                    <MechanicalMatrixDigit value={dArr[1]} isComplete={timeLeft.isComplete} />
                  </div>
                  <span className="font-mono text-[7px] xs:text-[8px] md:text-[10px] text-sand tracking-[0.1em] mt-0.5 font-medium whitespace-nowrap text-center">DAYS</span>
                </div>

                <Delimiter blink={!timeLeft.isComplete} isComplete={timeLeft.isComplete} />

                {/* HOURS GROUP */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="flex gap-0.5 md:gap-1">
                    <MechanicalMatrixDigit value={hArr[0]} isComplete={timeLeft.isComplete} />
                    <MechanicalMatrixDigit value={hArr[1]} isComplete={timeLeft.isComplete} />
                  </div>
                  <span className="font-mono text-[7px] xs:text-[8px] md:text-[10px] text-sand tracking-[0.1em] mt-0.5 font-medium whitespace-nowrap text-center">HOURS</span>
                </div>

                <Delimiter blink={!timeLeft.isComplete} isComplete={timeLeft.isComplete} />

                {/* MINUTES GROUP */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="flex gap-0.5 md:gap-1">
                    <MechanicalMatrixDigit value={mArr[0]} isComplete={timeLeft.isComplete} />
                    <MechanicalMatrixDigit value={mArr[1]} isComplete={timeLeft.isComplete} />
                  </div>
                  <span className="font-mono text-[7px] xs:text-[8px] md:text-[10px] text-sand tracking-[0.1em] mt-0.5 font-medium whitespace-nowrap text-center">MINUTES</span>
                </div>

                <Delimiter blink={!timeLeft.isComplete} isComplete={timeLeft.isComplete} />

                {/* SECONDS GROUP */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="flex gap-0.5 md:gap-1">
                    <MechanicalMatrixDigit value={sArr[0]} isComplete={timeLeft.isComplete} />
                    <MechanicalMatrixDigit value={sArr[1]} isComplete={timeLeft.isComplete} />
                  </div>
                  <span className="font-mono text-[7px] xs:text-[8px] md:text-[10px] text-sand tracking-[0.1em] mt-0.5 font-medium whitespace-nowrap text-center">SECONDS</span>
                </div>

                <Delimiter blink={false} isRust={true} isComplete={timeLeft.isComplete} />

                {/* MILLISECONDS GROUP (Fluttering physical micro-intervals) */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="flex gap-0.5 md:gap-1">
                    <MechanicalMatrixDigit value={msArr[0]} isRust={true} isComplete={timeLeft.isComplete} />
                    <MechanicalMatrixDigit value={msArr[1]} isRust={true} isComplete={timeLeft.isComplete} />
                    <MechanicalMatrixDigit value={msArr[2]} isRust={true} isComplete={timeLeft.isComplete} />
                  </div>
                  <span className="font-mono text-[6px] xs:text-[7px] md:text-[9px] text-rust/80 tracking-[0.04em] mt-0.5 font-medium whitespace-nowrap text-center">
                    MILLISECONDS
                  </span>
                </div>

              </div>
            </div>

            {/* The Waveform Resonance */}
            <div className="relative p-4 bg-basalt-950/30 border border-basalt-800 rounded-lg basalt-well overflow-hidden h-[80px] flex flex-col justify-between">
              <div className="flex justify-between items-center z-10">
                <span className="font-mono text-[9px] text-sand/80 tracking-widest uppercase">TEMPORAL RESONANCE</span>
                <span className="font-mono text-[9px] text-rust/80 tracking-widest uppercase">
                  {timeLeft.isComplete ? "CONVERGED" : "ACTIVE ALIGNMENT"}
                </span>
              </div>
              
              {/* Interactive Vector Oscilloscope */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
                  <line x1="0" y1="40" x2="400" y2="40" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                  
                  {/* Wave 1 (Ivory Primary) */}
                  <path
                    ref={wavePathRef1}
                    d="M 0 40 L 400 40"
                    fill="none"
                    stroke={timeLeft.isComplete ? "oklch(0.68 0.13 130)" : "oklch(0.88 0.04 90)"}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    className="transition-colors duration-1000"
                  />

                  {/* Wave 2 (Green Secondary Harmonic) */}
                  <path
                    ref={wavePathRef2}
                    d="M 0 40 L 400 40"
                    fill="none"
                    stroke={timeLeft.isComplete ? "rgba(108,173,108,0.25)" : "#43A047"}
                    strokeWidth="0.8"
                    strokeDasharray="2 2"
                    className="transition-colors duration-1000"
                  />
                </svg>
              </div>

              <div className="flex justify-between items-center z-10 font-mono text-[8px] text-sand/40">
                <div>SYSTEM STATUS: ONLINE</div>
                <div>SAMPLING RATE: 1000 Hz</div>
              </div>
            </div>

          </div>

          {/* Section B: Alignment clock dial */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-basalt-800 pt-6 lg:pt-0 lg:pl-8">
            
            {/* Heavy-milled Industrial Bezel Housing */}
            <div className="relative p-1 xs:p-1.5 rounded-full bg-gradient-to-br from-[#2a2c35] via-[#111215] to-[#060709] shadow-[0_12px_32px_rgba(0,0,0,0.85),_inset_0_1.5px_2px_rgba(255,255,255,0.12),_inset_0_-1.5px_2px_rgba(0,0,0,0.9)] border border-basalt-950 flex items-center justify-center w-36 h-36 xs:w-40 xs:h-40 md:w-48 md:h-48">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
                
                {/* Outer alignment ticks with realistic machined plate background */}
                <svg viewBox="0 0 200 200" className="absolute w-full h-full text-basalt-800 select-none">
                  <defs>
                    <radialGradient id="metalPlate" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0a0b0d" />
                      <stop offset="65%" stopColor="#0e1014" />
                      <stop offset="92%" stopColor="#12151a" />
                      <stop offset="100%" stopColor="#050608" />
                    </radialGradient>
                    <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#43A047" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                  {/* Machined Metal Backplate */}
                  <circle cx="100" cy="100" r="100" fill="url(#metalPlate)" />
                  
                  {/* Concentric Machined Calibrated Grooves */}
                  <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
                  <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="0.75" />
                  <circle cx="100" cy="100" r="68" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="0.5" strokeDasharray="3 1" />
                  <circle cx="100" cy="100" r="48" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
                  <circle cx="100" cy="100" r="32" fill="none" stroke="rgba(255,255,255,0.01)" strokeWidth="0.5" />
                  
                  {/* Visual optical tick marks */}
                  <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 8" />
                  <circle cx="100" cy="100" r="87" fill="url(#ringGlow)" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 20" />
                </svg>

                {/* Ring 1: Solar Year Alignment */}
                <div className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-1000">
                  <svg ref={ringRef1} viewBox="0 0 100 100" className="w-full h-full text-[#c5a880] drop-shadow-[0_2.5px_4px_rgba(0,0,0,0.85)]" style={{ transformOrigin: "center" }}>
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1 10" opacity="0.4" />
                    <path d="M 50 50 L 50 10" stroke="#c5a880" strokeWidth="1" strokeLinecap="round" />
                    <polygon points="50,7 48,12 52,12" fill="#c5a880" />
                    <line x1="50" y1="50" x2="50" y2="62" stroke="#c5a880" strokeWidth="0.8" />
                    <circle cx="50" cy="62" r="2" fill="#c5a880" opacity="0.8" />
                  </svg>
                </div>

                {/* Ring 2: Diurnal Frame */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <svg ref={ringRef2} viewBox="0 0 100 100" className="w-full h-full text-[#8E9099] drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)]" style={{ transformOrigin: "center" }}>
                    <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="8 4 1 4" opacity="0.3" />
                    <path d="M 50 50 L 50 16" stroke="#8E9099" strokeWidth="0.8" strokeLinecap="round" />
                    <polygon points="50,14 48.5,18 51.5,18" fill="#8E9099" />
                  </svg>
                </div>

                {/* Ring 3: Inner Green Pointer */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                  <svg ref={ringRef3} viewBox="0 0 100 100" className="w-full h-full text-[#43A047] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]" style={{ transformOrigin: "center" }}>
                    <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.2" />
                    <line x1="50" y1="50" x2="50" y2="24" stroke="#43A047" strokeWidth="0.6" strokeLinecap="round" />
                    <circle cx="50" cy="24" r="1" fill="#43A047" />
                  </svg>
                </div>

                {/* Sapphire Domed Glass Glare overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.015] to-white/[0.08] pointer-events-none z-10" />
                <div className="absolute inset-[2px] rounded-full border border-white/[0.04] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-10" />

                {/* Hub Pin Assembly */}
                <div className="absolute w-7 h-7 rounded-full bg-gradient-to-br from-basalt-600 via-basalt-800 to-basalt-950 border border-basalt-700/60 shadow-[0_3px_6px_rgba(0,0,0,0.9),_inset_0.5px_0.5px_1px_rgba(255,255,255,0.15)] flex items-center justify-center pointer-events-none z-20">
                  <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#c5a880] to-[#806c50] shadow-[0_1px_2px_rgba(0,0,0,0.6)] flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${
                      timeLeft.isComplete ? "bg-moss shadow-[0_0_4px_#6cad6c]" : "bg-[#43A047] shadow-[0_0_4px_rgba(67,160,71,0.8)]"
                    }`} />
                  </div>
                </div>

              </div>
            </div>

            {/* Alignment Label */}
            <div className="mt-4 flex flex-col items-center">
              <span className="font-mono text-[9px] text-sand/60 tracking-widest uppercase">CONVERGENCE ALIGNMENT</span>
            </div>
          </div>

        </div>

        {/* Console Footnotes */}
        <div className="flex justify-start items-center border-t border-basalt-800 pt-4 font-mono text-[9px] md:text-[10px] text-sand/60">
          <div className="flex items-center gap-1.5">
            {timeLeft.isComplete ? (
              <CheckCircle2 size={12} className="text-moss" />
            ) : (
              <ShieldAlert size={12} className="text-rust" />
            )}
            <span>
              {timeLeft.isComplete 
                ? "ALIGNMENT COMPLETE: HORIZON SYNCHRONIZED" 
                : "SYNCHRONIZATION ACTIVE"}
            </span>
          </div>
        </div>

      </div>

      {/* Aesthetic Architectural Frame Accents (Corner Brackets) */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-basalt-800/60 pointer-events-none" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-basalt-800/60 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-basalt-800/60 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-basalt-800/60 pointer-events-none" />
    </div>
  );
}
