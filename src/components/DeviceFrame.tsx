/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardDrive, Shield, Layers, RefreshCw, Smartphone,
  Terminal, Search, Eye, MessageSquare, Mic, Play, Pause, RotateCw,
  ScanQrCode, Wifi, CheckCircle2, ChevronRight
} from 'lucide-react';
import { ChapterID, ModelCandidate } from '../types';

interface DeviceFrameProps {
  isPaired: boolean;
  isScanned: boolean;
  isDeviceActive: boolean;
  activeChapter: ChapterID;
  selectedModel: ModelCandidate | null;
  deploymentProgress: number;
  deploymentStepIndex: number;
  demoType: 'vision' | 'language' | 'audio';
  setDemoType: (type: 'vision' | 'language' | 'audio') => void;
  onDeviceWakeup?: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  isPaired,
  isScanned,
  isDeviceActive,
  activeChapter,
  selectedModel,
  deploymentProgress,
  deploymentStepIndex,
  demoType,
  setDemoType,
  onDeviceWakeup,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'model', text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isVisionPlaying, setIsVisionPlaying] = useState(true);
  const [audioWaves, setAudioWaves] = useState<number[]>(new Array(16).fill(1).map(() => Math.random() * 20 + 5));
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Object detection simulated tracker
  const [detectedObjects, setDetectedObjects] = useState<{ label: string; confidence: number; x: number; y: number; w: number; h: number }[]>([]);

  // Telemetry loop for vision bounding boxes
  useEffect(() => {
    if (activeChapter === 'independence' && demoType === 'vision' && isVisionPlaying) {
      const interval = setInterval(() => {
        const potentialObjects = [
          { label: 'Autonomous Vehicle', confidence: 98.4, x: 10, y: 30, w: 50, h: 40 },
          { label: 'Pedestrian [Priority]', confidence: 99.1, x: 65, y: 45, w: 15, h: 35 },
          { label: 'Traffic Signal (Green)', confidence: 97.5, x: 45, y: 15, w: 10, h: 12 },
          { label: 'Bicycle Rider', confidence: 94.2, x: 25, y: 55, w: 20, h: 25 },
          { label: 'Obstacle Detection', confidence: 95.8, x: 5, y: 75, w: 90, h: 15 }
        ];
        // Select 2-3 random objects
        const count = Math.floor(Math.random() * 2) + 2;
        const shuffled = [...potentialObjects].sort(() => 0.5 - Math.random());
        setDetectedObjects(shuffled.slice(0, count));
      }, 900);
      return () => clearInterval(interval);
    }
  }, [activeChapter, demoType, isVisionPlaying]);

  // Audio wave loops
  useEffect(() => {
    if (activeChapter === 'independence' && demoType === 'audio') {
      const interval = setInterval(() => {
        setAudioWaves(new Array(16).fill(1).map(() => Math.sin(Date.now() / 200) * 15 + Math.random() * 10 + 15));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [activeChapter, demoType]);

  // BIOS-style waking terminal logs
  useEffect(() => {
    if (isDeviceActive && terminalLogs.length === 0) {
      const logs = [
        'USB or local WiFi detected',
        'Dashboard connection ready',
        'Waiting for phone handshake...',
        'Handshake confirmed over USB/WiFi',
        'Specs synced to LokiAI backend',
        'Ready — waiting for your request'
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < logs.length) {
          setTerminalLogs((prev) => [...prev, logs[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    } else if (!isDeviceActive) {
      setTerminalLogs([]);
    }
  }, [isDeviceActive]);

  // On-device Chat simulator
  useEffect(() => {
    if (chatMessages.length === 0) {
      const modelLabel = selectedModel?.name.replace('-TFLite', '') || 'MobileNetV4';
      setChatMessages([
        { sender: 'user', text: 'Hello! What can you tell me about the model running on this phone?' },
        { sender: 'model', text: `I'm ${modelLabel}, deployed straight from Hugging Face to fit this phone's 4GB RAM. Everything I run stays on-device — no requests leave the phone.` }
      ]);
    }
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedModel]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let reply = "Processed entirely on-device, using only what's stored in phone memory. Nothing was sent over the network to answer that.";
      if (userMsg.toLowerCase().includes('hello') || userMsg.toLowerCase().includes('hey')) {
        reply = "Hey — I'm running locally on this phone right now, fully offline. No WiFi, no laptop, no cloud calls.";
      } else if (userMsg.toLowerCase().includes('speed') || userMsg.toLowerCase().includes('fast')) {
        reply = "Around 20 frames per second for vision tasks, or a few hundred milliseconds per reply for chat — both measured on this exact hardware, not a benchmark device.";
      } else if (userMsg.toLowerCase().includes('data') || userMsg.toLowerCase().includes('privacy')) {
        reply = "Nothing leaves the phone. The model weights, your messages, and the camera feed all stay in local storage and memory.";
      }
      setChatMessages(prev => [...prev, { sender: 'model', text: reply }]);
    }, 400);
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none max-h-full cursor-pointer"
      onMouseEnter={() => {
        setIsHovered(true);
        if (onDeviceWakeup && !isDeviceActive) {
          onDeviceWakeup();
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onDeviceWakeup && !isDeviceActive) {
          onDeviceWakeup();
        }
      }}
    >
      {/* Dynamic Halo Reflector (No colorful glow, dark emerald subtle ambient sheen only) */}
      <div className={`absolute w-[28rem] h-[52rem] rounded-[60px] bg-brand-accent/5 filter blur-[100px] transition-opacity duration-1000 pointer-events-none ${isHovered && isDeviceActive ? 'opacity-100' : 'opacity-30'}`} />

      {/* Outer Phone Case Shell */}
      <div className="relative w-[200px] h-[384px] sm:w-[220px] sm:h-[422px] lg:w-[160px] lg:h-[307px] xl:w-[190px] xl:h-[365px] bg-neutral-900 border-[3px] border-neutral-800 rounded-[22px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col items-center p-1 transition-transform duration-500 ease-out shrink-0">

        {/* Side physical buttons (Tactile protrusions) */}
        <div className="absolute top-24 -right-[5px] w-[2px] h-10 bg-neutral-800 hover:bg-neutral-700 border border-neutral-900 rounded-r transition-colors duration-300" /> {/* Power Button */}
        <div className="absolute top-40 -right-[5px] w-[2px] h-16 bg-neutral-800 hover:bg-neutral-700 border border-neutral-900 rounded-r transition-colors duration-300" /> {/* Volume Rocker */}

        {/* Screen Frame Bezel (Pitch-black inner boundary) */}
        <div className="relative w-full h-full bg-black rounded-[18px] overflow-hidden border border-neutral-950 flex flex-col select-none">

          {/* Android-style single punch-hole front camera, centered top */}
          <div className="absolute top-[7px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-neutral-950 border border-neutral-900/60 z-50" />

          {/* Top status row */}
          <div className="absolute top-3 inset-x-0 h-6 flex justify-between items-center px-4 z-40">
            {/* Soft Breathing Indicator LED */}
            <div className="flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${
                !isDeviceActive
                  ? 'bg-brand-accent animate-pulse-slow'
                  : activeChapter === 'deployment'
                  ? 'bg-brand-text animate-pulse'
                  : activeChapter === 'independence'
                  ? 'bg-brand-accent shadow-[0_0_8px_rgba(31,61,46,0.6)]'
                  : 'bg-neutral-700'
              }`} />
              <span className="text-[9px] font-mono tracking-widest text-neutral-500 font-bold uppercase">
                {activeChapter === 'independence' ? 'LOCAL' : !isDeviceActive ? 'STBY' : 'SYS_UP'}
              </span>
            </div>

            {/* Small Hardware spec tag */}
            <span className="text-[8px] font-mono text-neutral-500 font-medium">LOKI-A9</span>
          </div>

          {/* SCREEN BOUNDARY - Renders specific graphics according to narrative state */}
          <div className="relative w-full h-full flex flex-col justify-between pt-10 pb-4 px-3 font-mono select-none">
            
            {/* Screen static/scanline grid effect */}
            <div className="absolute inset-0 scanlines opacity-[0.14] pointer-events-none z-40 bg-transparent" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black pointer-events-none z-30" />

            {/* SCREEN INNER CONTENT */}
            <AnimatePresence mode="wait">
              {!isDeviceActive ? (
                /* 1. BLACK SLEEP SCREEN WITH SUBTLE TEMPERATURE/BOOT INDICATOR */
                <motion.div 
                  key="locked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <p className="text-[10px] text-neutral-800 font-mono tracking-widest mb-2 uppercase">LokiAI Core Passive</p>
                  <div className="w-8 h-8 rounded-full border border-neutral-900 flex items-center justify-center animate-pulse duration-[3000ms]">
                    <div className="w-3 h-3 rounded-full bg-brand-accent/40" />
                  </div>
                  <p className="text-[9px] text-neutral-600 font-mono tracking-wider mt-4">WAVE MOUSE TO ENGAGE</p>
                </motion.div>
              ) : (
                /* 2. SYSTEM AWAKE SCREEN STATE */
                <motion.div 
                  key="awake"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full flex flex-col justify-between"
                >
                  
                  {/* Header Bar */}
                  {activeChapter === 'landing' || activeChapter === 'hero' ? (
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2 text-[8px] text-neutral-500 font-sans select-none">
                      <span>9:41 AM</span>
                      <div className="flex items-center space-x-1">
                        <Wifi className="w-2.5 h-2.5 text-neutral-600" />
                        <span>LTE</span>
                        <span className="w-3.5 h-2 border border-neutral-600 rounded-sm p-[1px] flex items-center">
                          <span className="h-full w-3/4 bg-neutral-600 block rounded-[1px]" />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center border-b border-neutral-900 pb-2 text-[8px] text-neutral-500">
                      <span className="flex items-center space-x-1">
                        <Terminal className="w-2.5 h-2.5 text-neutral-500" />
                        <span>SYS_LOKI_B14</span>
                      </span>
                      <span className="flex items-center space-x-1 font-bold text-neutral-400">
                        <Wifi className="w-2.5 h-2.5 text-neutral-500" />
                        <span>LINK: {isPaired ? 'PAIRED' : 'IDLE'}</span>
                      </span>
                    </div>
                  )}

                  {/* Main screen layout determined by chapter */}
                  <div className="flex-1 py-3 flex flex-col overflow-hidden">
                    {(activeChapter === 'landing' || activeChapter === 'hero') && (
                      <div className="flex-1 flex flex-col justify-between items-center text-center py-6 font-sans select-none">
                        <div className="space-y-0.5">
                          <p className="text-2xl font-light tracking-tight text-neutral-100">09:41</p>
                          <p className="text-[7.5px] text-neutral-500 font-medium uppercase tracking-wider">Monday, June 29</p>
                        </div>

                        <div className="w-10 h-10 rounded-full border border-neutral-800/80 bg-neutral-900/30 flex items-center justify-center backdrop-blur-sm relative">
                          <Smartphone className="w-5 h-5 text-neutral-500" />
                          <div className="absolute inset-0 rounded-full border border-brand-accent/20 animate-pulse" />
                        </div>

                        <div className="space-y-0.5">
                          <p className="text-[8px] text-neutral-400 font-mono tracking-widest uppercase">DEVICE LOCKED</p>
                          <p className="text-[7px] text-neutral-600">Scan QR Code to Pair</p>
                        </div>
                      </div>
                    )}

                    {activeChapter === 'pairing' && !isScanned && (
                      <div className="flex flex-col h-full justify-between">
                        <div className="text-[9px] text-brand-accent border-b border-brand-accent/20 pb-1 flex items-center space-x-1 mb-2">
                          <ScanQrCode className="w-3 h-3" />
                          <span className="font-bold">SCAN QR ON DASHBOARD</span>
                        </div>

                        {/* Viewfinder framing the QR code on the laptop screen */}
                        <div className="flex-1 relative flex items-center justify-center my-1 bg-black/60 rounded border border-neutral-900 p-2 overflow-hidden">
                          <div className="absolute inset-4 border border-brand-accent/50 rounded-md" />
                          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-brand-accent" />
                          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-brand-accent" />
                          <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-brand-accent" />
                          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-brand-accent" />
                          <motion.div
                            className="absolute inset-x-4 h-[1.5px] bg-brand-accent shadow-[0_0_6px_rgba(31,61,46,0.9)]"
                            animate={{ top: ['18%', '82%', '18%'] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <Smartphone className="w-7 h-7 text-neutral-700" />
                        </div>

                        <div className="p-1 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between text-[8px] text-neutral-400">
                          <span className="text-brand-accent font-bold flex items-center space-x-1">
                            <Wifi className="w-2.5 h-2.5" />
                            <span>LOKI_NET_5G</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                            <span>SEARCHING</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {activeChapter === 'pairing' && isScanned && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full items-center justify-center text-center space-y-2">
                        <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                        <p className="text-[9px] text-neutral-200 font-bold uppercase tracking-wider">Connected</p>
                        <p className="text-[8px] text-neutral-500 max-w-[160px] leading-snug">The app will update on its own. Nothing to tap — keep it open.</p>
                      </motion.div>
                    )}

                    {(activeChapter === 'intent' || activeChapter === 'selection') && (
                      <div className="flex flex-col h-full items-center justify-center text-center space-y-2">
                        <Wifi className="w-5 h-5 text-brand-accent animate-pulse" />
                        <p className="text-[9px] text-neutral-200 font-bold uppercase tracking-wider">Connected to dashboard</p>
                        <p className="text-[8px] text-neutral-500 max-w-[160px] leading-snug">
                          The model picker happens on the laptop. The app is just waiting for a deployment.
                        </p>
                      </div>
                    )}

                    {activeChapter === 'deployment' && (
                      <div className="flex flex-col h-full items-center justify-center text-center space-y-3">
                        <p className="text-[9px] text-brand-accent font-bold uppercase tracking-widest">Receiving file</p>
                        <p className="text-[8px] text-neutral-400 font-mono truncate max-w-[170px]">
                          {(selectedModel?.name || 'mobilenetv4-tflite').toLowerCase()}
                        </p>
                        <div className="w-full max-w-[170px] h-1.5 bg-neutral-900 border border-neutral-800 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-brand-accent"
                            style={{ width: `${deploymentProgress}%` }}
                            transition={{ ease: 'easeOut' }}
                          />
                        </div>
                        <p className="text-[8px] text-neutral-500">{Math.round(deploymentProgress)}% · keep the app open</p>
                      </div>
                    )}

                    {(activeChapter === 'independence' || activeChapter === 'download') && (
                      <div className="flex flex-col h-full justify-between">
                        
                        {/* Selector tabs inside screen */}
                        <div className="grid grid-cols-3 gap-0.5 border-b border-neutral-900 pb-1 max-h-[22px]">
                          {(['vision', 'language', 'audio'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={(e) => {
                                e.stopPropagation();
                                setDemoType(type);
                              }}
                              className={`text-[7px] py-[3px] font-bold uppercase rounded border transition-colors ${
                                demoType === type 
                                  ? 'bg-brand-accent/20 border-brand-accent text-brand-text' 
                                  : 'bg-neutral-950 border-transparent text-neutral-500 hover:text-neutral-400'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>

                        {/* Interactive dynamic screen workspace */}
                        <div className="flex-1 bg-black rounded border border-neutral-900 p-1.5 flex flex-col justify-between overflow-hidden my-1.5 relative">
                          
                          {/* autonomous warning */}
                          <div className="absolute top-1 left-1.5 right-1.5 z-40 flex justify-between items-center bg-brand-accent/15 border border-brand-accent/20 px-1 py-0.5 rounded text-[6px]">
                            <span className="text-brand-text flex items-center space-x-1 font-bold">
                              <Shield className="w-1.5 h-1.5 text-brand-accent" />
                              <span>RUNNING OFFLINE</span>
                            </span>
                            <span className="text-brand-accent font-bold">NO NETWORK</span>
                          </div>

                          <div className="flex-1 pt-4 flex flex-col justify-center overflow-hidden">
                            {demoType === 'vision' && (
                              <div className="h-full flex flex-col justify-between pt-1 relative bg-neutral-950/80 rounded overflow-hidden">
                                {/* Frame feed info */}
                                <div className="absolute top-4 inset-x-1.5 flex justify-between items-center text-[6px] text-neutral-400">
                                  <span>FPS: <strong className="text-brand-accent">~20 stable</strong></span>
                                  <span>CPU: <strong className="text-brand-accent">38%</strong></span>
                                </div>

                                {/* Mock dynamic bounding boxes camera simulator content */}
                                <div className="flex-1 border border-neutral-900 relative rounded bg-neutral-950 m-1 flex items-center justify-center overflow-hidden">
                                  {/* Schematic background graphics acting like camera */}
                                  <div className="absolute inset-0 bg-[radial-gradient(#2B2B2B_1px,transparent_1px)] [background-size:10px_10px] opacity-40" />

                                  <AnimatePresence>
                                    {detectedObjects.map((obj, i) => (
                                      <motion.div
                                        key={obj.label + i}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute border border-brand-accent bg-brand-accent/5 flex flex-col justify-between pointer-events-none"
                                        style={{
                                          left: `${obj.x}%`,
                                          top: `${obj.y}%`,
                                          width: `${obj.w}%`,
                                          height: `${obj.h}%`
                                        }}
                                      >
                                        <div className="bg-brand-accent text-brand-text text-[5px] px-0.5 font-bold uppercase truncate scale-90 origin-left">
                                          {obj.label} ({Math.round(obj.confidence)}%)
                                        </div>
                                        <div className="text-[5.5px] text-brand-accent p-0.5 font-mono text-right scale-95 origin-right">
                                          17ms
                                        </div>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                  
                                  <div className="text-[7px] text-neutral-600 font-mono text-center px-2 pointer-events-none">
                                    Camera feed (simulated)
                                  </div>
                                </div>

                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsVisionPlaying(!isVisionPlaying);
                                  }}
                                  className="mx-1 mb-1 py-1 bg-neutral-900 hover:bg-neutral-800 text-[6.5px] rounded border border-neutral-800 text-neutral-400 flex items-center justify-center space-x-1 cursor-pointer font-bold uppercase"
                                >
                                  {isVisionPlaying ? <Pause className="w-1.5 h-1.5" /> : <Play className="w-1.5 h-1.5" />}
                                  <span>{isVisionPlaying ? 'Pause Intake Feed' : 'Start Intake Feed'}</span>
                                </button>
                              </div>
                            )}

                            {demoType === 'language' && (
                              <div className="h-full flex flex-col justify-between pt-1 relative rounded overflow-hidden font-sans">
                                {/* Chat header — camera / model picker / mic, matching the real app chrome */}
                                <div className="flex items-center justify-between px-1 pb-1.5 mb-1 border-b border-neutral-900/80 shrink-0">
                                  <Eye className="w-2.5 h-2.5 text-neutral-500" />
                                  <span className="text-[6.5px] text-neutral-400 font-bold flex items-center gap-0.5">
                                    {selectedModel?.name.replace('-TFLite', '') || 'MobileNetV4'}
                                    <svg width="6" height="6" viewBox="0 0 10 6" className="fill-neutral-500"><path d="M0 0l5 6 5-6z" /></svg>
                                  </span>
                                  <div className="relative">
                                    <Mic className="w-2.5 h-2.5 text-neutral-500" />
                                    <span className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-red-500" />
                                  </div>
                                </div>

                                {/* Chat feed area — assistant text is bare, user text gets a bubble, like the real app */}
                                <div className="flex-1 overflow-y-auto px-1 py-0.5 space-y-2 max-h-[122px] select-text">
                                  {chatMessages.map((msg, index) => (
                                    <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                      {msg.sender === 'user' ? (
                                        <div className="max-w-[80%] bg-neutral-700/70 text-neutral-100 rounded-xl rounded-tr-sm px-1.5 py-1 text-[7px] leading-tight">
                                          {msg.text}
                                        </div>
                                      ) : (
                                        <p className="max-w-[88%] text-neutral-300 text-[7px] leading-snug">{msg.text}</p>
                                      )}
                                      <span className="text-[5px] text-neutral-600 mt-0.5 px-0.5">9:{(41 + index).toString().padStart(2, '0')} AM</span>
                                    </div>
                                  ))}
                                  <div ref={chatBottomRef} />
                                </div>

                                {/* Chat input box */}
                                <div className="flex items-center gap-1 border-t border-neutral-900/80 pt-1 mt-1 shrink-0">
                                  <input
                                    className="flex-1 bg-neutral-900/70 text-neutral-200 text-[7px] px-1.5 py-1 rounded-full border border-neutral-800 focus:outline-none focus:border-brand-accent font-sans placeholder:text-neutral-600"
                                    type="text"
                                    placeholder="Message Loki…"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.stopPropagation();
                                        handleSendMessage();
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendMessage();
                                    }}
                                    className="shrink-0 w-4 h-4 rounded-full bg-brand-accent flex items-center justify-center"
                                  >
                                    <ChevronRight className="w-2 h-2 text-brand-text -rotate-90" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {demoType === 'audio' && (
                              <div className="h-full flex flex-col justify-between pt-1 relative bg-neutral-950/80 rounded overflow-hidden">
                                <div className="text-[7px] text-neutral-500 text-center uppercase tracking-widest font-mono font-bold pt-2">
                                  Voice-to-Task Pipeline
                                </div>

                                {/* Dynamic waveform bars */}
                                <div className="h-10 flex items-center justify-center space-x-1.5 my-2">
                                  {audioWaves.map((h, i) => (
                                    <motion.span 
                                      key={i}
                                      className="w-1 bg-brand-accent rounded-full"
                                      style={{ height: `${h}px` }}
                                    />
                                  ))}
                                </div>

                                <div className="p-1 rounded bg-black border border-neutral-900 mx-1 mb-1">
                                  <p className="text-[5.5px] text-neutral-500 uppercase tracking-widest font-bold">Transcription Latency: &lt;4ms</p>
                                  <p className="text-[7.5px] text-brand-text leading-tight mt-1">
                                    "Set a reminder for 9am tomorrow..."
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* System stats summary footer */}
                        <div className="border-t border-neutral-900 pt-1 text-[7px] text-neutral-500 flex justify-between">
                          <span>BATTERY INTAKE: -0.2%/hr</span>
                          <span>MEM USAGE: 402 MB</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom speaker grille (no physical port — pairing is wireless) */}
        <div className="relative w-14 h-2.5 bg-neutral-950 rounded-b-xl border-t border-neutral-800 flex justify-center items-center z-50 shrink-0">
          <div className="w-7 h-1 bg-neutral-900 border border-neutral-700/30 rounded" />
        </div>
      </div>

      {/* WiFi link indicator beneath the phone, replacing the old USB cable */}
      <AnimatePresence>
        {isPaired && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center space-x-1.5 mt-3 pointer-events-none shrink-0"
          >
            <Wifi className="w-3 h-3 text-brand-accent" />
            <span className="text-[8px] font-mono font-bold tracking-widest text-brand-accent uppercase">LOKI_NET_5G</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
