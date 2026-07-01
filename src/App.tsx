/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import {
  ChevronRight, ChevronLeft, WifiOff, ShieldAlert, Cpu,
  Terminal, Download, KeyRound, Smartphone, Layers, CheckCircle2, Wifi
} from 'lucide-react';
import { ChapterID, ModelCandidate, DeploymentStep } from './types';
import { DeviceFrame } from './components/DeviceFrame';
import { LaptopFrame } from './components/LaptopFrame';
import { TelemetryLines } from './components/TelemetryLines';
import { ModelSelectionCompare } from './components/ModelSelectionCompare';

// Real Hugging Face models LokiAI would surface for "real-time object detection"
// on a Redmi Note 8 Pro (5GB RAM, ARM64) — matches docs/02_USER_JOURNEY.md
const MODEL_CANDIDATES: ModelCandidate[] = [
  {
    id: 'yolo-next',
    name: 'MobileNetV4-TFLite',
    size: '45 MB',
    speed: 'estimated ~15–20 fps',
    fps: 20,
    compatibility: 'OPTIMAL',
    accuracy: 'Detects 1000 object classes',
    description: 'Best fit for 5GB RAM. Runs comfortably within the safe memory limit and gives smooth real-time detection.'
  },
  {
    id: 'mobilenet-ssd',
    name: 'YOLOv8n-TFLite',
    size: '27 MB',
    speed: 'Faster, less accurate',
    fps: 26,
    compatibility: 'MODERATE',
    accuracy: 'Slightly lower precision',
    description: 'Smaller and quicker to load, but trades off some detection accuracy compared to MobileNetV4.'
  },
  {
    id: 'resnet-det',
    name: 'EfficientDet-Lite0',
    size: '55 MB',
    speed: 'Slower, most accurate',
    fps: 14,
    compatibility: 'LOW',
    accuracy: 'Most accurate of the three',
    description: 'Highest accuracy of the three, but uses more of the device\'s RAM budget and runs noticeably slower.'
  }
];

export default function App() {
  // Navigation & narrative state
  const [activeChapter, setActiveChapter] = useState<ChapterID>('landing');
  const [prevChapter, setPrevChapter] = useState<ChapterID>('landing');
  const [isDeviceActive, setIsDeviceActive] = useState<boolean>(true);
  const [hasWokenUpYet, setHasWokenUpYet] = useState<boolean>(true);
  const [isScanned, setIsScanned] = useState<boolean>(false);

  // Animation Container Refs
  const narrativeRef = React.useRef<HTMLDivElement>(null);
  const deviceContainerRef = React.useRef<HTMLDivElement>(null);

  // Intent query input state
  const [userQuery, setUserQuery] = useState<string>('');
  const [targetQuery, setTargetQuery] = useState<string>('I want real-time object detection');
  const [typingIndex, setTypingIndex] = useState<number>(0);

  // Model Selection
  const [selectedModel, setSelectedModel] = useState<ModelCandidate | null>(null);

  // Deployment Steps & Progress
  const [deploymentProgress, setDeploymentProgress] = useState<number>(0);
  const [deploymentStepIndex, setDeploymentStepIndex] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  // Demonstration state
  const [demoType, setDemoType] = useState<'vision' | 'language' | 'audio'>('vision');

  // Simulate the phone scanning the dashboard's QR code and the WiFi handshake completing
  useEffect(() => {
    if (activeChapter === 'pairing') {
      setIsScanned(false);
      const timer = setTimeout(() => setIsScanned(true), 1600);
      return () => clearTimeout(timer);
    }
  }, [activeChapter]);

  // Trigger typist of query in Chapter 2
  useEffect(() => {
    if (activeChapter === 'intent') {
      setUserQuery('');
      setTypingIndex(0);
    }
  }, [activeChapter]);

  useEffect(() => {
    if (activeChapter === 'intent' && typingIndex < targetQuery.length) {
      const typingTimer = setTimeout(() => {
        setUserQuery((prev) => prev + targetQuery[typingIndex]);
        setTypingIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(typingTimer);
    } else if (activeChapter === 'intent' && typingIndex === targetQuery.length) {
      // Auto-set optimal model on typist complete
      setSelectedModel(MODEL_CANDIDATES[0]);
    }
  }, [activeChapter, typingIndex, targetQuery]);

  // Deployment Progress ticker
  useEffect(() => {
    if (activeChapter === 'deployment' && isDeploying) {
      const timer = setInterval(() => {
        setDeploymentProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsDeploying(false);
            // Wait 1.5s after complete then transition to Chapter 5 (Independence)
            setTimeout(() => {
              handleNextChapter();
            }, 1500);
            return 100;
          }
          const increment = Math.random() * 4 + 1.5;
          const nextProgress = Math.min(prev + increment, 100);
          
          // Compute which step corresponds to the percentage
          const stepIndex = Math.min(Math.floor((nextProgress / 100) * 7), 6);
          setDeploymentStepIndex(stepIndex);
          
          return nextProgress;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [activeChapter, isDeploying]);

  // Handle sequential narrative navigation
  const listChapters: ChapterID[] = ['landing', 'hero', 'pairing', 'intent', 'selection', 'deployment', 'independence', 'download'];
  
  const animateTransition = (direction: 'next' | 'prev', nextChapter: ChapterID) => {
    if (!narrativeRef.current) {
      setPrevChapter(activeChapter);
      setActiveChapter(nextChapter);
      if (nextChapter === 'deployment') {
        setDeploymentProgress(0);
        setDeploymentStepIndex(0);
        setIsDeploying(true);
      }
      return;
    }

    // GSAP Out animation
    gsap.to(narrativeRef.current, {
      opacity: 0,
      y: direction === 'next' ? -25 : 25,
      duration: 0.35,
      ease: 'power2.inOut',
      onComplete: () => {
        setPrevChapter(activeChapter);
        setActiveChapter(nextChapter);

        // Auto start deployment simulation in Chapter 4
        if (nextChapter === 'deployment') {
          setDeploymentProgress(0);
          setDeploymentStepIndex(0);
          setIsDeploying(true);
        }

        // GSAP In animation
        gsap.fromTo(narrativeRef.current,
          { opacity: 0, y: direction === 'next' ? 25 : -25 },
          { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.05 }
        );
      }
    });

    // Device frame continuous nudge simulation
    if (deviceContainerRef.current) {
      gsap.fromTo(deviceContainerRef.current,
        { y: direction === 'next' ? 12 : -12 },
        { y: 0, duration: 0.75, ease: 'power2.out' }
      );
    }
  };

  const handleNextChapter = () => {
    const currentIndex = listChapters.indexOf(activeChapter);
    if (currentIndex < listChapters.length - 1) {
      const next = listChapters[currentIndex + 1];
      animateTransition('next', next);
    }
  };

  const handlePrevChapter = () => {
    const currentIndex = listChapters.indexOf(activeChapter);
    if (currentIndex > 0) {
      const prev = listChapters[currentIndex - 1];
      animateTransition('prev', prev);
    }
  };

  // Immersive continuous narrative scrolling and touch swipe hooks
  useEffect(() => {
    let lastScrollTime = 0;
    const throttleDelay = 800; // prevents rapid jumping between sections

    const handleWheel = (e: WheelEvent) => {
      // Disallow scrolling if in deployment stage
      if (activeChapter === 'deployment') return;

      const now = Date.now();
      if (now - lastScrollTime < throttleDelay) return;

      const deltaX = e.deltaX;
      const deltaY = e.deltaY;
      
      // Support dual-axis wheel gestures (vertical scroll or horizontal trackpad sweeps)
      const isHorizontalScroll = Math.abs(deltaX) > Math.abs(deltaY);
      
      // On mobile/tablet, only horizontal scrolls should navigate chapters. Let vertical scroll the page.
      const isMobileOrTablet = window.innerWidth < 1024;
      if (isMobileOrTablet && !isHorizontalScroll) return;

      const delta = isHorizontalScroll ? deltaX : deltaY;
      
      if (Math.abs(delta) < 15) return; // ignore subtle wiggles

      const currentIndex = listChapters.indexOf(activeChapter);
      if (delta > 0) {
        if (currentIndex < listChapters.length - 1) {
          lastScrollTime = now;
          const next = listChapters[currentIndex + 1];
          animateTransition('next', next);
        }
      } else {
        if (currentIndex > 0) {
          lastScrollTime = now;
          const prev = listChapters[currentIndex - 1];
          animateTransition('prev', prev);
        }
      }
    };

    // Mobile touchswipe configurations supporting both horizontal swipe-left/right and vertical swipe-up/down
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (activeChapter === 'deployment') return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchStartX - touchEndX; // positive means swipe left (scroll forward)
      const deltaY = touchStartY - touchEndY; // positive means swipe up (scroll forward)

      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      if (!isHorizontalSwipe) return; // Allow page to scroll vertically, ignore this touch swipe.

      const delta = deltaX;
      const detectionThreshold = 40;

      if (Math.abs(delta) < detectionThreshold) return;

      const now = Date.now();
      if (now - lastScrollTime < throttleDelay) return;

      const currentIndex = listChapters.indexOf(activeChapter);
      if (delta > 0) {
        if (currentIndex < listChapters.length - 1) {
          lastScrollTime = now;
          const next = listChapters[currentIndex + 1];
          animateTransition('next', next);
        }
      } else {
        if (currentIndex > 0) {
          lastScrollTime = now;
          const prev = listChapters[currentIndex - 1];
          animateTransition('prev', prev);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeChapter, hasWokenUpYet]);

  // Device wake up action on mouse event
  const triggerDeviceActivation = () => {
    if (!isDeviceActive) {
      setIsDeviceActive(true);
      setHasWokenUpYet(true);
    }
  };

  // Chapter content renderer helper
  const renderChapterNarrative = () => {
    switch (activeChapter) {
      case 'landing':
        return (
          <div className="flex flex-col items-start justify-center space-y-4 lg:space-y-6 w-full max-w-5xl mx-auto z-50 text-left py-4 lg:py-12">
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8da090] font-bold uppercase drop-shadow-md">
              LokiAI // Secure Edge Intelligence
            </span>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-brand-text leading-[1.08] drop-shadow-2xl">
              Deploy AI models<br />
              <span className="italic font-light text-neutral-300">directly on your device.</span>
            </h1>

            <p className="text-[14px] sm:text-[15px] leading-relaxed text-neutral-300 font-normal max-w-xl drop-shadow-lg">
              Zero cloud latency. 100% offline autonomy. LokiAI seamlessly brings neural networks from Hugging Face to your mobile hardware.
            </p>

            <div className="pt-2 lg:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleNextChapter}
                className="px-7 py-3 bg-[#1F3D2E] hover:bg-[#2a5c47] text-[#F4F0E8] text-[12px] font-mono font-semibold tracking-widest uppercase transition-colors duration-150 flex items-center justify-center space-x-2 rounded border border-[#2a5c47] cursor-pointer shadow-xl w-full sm:w-auto"
              >
                <span>Start Journey</span>
                <ChevronRight className="w-4 h-4 text-[#F4F0E8]" />
              </button>
              
              <a
                href="https://www.instagram.com/reel/DZuxLsINqJl/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
                target="_blank"
                rel="noreferrer"
                className="px-7 py-3 border border-neutral-600 hover:border-neutral-300 bg-black/40 backdrop-blur-md text-neutral-200 hover:text-white text-[12px] font-mono font-semibold tracking-widest uppercase transition-all duration-150 flex items-center justify-center space-x-2 rounded cursor-pointer shadow-xl w-full sm:w-auto"
              >
                <span>Watch Trailer</span>
              </a>
            </div>
          </div>
        );


      case 'hero':
        return (
          <div className="flex flex-col space-y-4 lg:space-y-6">
            <div className="space-y-1 lg:space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase block">
                LokiAI
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-serif font-normal tracking-tight text-brand-text leading-[1.1]">
                Bring AI models <br />to the edge, <span className="italic font-light text-neutral-400">instantly.</span>
              </h1>
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-neutral-400 font-normal max-w-xl">
              LokiAI allows you to deploy fully local neural networks from Hugging Face directly onto your mobile hardware over USB or WiFi. Zero latency, complete offline autonomy.
            </p>

            <div className="py-0.5">
              <p className="text-[11px] font-mono text-neutral-500 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                <span>Move your cursor or tap to activate the local daemon.</span>
              </p>
            </div>

            {hasWokenUpYet && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-1 w-full sm:w-auto"
              >
                <button
                  onClick={handleNextChapter}
                  className="px-5 py-2.5 bg-[#1F3D2E] hover:bg-[#2a5c47] text-[#F4F0E8] text-xs font-mono font-semibold tracking-wide transition-colors duration-150 flex items-center justify-center space-x-2 rounded border border-[#2a5c47] cursor-pointer w-full sm:w-auto"
                >
                  <span>Pair Device</span>
                  <ChevronRight className="w-4 h-4 text-[#F4F0E8]" />
                </button>
              </motion.div>
            )}
          </div>
        );

      case 'pairing':
        return (
          <div className="flex flex-col space-y-4 lg:space-y-6">
            <div className="space-y-1 lg:space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase block">
                Step 01 // Device Pairing
              </span>
              <h2 className="text-xl sm:text-3xl md:text-[40px] font-serif font-normal tracking-tight text-brand-text leading-[1.15]">
                Establish a secure local link.
              </h2>
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-neutral-400 font-normal max-w-xl">
              Connect via USB cable or scan a QR code to establish a secure local link. This initiates a secure handshake that maps your target hardware profile—including memory limits, GPU buffers, and CPU architectures.
            </p>

            <p className="text-[12.5px] sm:text-[13.5px] leading-relaxed text-neutral-500 font-normal max-w-xl">
              No guessing, no remote configuration. Every subsequent model selection is calibrated to these exact hardware specifications.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full sm:w-auto">
              <button
                onClick={handlePrevChapter}
                className="px-5 py-2.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300 text-xs font-mono transition-colors duration-150 flex items-center justify-center space-x-2 rounded cursor-pointer w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
 
              <button
                onClick={handleNextChapter}
                disabled={!isScanned}
                className={`px-5 py-2.5 bg-[#1F3D2E] hover:bg-[#2a5c47] text-[#F4F0E8] text-xs font-mono font-semibold tracking-wide transition-colors duration-150 flex items-center justify-center space-x-2 rounded border border-[#2a5c47] cursor-pointer w-full sm:w-auto ${!isScanned ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span>Describe Requirements</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'intent':
        return (
          <div className="flex flex-col space-y-4 lg:space-y-6">
            <div className="space-y-1 lg:space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase block">
                Step 02 // Describe Intent
              </span>
              <h2 className="text-xl sm:text-3xl md:text-[40px] font-serif font-normal tracking-tight text-brand-text leading-[1.15]">
                Describe your model requirements.
              </h2>
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-neutral-400 font-normal max-w-xl">
              Specify your target task in plain English (e.g., <em className="text-brand-text">"I want real-time object detection"</em>). LokiAI queries Hugging Face to identify compatible formats—filtering out candidates that exceed your device's physical RAM boundaries.
            </p>

            {/* Custom Input preview */}
            <div className="p-3 lg:p-4 bg-brand-surface/40 border border-neutral-800/80 rounded select-none max-w-xl">
              <p className="text-[9px] font-mono text-neutral-500 mb-1.5 uppercase font-bold tracking-wider">Your Prompt</p>
              <div className="flex items-center space-x-1.5 font-mono text-[13px]">
                <span className="text-neutral-500">&gt;</span>
                <span className="text-brand-text font-medium">{userQuery}</span>
                <span className="w-1.5 h-3.5 bg-neutral-400 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full sm:w-auto">
              <button
                onClick={handlePrevChapter}
                className="px-5 py-2.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300 text-xs font-mono transition-colors duration-150 flex items-center justify-center space-x-2 rounded cursor-pointer w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNextChapter}
                disabled={typingIndex < targetQuery.length}
                className={`px-5 py-2.5 bg-[#1F3D2E] hover:bg-[#2a5c47] text-[#F4F0E8] text-xs font-mono font-semibold tracking-wide transition-colors duration-150 flex items-center justify-center space-x-2 rounded border border-[#2a5c47] cursor-pointer w-full sm:w-auto ${typingIndex < targetQuery.length ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span>Compare Architectures</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'selection':
        return (
          <div className="flex flex-col space-y-2 lg:space-y-6">
            <div className="space-y-1 lg:space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase block">
                Step 03 // Pick Model
              </span>
              <h2 className="text-xl sm:text-3xl md:text-[40px] font-serif font-normal tracking-tight text-brand-text leading-[1.15]">
                Compare ranked neural architectures.
              </h2>
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-neutral-400 font-normal max-w-xl">
              We rank candidate models based on benchmark performance, parameter precision, and latency bounds. Select your preferred architecture to trigger the local compiler pipeline.
            </p>

            <div className="max-w-xl">
              <ModelSelectionCompare
                candidates={MODEL_CANDIDATES}
                selectedModelId={selectedModel?.id || 'yolo-next'}
                onSelect={(m) => setSelectedModel(m)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
              <button
                onClick={handlePrevChapter}
                className="px-5 py-2.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300 text-xs font-mono transition-colors duration-150 flex items-center justify-center space-x-2 rounded cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNextChapter}
                className="px-5 py-2.5 bg-[#1F3D2E] hover:bg-[#2a5c47] text-[#F4F0E8] text-xs font-mono font-semibold tracking-wide transition-colors duration-150 flex items-center justify-center space-x-2 rounded border border-[#2a5c47] cursor-pointer"
              >
                <span>Trigger Deployment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'deployment':
        return (
          <div className="flex flex-col space-y-4 lg:space-y-6">
            <div className="space-y-1 lg:space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase block">
                Step 04 // Deploying
              </span>
              <h2 className="text-xl sm:text-3xl md:text-[40px] font-serif font-normal tracking-tight text-brand-text leading-[1.15]">
                Compile and transfer to local runtime.
              </h2>
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-neutral-400 font-normal max-w-xl">
              LokiAI downloads the selected model binary from Hugging Face, verifies its cryptographic hash, and transfers the model weight matrix directly into the device's client-side browser memory buffer.
            </p>

            {/* Real deployment steps from docs/01_ARCHITECTURE.md data flow */}
            <div className="space-y-1.5 border-l-2 border-neutral-800 pl-4 py-1.5 max-w-xl select-none">
              {[
                { label: 'Download model from Hugging Face', speed: `${selectedModel?.size || '45 MB'}` },
                { label: 'Verify SHA-256 file hash', speed: 'Passed' },
                { label: 'Send model file to phone via USB or local network', speed: 'Transferring' },
                { label: 'Load on-device interface in the LokiAI app', speed: 'Loading' },
                { label: 'Bind model to the interface', speed: 'Binding' },
                { label: 'Write deployment config to phone', speed: 'Written' },
                { label: 'Mark deployment complete', speed: 'Done' },
              ].map((step, idx) => {
                const isActive = deploymentStepIndex === idx;
                const isPassed = deploymentStepIndex > idx;
                return (
                  <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                    <span className={`transition-colors duration-300 ${isPassed ? 'text-[#8da090]' : isActive ? 'text-brand-text font-bold animate-pulse' : 'text-neutral-600'}`}>
                      {isPassed ? '✓' : isActive ? '●' : '○'} {idx + 1}. {step.label}
                    </span>
                    <span className="text-neutral-600 font-bold">{step.speed}</span>
                  </div>
                );
              })}
            </div>

            <div className="py-0.5">
              <p className="text-[11px] font-mono text-neutral-500">
                Keep the LokiAI app open on your phone.
              </p>
            </div>
          </div>
        );

      case 'independence':
        return (
          <div className="flex flex-col space-y-4 lg:space-y-6">
            <div className="space-y-1 lg:space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase block">
                Step 05 // Unplugged
              </span>
              <h2 className="text-xl sm:text-3xl md:text-[40px] font-serif font-normal tracking-tight text-brand-text leading-[1.15]">
                Run fully offline, permanently.
              </h2>
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-neutral-400 font-normal max-w-xl">
              You can now safely shut down the host dashboard. The model, execution engine, and UI are stored permanently in the device's local app storage. Zero internet connection or host laptop dependencies.
            </p>

            {/* Offline status banner */}
            <div className="p-3 lg:p-4 bg-[#1b2520] border border-[#2b3b32] rounded max-w-xl flex items-start space-x-3 select-none">
              <WifiOff className="w-5 h-5 text-[#8da090] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11.5px] font-mono text-brand-text font-bold uppercase tracking-wider">
                  Running Fully Offline
                </p>
                <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                  All camera frames, text inputs, and diagnostic logs remain inside local app storage. No network traffic is generated.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handlePrevChapter}
                className="px-5 py-2.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300 text-xs font-mono transition-colors duration-150 flex items-center justify-center space-x-2 rounded cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleNextChapter}
                className="px-5 py-2.5 bg-[#1F3D2E] hover:bg-[#2a5c47] text-[#F4F0E8] text-xs font-mono font-semibold tracking-wide transition-colors duration-150 flex items-center justify-center space-x-2 rounded border border-[#2a5c47] cursor-pointer"
              >
                <span>Finish Overview</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'download':
        return (
          <div className="flex flex-col space-y-4 lg:space-y-6">
            <div className="space-y-1 lg:space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-neutral-500 font-bold uppercase block">
                Done
              </span>
              <h2 className="text-xl sm:text-3xl md:text-[40px] font-serif font-normal tracking-tight text-brand-text leading-[1.15]">
                Local intelligence is now online.
              </h2>
            </div>

            <p className="text-[13.5px] sm:text-[14.5px] leading-relaxed text-neutral-400 font-normal max-w-xl">
              You have completed the walk-through. You can swap models, update target specifications, or provision new edge devices at any time simply by reopening the dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1 w-full sm:w-auto">
              <a
                href="https://universe.theshriks.space"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-[#1F3D2E] hover:bg-[#2a5c47] text-[#F4F0E8] text-xs font-mono font-semibold tracking-wide transition-colors duration-150 flex items-center justify-center space-x-2 rounded border border-[#2a5c47] cursor-pointer shadow-xl w-full sm:w-auto"
              >
                <span>Request Access</span>
              </a>

              <button
                onClick={() => {
                  setPrevChapter('download');
                  setActiveChapter('hero');
                  setIsDeviceActive(true);
                  setHasWokenUpYet(true);
                }}
                className="px-5 py-2.5 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-300 text-xs font-mono transition-colors duration-150 flex items-center justify-center space-x-2 rounded cursor-pointer w-full sm:w-auto"
              >
                <span>Restart Demonstration</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Determine WiFi pairing state from chapter progress
  const isPairedByChapter = () => {
    switch (activeChapter) {
      case 'landing':
      case 'hero':
        return false;
      case 'pairing':
        return isScanned;
      case 'intent':
      case 'selection':
      case 'deployment':
        return true;
      case 'independence':
      case 'download':
        return false;
      default:
        return false;
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#000000] text-[#F4F0E8] flex flex-col justify-between font-sans selection:bg-[#2A4237] selection:text-[#F4F0E8]">

      {/* Landing page full-screen background video */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-[1500ms] pointer-events-none ${activeChapter === 'landing' ? 'opacity-100' : 'opacity-0'}`}>
        <video
          src="/video.mov"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />
      </div>

      {/* Layered background: quiet film grain */}
      <div className="absolute inset-0 bg-grain pointer-events-none z-0 mix-blend-overlay opacity-20" />

      {/* Decorative clean borders for architectural precision */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-neutral-900/40" />
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-neutral-900/40" />
      <div className="absolute left-0 inset-y-0 w-[1px] bg-neutral-900/40" />
      <div className="absolute right-0 inset-y-0 w-[1px] bg-neutral-900/40" />

      {/* Main minimal header bar */}
      <header className="w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-6 border-b border-neutral-900/30 z-50">
        <div className="flex items-center">
          <img
            src="/lokiai-wordmark-new.png"
            alt="LokiAI Logo"
            className="h-4 sm:h-5 w-auto object-contain"
          />
        </div>

        {/* Mobile current chapter indicator */}
        <div className="md:hidden flex items-center space-x-2">
          {(() => {
            const idx = listChapters.indexOf(activeChapter);
            if (activeChapter === 'landing' || activeChapter === 'hero' || activeChapter === 'download') {
              return (
                <span className="text-[10px] font-mono font-bold text-[#8da090] uppercase tracking-wider">
                  {activeChapter === 'landing' ? 'LANDING' : activeChapter === 'hero' ? 'START' : 'DOWNLOAD'}
                </span>
              );
            } else {
              const stepNum = idx - 1; // pairing is index 2 -> step 1
              return (
                <>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase">
                    Step 0{stepNum}/05
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#8da090] uppercase tracking-wider">
                    {activeChapter.toUpperCase()}
                  </span>
                </>
              );
            }
          })()}
        </div>

        {/* Dynamic telemetry step lists */}
        <nav className="hidden md:flex items-center space-x-4">
          {listChapters.map((ch, idx) => {
            const isActive = activeChapter === ch;
            let displayLabel = '';
            if (ch === 'landing') displayLabel = 'LANDING';
            else if (ch === 'hero') displayLabel = 'START';
            else if (ch === 'pairing') displayLabel = '01 PAIRING';
            else if (ch === 'intent') displayLabel = '02 INTENT';
            else if (ch === 'selection') displayLabel = '03 SELECTION';
            else if (ch === 'deployment') displayLabel = '04 DEPLOYMENT';
            else if (ch === 'independence') displayLabel = '05 INDEPENDENCE';
            else if (ch === 'download') displayLabel = 'DOWNLOAD';

            return (
              <button
                key={ch}
                onClick={() => {
                  const currentIndex = listChapters.indexOf(activeChapter);
                  const targetIndex = listChapters.indexOf(ch);
                  if (currentIndex === targetIndex) return;
                  const direction = targetIndex >= currentIndex ? 'next' : 'prev';
                  
                  setIsDeviceActive(true);
                  if (ch !== 'landing' && ch !== 'hero') {
                    setHasWokenUpYet(true);
                  }
                  animateTransition(direction, ch);
                }}
                className={`text-[10px] font-mono transition-all uppercase tracking-wider hover:text-brand-text ${
                  isActive ? 'text-brand-text font-bold' : 'text-neutral-500'
                }`}
              >
                {displayLabel}
              </button>
            );
          })}
        </nav>

      </header>

      {/* Narrative Section & Continuous viewport journey */}
      <main className="flex-1 min-h-0 h-full w-full max-w-7xl mx-auto px-4 sm:px-6 py-1 md:py-8 flex flex-col lg:flex-row items-center lg:items-stretch lg:justify-between gap-1 sm:gap-4 lg:gap-12 relative z-10 overflow-y-auto overflow-x-hidden lg:overflow-hidden">

        {/* Mobile/tablet: this wrapper centers the pair as one unit via margin-auto (safe under overflow,
            unlike justify-center which clips inaccessible content on short viewports). On lg it becomes
            display:contents so narrative/device go back to being direct flex-row children of <main>. */}
        <div className="flex flex-col items-center w-full my-auto gap-1 sm:gap-4 lg:contents">

        {/* LEFT COMPONENT COLUMN: NARRATIVE PORTION */}
        <div className={`w-full flex-none lg:flex-1 lg:overflow-y-auto overflow-x-hidden lg:min-h-0 ${activeChapter === 'landing' ? 'lg:w-10/12 mx-auto text-center items-center' : 'lg:w-5/12'} flex flex-col justify-center lg:min-h-[280px] space-y-4 transition-all duration-700 pb-4 lg:pb-0`} ref={narrativeRef}>
          {renderChapterNarrative()}
        </div>

        {/* RIGHT COMPONENT COLUMN: IMMERSIVE DEVICE HOUSING */}
        <div className={`relative w-full lg:w-7/12 flex items-center justify-center h-[120px] min-[400px]:h-[150px] sm:h-[280px] lg:h-auto shrink-0 transition-opacity duration-700 ${activeChapter === 'landing' ? 'opacity-0 pointer-events-none hidden lg:flex' : 'opacity-100'}`} ref={deviceContainerRef}>
          <div className="flex flex-row flex-nowrap items-center justify-center gap-2 sm:gap-8 lg:gap-20 xl:gap-24 scale-[0.3] min-[400px]:scale-[0.35] sm:scale-[0.6] lg:scale-100 origin-center transition-all duration-300">

            {/* Laptop — the dashboard, what the user is looking at on their laptop screen */}
            <div className="flex flex-col items-center gap-2">
              <LaptopFrame
                activeChapter={activeChapter}
                isPaired={isPairedByChapter()}
                isScanned={isScanned}
                userQuery={userQuery}
                selectedModel={selectedModel}
                deploymentProgress={deploymentProgress}
                deploymentStepIndex={deploymentStepIndex}
              />
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-600">Laptop — Dashboard</span>
            </div>

            {/* Phone — the target device */}
            <div className="relative flex flex-col items-center gap-2">
              <DeviceFrame
                isPaired={isPairedByChapter()}
                isScanned={isScanned}
                isDeviceActive={isDeviceActive}
                activeChapter={activeChapter}
                selectedModel={selectedModel}
                deploymentProgress={deploymentProgress}
                deploymentStepIndex={deploymentStepIndex}
                demoType={demoType}
                setDemoType={setDemoType}
                onDeviceWakeup={triggerDeviceActivation}
              />
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-600">Phone — Target Device</span>
              <TelemetryLines isVisible={activeChapter === 'pairing' && isScanned} />
            </div>

          </div>
        </div>

        </div>

      </main>

    </div>
  );
}
