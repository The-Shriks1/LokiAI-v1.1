/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, CheckCircle2, Loader2, Radio, ArrowUp, Circle, Play, ChevronDown, ChevronRight, Terminal, MessageSquare, Folder, GitBranch, ListTodo, Plus, User, Settings } from 'lucide-react';
import { ChapterID, ModelCandidate } from '../types';
import { QrGlyph } from './QrGlyph';

interface LaptopFrameProps {
  activeChapter: ChapterID;
  isPaired: boolean;
  isScanned: boolean;
  userQuery: string;
  selectedModel: ModelCandidate | null;
  deploymentProgress: number;
  deploymentStepIndex: number;
}

const PREVIEW_MODELS = [
  { id: 'yolo-next', name: 'MobileNetV4-TFLite', size: '45MB', detail: '~20fps, detects 1000 object types' },
  { id: 'mobilenet-ssd', name: 'YOLOv8n-TFLite', size: '27MB', detail: 'faster, slightly less accurate' },
  { id: 'resnet-det', name: 'EfficientDet-Lite0', size: '55MB', detail: 'most accurate of the three' },
];

const KEYBOARD_ROWS = [
  ['esc', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'del'],
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'back'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
  ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
  ['ctrl', 'opt', 'cmd', 'space', 'cmd', 'opt', '◄', '▼', '►']
];

const getKeyWidthClass = (key: string): string => {
  if (key === 'space') return 'flex-[5]';
  if (key === 'back' || key === 'tab' || key === 'caps' || key === 'enter') return 'flex-[1.5]';
  if (key === 'shift') return 'flex-[1.8]';
  if (key === 'ctrl' || key === 'opt' || key === 'cmd') return 'flex-[1.2]';
  return 'flex-[1]';
};

export const LaptopFrame: React.FC<LaptopFrameProps> = ({
  activeChapter,
  isPaired,
  isScanned,
  userQuery,
  selectedModel,
  deploymentProgress,
  deploymentStepIndex,
}) => {
  const isIdleDashboard = activeChapter === 'hero' || activeChapter === 'independence' || activeChapter === 'download';
  const isDone = activeChapter === 'independence' || activeChapter === 'download';
  const topModelName = (selectedModel?.name || PREVIEW_MODELS[0].name).replace('-TFLite', '');

  const commandPlaceholder =
    activeChapter === 'hero' ? 'Tell EdgeMind what you want your device to do...'
    : activeChapter === 'pairing' ? 'Awaiting handshake scanner auth...'
    : activeChapter === 'intent' ? 'Compose model request intent...'
    : activeChapter === 'selection' ? 'Ranking filtered neural candidates...'
    : activeChapter === 'deployment' ? 'Syncing binaries — keep tab open...'
    : 'Binary deployed successfully. Local runtime online.';

  // Terminal deployment logs
  const deployLog = [
    'EdgeMind Deployment Agent v1.0',
    'Connecting to device via ADB...',
    'Device found: Redmi Note 8 Pro (serial: R58MA2)',
    'RAM: 5636MB | CPU: arm64-v8a | Android: 11',
    `Pushing model: ${(selectedModel?.name || PREVIEW_MODELS[0].name).toLowerCase().replace('-tflite', '.tflite')} (${selectedModel?.size || PREVIEW_MODELS[0].size})`,
    '100% [====================]',
    'Model verified. SHA256: a1b2c3...',
    'APK installed: io.edgemind',
    'Deployment complete.',
  ];
  const visibleLogLines = Math.min(deployLog.length, 2 + deploymentStepIndex);

  // Heatmap helper for Overview screen
  const heatmapCells = Array.from({ length: 60 }, (_, i) => {
    const active = i % 7 === 0 || i % 11 === 0 || i % 19 === 0;
    const color = active ? (i % 2 === 0 ? 'bg-[#84cc16]' : 'bg-[#84cc16]/50') : 'bg-neutral-900/60';
    return color;
  });

  return (
    <div className="relative w-[360px] sm:w-[420px] lg:w-[380px] xl:w-[460px] select-none">
      {/* Ground projection shadow */}
      <div
        className="absolute bottom-[-15px] left-[-8%] right-[-8%] h-7 bg-black/75 rounded-full filter blur-[10px] pointer-events-none z-0"
        style={{
          transform: 'rotateX(80deg) translateY(3px)',
          opacity: 0.75,
        }}
      />

      {/* 3D Viewport container */}
      <div
        className="laptop-viewport relative w-full"
        style={{
          aspectRatio: '1.38 / 1',
        }}
      >
        <div
          className="laptop-3d w-full h-full"
          style={{
            transform: 'rotateX(9.5deg) rotateY(0deg) rotateZ(0deg)',
          }}
        >
          
          {/* 1. SCREEN LID */}
          <div
            className="laptop-lid absolute left-[3.5%] right-[3.5%] rounded-t-lg bg-[#141414] border border-[#2d2d2d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
            style={{
              height: '80%',
              bottom: '20%',
              transform: 'rotateX(-6deg)', // Facing viewer directly
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Screen Border Bezel */}
            <div className="w-full h-full p-[6px] flex flex-col justify-between relative bg-[#0f0f0f] rounded-t-lg">
              
              {/* Webcam status LED */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-neutral-950 border border-neutral-900/60 z-50 flex items-center justify-center">
                <div className="w-0.5 h-0.5 rounded-full bg-emerald-500/60" />
              </div>

              {/* Screen gloss reflection overlay */}
              <div className="absolute inset-[6px] rounded-sm screen-shine pointer-events-none z-50 opacity-15 mix-blend-overlay" />

              {/* Display Inner Content */}
              <div className="w-full h-full bg-[#050506] rounded-sm overflow-hidden flex flex-col font-sans relative border border-neutral-950">
                <div className="absolute inset-0 scanlines opacity-[0.08] pointer-events-none z-40" />

                {/* MAIN INTERACTIVE IDE LAYOUT (Screenshot 1) */}
                <div className="flex-1 flex overflow-hidden">
                  
                  {/* Main core IDE container (rest of screen) */}
                  <div className="flex-1 flex flex-col overflow-hidden bg-[#050506]">
                    
                    {/* Header bar tab */}
                    <div className="h-6.5 bg-[#09090a] border-b border-neutral-900/80 flex items-center justify-between px-2 text-[7.5px] text-neutral-500 font-mono shrink-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[#84cc16] font-bold font-sans">*</span>
                        <span>West Gate / fwtwf</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[7.5px]">
                        <span>Workspace - 6 panels</span>
                      </div>
                    </div>

                    {/* Viewports */}
                    <div className="flex-1 flex overflow-hidden relative">
                      <AnimatePresence mode="wait">
                        {isIdleDashboard ? (
                          /* A. IDLE DASHBOARD OVERVIEW */
                          <motion.div
                            key="overview-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-[#050506]"
                          >
                            <div className="flex items-center space-x-1.5 mb-4">
                              <span className="text-[#84cc16] font-bold font-sans">*</span>
                              <span className="text-[10px] text-neutral-400 font-mono">What's up next, Shrusti?</span>
                            </div>

                            <div className="bg-[#09090a] border border-neutral-900 rounded p-3 w-[70%] space-y-3">
                              <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                                <span className="text-[7px] text-neutral-500 font-mono">Overview / Models</span>
                                <div className="flex space-x-2 text-[7px] font-mono">
                                  <span className="text-neutral-600">All</span>
                                  <span className="text-neutral-400">30d</span>
                                  <span className="text-neutral-600">7d</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-4 gap-2 text-center text-[6px] font-mono">
                                <div><p className="text-neutral-600">Devices</p><p className="text-neutral-300">0</p></div>
                                <div><p className="text-neutral-600">Deployments</p><p className="text-neutral-300">0</p></div>
                                <div><p className="text-neutral-600">Models Ready</p><p className="text-neutral-300">3</p></div>
                                <div><p className="text-neutral-600">Online Now</p><p className="text-neutral-300">0</p></div>
                                <div className="mt-1"><p className="text-neutral-600">Last Deploy</p><p className="text-neutral-500">--</p></div>
                                <div className="mt-1"><p className="text-neutral-600">Top Model</p><p className="text-neutral-500">--</p></div>
                                <div className="mt-1"><p className="text-neutral-600">Avg Latency</p><p className="text-neutral-500">--</p></div>
                                <div className="mt-1"><p className="text-neutral-600">Active Task</p><p className="text-neutral-500">--</p></div>
                              </div>

                              <div className="pt-2 border-t border-neutral-900">
                                <p className="text-center text-[5px] text-neutral-600 font-mono">Your device is ready to connect, no routing built</p>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          /* B. 6-PANEL WORKSPACE ACTIVE VIEW */
                          <motion.div
                            key="workspace-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex overflow-hidden divide-x divide-neutral-900/80"
                          >
                            {/* Panel 1: Chat/Assistant (Left Column - 32% width) */}
                            <div className="w-[32%] flex flex-col justify-between p-2 overflow-hidden">
                              <div className="space-y-2 overflow-y-auto">
                                <div className="text-[6.5px] font-mono text-neutral-600 uppercase border-b border-neutral-900 pb-0.5 flex justify-between items-center">
                                  <span>West Gate / fwtwf</span>
                                </div>
                                
                                <div className="text-[8px] leading-relaxed text-neutral-400 space-y-1.5">
                                  <p className="text-neutral-500 font-bold font-mono text-[7px]">&gt; YOU</p>
                                  <p className="bg-neutral-950/40 p-1 rounded font-mono text-[7.5px] text-neutral-300 truncate">
                                    {activeChapter === 'hero' ? '...' : (userQuery || 'I want real-time object detection')}
                                  </p>

                                  <p className="text-[#84cc16] font-bold font-mono text-[7.5px]">* ASSISTANT</p>
                                  {activeChapter === 'hero' ? (
                                    <p>LokiAI Node daemon active. Waiting for device pairing...</p>
                                  ) : activeChapter === 'pairing' ? (
                                    <p>Establish secure device connection. Scan the QR link shown in Panel 5.</p>
                                  ) : (
                                    <div className="space-y-1 font-sans">
                                      <p>Found 3 models that fit your Redmi Note 8 Pro (ARM64, 5GB RAM):</p>
                                      <ul className="space-y-0.5 font-mono text-[7.5px] text-neutral-400">
                                        <li className={selectedModel?.id === 'yolo-next' || !selectedModel ? "text-[#84cc16] font-bold" : "text-neutral-600"}>• MobileNetV4 (45MB)</li>
                                        <li className={selectedModel?.id === 'mobilenet-ssd' ? "text-[#84cc16] font-bold" : "text-neutral-600"}>• YOLOv8n (27MB)</li>
                                        <li className={selectedModel?.id === 'resnet-det' ? "text-[#84cc16] font-bold" : "text-neutral-600"}>• EfficientDet (55MB)</li>
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="bg-[#09090a] border border-neutral-900 rounded p-1 flex items-center justify-between text-[7px] text-neutral-600">
                                <span className="truncate">Ask EdgeMind anything...</span>
                                <ArrowUp className="w-2.5 h-2.5 text-neutral-700" />
                              </div>
                            </div>

                            {/* Panel 2 & 3: Middle Column (38% width) - Terminal & Tasks */}
                            <div className="w-[38%] flex flex-col divide-y divide-neutral-900/80 overflow-hidden">
                              {/* Panel 2: Terminal (60% height) */}
                              <div className="h-[60%] p-2 flex flex-col space-y-1 overflow-hidden bg-[#070708]">
                                <p className="text-[6.5px] font-mono text-neutral-600 uppercase border-b border-neutral-900 pb-0.5">Terminal</p>
                                <div className="flex-1 overflow-hidden space-y-0.5 font-mono text-[7.5px] text-neutral-400 leading-snug">
                                  {activeChapter === 'hero' ? (
                                    <>
                                      <p className="text-neutral-600">&gt; lokiai-daemon start</p>
                                      <p className="text-[#84cc16]">Node listening on port 4556...</p>
                                    </>
                                  ) : activeChapter === 'pairing' ? (
                                    <>
                                      <p className="text-neutral-600">&gt; adb connect</p>
                                      <p className="text-[#84cc16]">● awaiting scanning handshake...</p>
                                    </>
                                  ) : activeChapter === 'intent' ? (
                                    <>
                                      <p className="text-neutral-600">&gt; lokiai-search</p>
                                      <p className="text-neutral-500">querying Hugging Face registry...</p>
                                    </>
                                  ) : activeChapter === 'selection' ? (
                                    <>
                                      <p className="text-neutral-600">&gt; lokiai-match</p>
                                      <p className="text-[#84cc16]">MobileNetV4 calibration ready.</p>
                                    </>
                                  ) : (
                                    deployLog.slice(0, visibleLogLines).map((line, i) => (
                                      <p key={i} className="truncate">
                                        <span className="text-neutral-700">&gt;</span> {line}
                                      </p>
                                    ))
                                  )}
                                </div>
                              </div>
                              {/* Panel 3: Background Tasks (40% height) */}
                              <div className="h-[40%] p-2 flex flex-col space-y-1 overflow-hidden bg-[#09090a]/40">
                                <p className="text-[6.5px] font-mono text-neutral-600 uppercase border-b border-neutral-900 pb-0.5">Background Tasks</p>
                                <div className="flex-1 space-y-0.5 font-mono text-[7px] text-neutral-500">
                                  <div className="flex justify-between items-center">
                                    <span className={activeChapter === 'hero' ? "text-neutral-600" : "text-[#84cc16]"}>● ADB Connection</span>
                                    <span className="text-neutral-600">{activeChapter === 'hero' ? 'queued' : 'running'}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className={activeChapter === 'deployment' ? "text-amber-500" : "text-neutral-600"}>○ Model Download</span>
                                    <span className="text-neutral-600">{activeChapter === 'deployment' ? `${Math.round(deploymentProgress)}%` : 'queued'}</span>
                                  </div>
                                  <p className="text-neutral-600">{activeChapter === 'hero' ? '○ Device Scan' : '✓ Device Scan (done)'}</p>
                                </div>
                              </div>
                            </div>

                            {/* Panels 4, 5, 6 & 7: Right Column (30% width) - Files, Preview, Changes & Plan */}
                            <div className="w-[30%] flex flex-col divide-y divide-neutral-900/80 overflow-hidden">
                              {/* Panel 4: Files (30% height) */}
                              <div className="h-[30%] p-2 flex flex-col space-y-0.5 overflow-hidden">
                                <p className="text-[6.5px] font-mono text-neutral-600 uppercase border-b border-neutral-900 pb-0.5">Files</p>
                                <div className="flex-1 overflow-y-auto space-y-0.5 font-mono text-[6.5px] text-neutral-500">
                                  <p className={activeChapter === 'hero' ? "text-neutral-500" : "text-[#84cc16]"}>📁 .edgemind</p>
                                  <p>📁 model</p>
                                  <p>📁 deployments</p>
                                </div>
                              </div>
                              {/* Panel 5: Preview / QR (30% height) */}
                              <div className="h-[30%] p-2 flex flex-col space-y-0.5 overflow-hidden bg-[#070708]">
                                <p className="text-[6.5px] font-mono text-neutral-600 uppercase border-b border-neutral-900 pb-0.5">Preview</p>
                                <div className="flex-1 flex items-center justify-center overflow-hidden">
                                  {activeChapter === 'hero' ? (
                                    <span className="text-[6.5px] text-neutral-600 font-mono">Waiting for stream...</span>
                                  ) : activeChapter === 'pairing' ? (
                                    <div className="p-0.5 bg-[#09090a] border border-neutral-900 rounded relative shrink-0">
                                      <QrGlyph size={28} className="text-brand-text" seed={4} />
                                    </div>
                                  ) : (
                                    <span className="text-[6.5px] text-neutral-600 font-mono italic animate-pulse">Loading preview...</span>
                                  )}
                                </div>
                              </div>
                              {/* Panel 6 & 7: Changes & Plan (40% height) side-by-side */}
                              <div className="h-[40%] flex divide-x divide-neutral-900/80 shrink-0">
                                <div className="w-1/2 p-2 flex flex-col space-y-0.5 overflow-hidden">
                                  <p className="text-[6px] font-mono text-neutral-600 uppercase border-b border-neutral-900 pb-0.5">Changes</p>
                                  {activeChapter === 'hero' ? (
                                    <p className="text-[5.5px] font-mono text-neutral-500 italic">No staged changes</p>
                                  ) : (
                                    <>
                                      <p className="text-[5.5px] font-mono text-neutral-500 truncate">M src/deploy.py</p>
                                      <p className="text-[5.5px] font-mono text-neutral-500 truncate">M main.py</p>
                                    </>
                                  )}
                                </div>
                                <div className="w-1/2 p-2 flex flex-col space-y-0.5 overflow-hidden">
                                  <p className="text-[6px] font-mono text-neutral-600 uppercase border-b border-neutral-900 pb-0.5">Plan</p>
                                  <div className="flex-1 overflow-y-auto space-y-0.5 font-mono text-[5.5px] text-neutral-500">
                                    <p className={activeChapter === 'hero' ? "text-neutral-700" : "text-[#84cc16]"}>{activeChapter === 'hero' ? '○ read-device' : '✓ read-device'}</p>
                                    <p className={activeChapter === 'hero' ? "text-neutral-700" : "text-[#84cc16]"}>{activeChapter === 'hero' ? '○ register' : '✓ register'}</p>
                                    <p className={activeChapter === 'selection' || activeChapter === 'deployment' ? "text-[#84cc16] font-bold" : "text-neutral-700"}>○ download</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>
                </div>

                {/* Dashboard Command bar */}
                <div className="shrink-0 border-t border-[#18181b] bg-[#0c0c0d] px-3 py-1.5 flex items-center justify-between gap-2 font-mono">
                  <span className="text-[7.5px] sm:text-[8px] text-neutral-500 truncate flex-1 uppercase tracking-wider">{commandPlaceholder}</span>
                  <span className={`shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center ${isPaired || activeChapter === 'hero' ? 'bg-[#84cc16]/80' : 'bg-neutral-900'}`}>
                    <ArrowUp className="w-2 h-2 text-[#F4F0E8]" />
                  </span>
                </div>

              </div>
            </div>
          </div>

          {/* HINGE CYLINDER */}
          <div
            className="absolute left-[7%] right-[7%] h-2 rounded-full bg-gradient-to-r from-[#181818] via-[#383838] to-[#181818] border border-[#0d0d0d] shadow-[0_1px_1.5px_rgba(0,0,0,0.6)] z-30"
            style={{
              top: '79%',
              transform: 'translateZ(1px)',
            }}
          />

          {/* 2. KEYBOARD BASE */}
          <div
            className="laptop-base absolute left-0 right-0 bg-gradient-to-b from-[#222222] to-[#111111] border-[1.5px] border-b-[5px] border-[#2a2a2d] rounded-b-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_12px_24px_rgba(0,0,0,0.9)]"
            style={{
              height: '75%',
              top: '80%',
              transform: 'rotateX(75deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Keyboard Well Inset */}
            <div className="bg-[#0c0c0c] border border-neutral-900 rounded-md p-1 mt-1 mx-2 flex flex-col gap-0.5 shadow-[inset_0_1.5px_2.5px_rgba(0,0,0,0.9)]">
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} className="keyboard-row">
                  {row.map((key, kIdx) => (
                    <span
                      key={kIdx}
                      className={`key-cap select-none h-1.5 sm:h-2 ${getKeyWidthClass(key)}`}
                    >
                      {key !== 'space' && key !== 'back' && key !== 'caps' && key !== 'shift' && key !== 'enter' && key !== 'tab' && key !== 'ctrl' && key !== 'opt' && key !== 'cmd' ? key : ''}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {/* Trackpad */}
            <div className="bg-gradient-to-b from-[#161616] to-[#0f0f0f] border border-neutral-800/80 rounded shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.85)] mt-1.5 mx-auto w-[65px] h-[30px] transition-colors hover:border-neutral-700" />
            
            {/* LED Status light */}
            <div
              className={`absolute bottom-1 right-5 w-1 h-1 rounded-full transition-colors duration-500 ${isPaired ? 'bg-[#84cc16] shadow-[0_0_4px_rgba(132,204,22,0.8)]' : 'bg-neutral-600'}`}
            />
          </div>

        </div>
      </div>
    </div>
  );
};
