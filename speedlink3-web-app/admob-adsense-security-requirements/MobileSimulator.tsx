import React, { useState, useEffect } from "react";
import { 
  Smartphone, Maximize2, ShieldCheck, RefreshCw, Cpu, 
  Sparkles, MessageSquare, Play, Plus, Trash2, Send, 
  HelpCircle, Settings, CheckCircle2, CreditCard, 
  AlertCircle, ChevronRight, Lock, LayoutGrid, Clock,
  Image as ImageIcon, Share2, Award, Zap, Bell, Volume2, HardDrive, Search, X, Activity, Menu, Sun, Moon,
  ChevronDown, Check, Video, VolumeX, Copy, Shield, Monitor, Download
} from "lucide-react";
import { Project, SyncLog, ChatMessage } from "../types";
import { VEOVIBE_THEME, useTheme } from "../theme";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

const WeoVibeLogo = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    fill="none" 
    className={className}
  >
    <defs>
      <linearGradient id="weoWGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="35%" stopColor="#ef4444" />
        <stop offset="70%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    
    <circle cx="28" cy="22" r="4.5" fill="#22c55e" />
    <line x1="28" y1="22" x2="33" y2="35" stroke="#ef4444" strokeWidth="2.5" />
    
    <circle cx="16" cy="28" r="4" fill="#6366f1" />
    <line x1="16" y1="28" x2="25" y2="38" stroke="#ec4899" strokeWidth="2.5" />

    <circle cx="42" cy="28" r="5" fill="#f59e0b" />
    <line x1="42" y1="28" x2="35" y2="38" stroke="#ef4444" strokeWidth="2.5" />

    <circle cx="31" cy="37" r="7.5" fill="#ef4444" />

    <path 
      d="M12,44 C12,44 21,39 26,45 C32,52 38,65 42,52 C46,39 52,28 62,35 C72,42 78,22 86,22" 
      stroke="url(#weoWGradient)" 
      strokeWidth="7" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

const AdMobPointerGuard = ({
  children,
  showInterstitial,
  isWatchingRewardedAd,
  simulatedAdUnit,
  interstitialExportProject,
  exportStage,
  className = ""
}: {
  children: React.ReactNode;
  showInterstitial: boolean;
  isWatchingRewardedAd: boolean;
  simulatedAdUnit: { format: string } | null;
  interstitialExportProject: Project | null;
  exportStage: string;
  className?: string;
}) => {
  const isAdActiveOrLoading = 
    showInterstitial || 
    isWatchingRewardedAd || 
    (simulatedAdUnit !== null && ["App Open", "Interstitial", "Rewarded Ads", "Rewarded Interstitial"].includes(simulatedAdUnit.format)) || 
    (interstitialExportProject !== null && exportStage === "ad");

  return (
    <div className={`relative transition-all duration-300 ${isAdActiveOrLoading ? "pointer-events-none select-none opacity-90 filter blur-[0.4px]" : ""} ${className}`}>
      {children}
      {isAdActiveOrLoading && (
        <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[0.5px] z-[99] rounded-[24px] cursor-not-allowed flex items-center justify-center p-2">
          <div className="bg-slate-950/85 border border-slate-850 px-2.5 py-1 rounded-full text-[7.5px] text-amber-400 font-mono flex items-center gap-1 shadow-lg animate-pulse">
            <Shield className="h-2.5 w-2.5 text-amber-400" />
            <span>AdMob Interaction Intercept</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface MobileSimulatorProps {
  isPremium: boolean;
  setPremium: (prem: boolean) => void;
  syncLogs: SyncLog[];
  addSyncLog: (type: "sync" | "auth" | "notification" | "admob" | "system", message: string) => void;
  onClearLogs: () => void;
  autoClear: boolean;
  setAutoClear: (val: boolean) => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  rainbowGlowEnabled: boolean;
  setRainbowGlowEnabled: (val: boolean) => void;
  onSelectProject: (proj: Project) => void;
  onTriggerNotification: (title: string, body: string) => void;
  callGeminiImage: (prompt: string, size: string, aspect: string) => Promise<string | null>;
}

export default function MobileSimulator({
  isPremium,
  setPremium,
  syncLogs,
  addSyncLog,
  onClearLogs,
  autoClear,
  setAutoClear,
  projects,
  setProjects,
  darkMode,
  setDarkMode,
  rainbowGlowEnabled,
  setRainbowGlowEnabled,
  onSelectProject,
  onTriggerNotification,
  callGeminiImage
}: MobileSimulatorProps) {
  const { setVariable } = useTheme();
  // Mobile UI States
  const [activeTab, setActiveTab] = useState<"dashboard" | "studio" | "sync" | "settings">("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authUsername, setAuthUsername] = useState<string>("PremiumCreativeChef");
  const [authPassword, setAuthPassword] = useState<string>("••••••••••");
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [credits, setCredits] = useState<number>(340);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [logSearchQuery, setLogSearchQuery] = useState<string>("");
  const [selectedLogTypes, setSelectedLogTypes] = useState<string[]>(["system", "sync", "notification", "auth", "admob"]);
  
  // Custom Project creation modal state
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [newProjName, setNewProjName] = useState<string>("");
  const [newProjPrompt, setNewProjPrompt] = useState<string>("");
  const [newProjAspect, setNewProjAspect] = useState<string>("16:9");
  const [newProjSize, setNewProjSize] = useState<string>("1K");
  const [newProjAudio, setNewProjAudio] = useState<string>("Ambient Neon Rhythm Loop");

  // AdMob Simulator State
  const [showInterstitial, setShowInterstitial] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);
  const [timerCount, setTimerCount] = useState<number>(5);

  // Google AdMob Demo Ad Units & Test Device configurations
  const [copiedAdUnitId, setCopiedAdUnitId] = useState<string | null>(null);
  const [testDevices, setTestDevices] = useState<string[]>(["VEOVIBE_EMU_SIM_F9B24", "PIXEL_8_PRO_TEST_48A7"]);
  const [newDeviceInput, setNewDeviceInput] = useState<string>("");
  const [simulatedAdUnit, setSimulatedAdUnit] = useState<{ format: string; id: string; desc: string } | null>(null);
  const [simulatedAdTimer, setSimulatedAdTimer] = useState<number>(5);
  const [simulatedBannerActive, setSimulatedBannerActive] = useState<string | null>(null);

  // Accidental Click Shield & Spacing Protection States
  const [clickShieldActive, setClickShieldActive] = useState<{
    title: string;
    description: string;
    ctaLabel: string;
    action: () => void;
  } | null>(null);
  const [isShieldEnabled, setIsShieldEnabled] = useState<boolean>(true);
  const [bannerPaddingEnabled, setBannerPaddingEnabled] = useState<boolean>(true);

  // Export Interstitial Ad State
  const [interstitialExportProject, setInterstitialExportProject] = useState<Project | null>(null);
  const [exportAdTimer, setExportAdTimer] = useState<number>(5);
  const [exportStage, setExportStage] = useState<"ad" | "exporting" | "done">("ad");
  const [exportProgress, setExportProgress] = useState<number>(0);

  // --- NEW SHOWCASE STATES ---
  const [studioSubtab, setStudioSubtab] = useState<"inputs" | "media" | "monetize">("inputs");
  
  // Custom dropdown sample state
  const [selectedDropdownValue, setSelectedDropdownValue] = useState<string>("optimized");
  const [customDropdownOpen, setCustomDropdownOpen] = useState<boolean>(false);
  
  // Single image upload state
  const [singleImage, setSingleImage] = useState<{ name: string; size: string; url: string } | null>(null);
  
  // Multiple images upload state
  const [multipleImages, setMultipleImages] = useState<Array<{ id: string; name: string; size: string; url: string }>>([
    { id: "img-1", name: "vibe_gradient_schema.png", size: "234 KB", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60" },
    { id: "img-2", name: "launcher_icon_dark.png", size: "112 KB", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=60" }
  ]);
  
  // Button-wise checkmarks selection state
  const [multiChoiceSelections, setMultiChoiceSelections] = useState<string[]>(["bg-sync", "compress-logs"]);

  // Video Player States
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [videoMuted, setVideoMuted] = useState<boolean>(false);
  const [videoAspect, setVideoAspect] = useState<"16:9" | "9:16">("16:9");
  const [videoProgress, setVideoProgress] = useState<number>(35);

  // Audio Player States
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [audioTrackIndex, setAudioTrackIndex] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(75);
  const [audioProgress, setAudioProgress] = useState<number>(20);
  const [eqWaves, setEqWaves] = useState<number[]>([20, 45, 15, 60, 30, 75, 25, 50, 10, 55, 35, 40]);

  // AdMob Policy Reward states
  const [isWatchingRewardedAd, setIsWatchingRewardedAd] = useState<boolean>(false);
  const [adTimer, setAdTimer] = useState<number>(5);
  const [adsensePlacements, setAdsensePlacements] = useState<boolean>(true);

  // Sync state variables to standard theme layout stylesheet resources
  useEffect(() => {
    setVariable("export-progress", `${exportProgress}%`);
  }, [exportProgress, setVariable]);

  useEffect(() => {
    setVariable("video-progress", `${videoProgress}%`);
  }, [videoProgress, setVariable]);

  useEffect(() => {
    setVariable("audio-indicator-transform", audioPlaying ? "rotate(360deg)" : "none");
  }, [audioPlaying, setVariable]);

  useEffect(() => {
    eqWaves.forEach((h, i) => {
      setVariable(`eq-bar-${i}`, `${audioPlaying ? h : 15}%`);
    });
  }, [eqWaves, audioPlaying, setVariable]);

  // Simulation loop for active players & rewards
  useEffect(() => {
    let interval: any = null;
    if (videoPlaying || audioPlaying || isWatchingRewardedAd) {
      interval = setInterval(() => {
        // Video Progress simulation
        if (videoPlaying) {
          setVideoProgress(prev => {
            if (prev >= 100) return 0;
            return Math.min(100, parseFloat((prev + 1.2).toFixed(1)));
          });
        }
        
        // Audio Progress & dancing equalizer wave simulation
        if (audioPlaying) {
          setAudioProgress(prev => {
            if (prev >= 100) return 0;
            return prev + 1;
          });
          // Update visual EQ columns with random heights from 10 to 90
          setEqWaves(prev => prev.map(() => Math.floor(Math.random() * 75) + 15));
        }

        // Ad Timer Countdown
        if (isWatchingRewardedAd) {
          setAdTimer(prev => {
            if (prev > 0) return prev - 1;
            return 0;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoPlaying, audioPlaying, isWatchingRewardedAd]);

  // Separate effect to handle reward grant when ad timer finishes (prevents setState in render warnings)
  useEffect(() => {
    if (isWatchingRewardedAd && adTimer === 0) {
      setIsWatchingRewardedAd(false);
      setAdTimer(5); // Reset timer back to initial
      setCredits(c => c + 150);
      addSyncLog("admob", "AdMob verified rewarded video payout credentials processed successfully (+150 Tokens)");
      onTriggerNotification(
        "AdMob Reward Granted",
        "Google compliance check cleared! +150 tokens added to account balance."
      );
    }
  }, [isWatchingRewardedAd, adTimer, addSyncLog, onTriggerNotification]);

  // Timer for Export Interstitial Ad
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (interstitialExportProject && exportStage === "ad" && exportAdTimer > 0) {
      timer = setTimeout(() => {
        setExportAdTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [interstitialExportProject, exportStage, exportAdTimer]);

  // Timer for Simulated Demo Ad Unit
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simulatedAdUnit && simulatedAdTimer > 0) {
      const isFullScreen = ["App Open", "Interstitial", "Rewarded Ads", "Rewarded Interstitial"].includes(simulatedAdUnit.format);
      if (isFullScreen) {
        timer = setTimeout(() => {
          setSimulatedAdTimer(prev => prev - 1);
        }, 1000);
      }
    }
    return () => clearTimeout(timer);
  }, [simulatedAdUnit, simulatedAdTimer]);

  // Progress loader for the Exporting Stage
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (interstitialExportProject && exportStage === "exporting") {
      timer = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setExportStage("done");
            addSyncLog("system", `Post-ad export final binary package ready: ${interstitialExportProject.name}.mp4`);
            onTriggerNotification(
              "Export Package Ready", 
              `Downloaded [${interstitialExportProject.name}.mp4] to simulator device storage.`
            );
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [interstitialExportProject, exportStage, addSyncLog, onTriggerNotification]);

  // Sync state animation
  const handleDeviceSync = () => {
    setIsSyncing(true);
    addSyncLog("sync", "Force Sync initiated from mobile node.",);
    
    setTimeout(() => {
      setIsSyncing(false);
      addSyncLog("sync", "VibeSync successfully matched 12 tracks to desktop clients.");
      onTriggerNotification(
        "Sync Cycle Complete", 
        "Device databases are now perfectly synchronized."
      );
    }, 1500);
  };

  // Log Authentication Simulate
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    addSyncLog("auth", "Attempting authorization with secure token key.");
    
    setTimeout(() => {
      setIsLoggingIn(false);
      setIsAuthenticated(true);
      addSyncLog("auth", `User '${authUsername}' verified (SHA-256 state synced).`);
      onTriggerNotification(
        "Secure Sync Login", 
        `Welcome back! Device linked successfully to ${authUsername}.`
      );
    }, 1200);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    addSyncLog("auth", "User signed out. Real-time syncing suspended.");
  };

  // Milestone action triggers
  const handleStartRender = (projId: string) => {
    const proj = projects.find(p => p.id === projId);
    if (!proj) return;

    addSyncLog("system", `CPU allocation scheduled for render unit: ${proj.name}`);
    
    setProjects(prev => prev.map(p => {
      if (p.id === projId) {
        return { ...p, status: "processing", progress: 5 };
      }
      return p;
    }));

    // Simulate progress increments
    let currentProgress = 5;
    const interval = setInterval(() => {
      currentProgress += 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        setProjects(prev => prev.map(p => {
          if (p.id === projId) {
            return { ...p, status: "completed", progress: 100 };
          }
          return p;
        }));
        
        addSyncLog("notification", `Project [${proj.name}] render milestone reached.`);
        onTriggerNotification(
          "Veo Render Milestone Complete!", 
          `Your video project [${proj.name}] is compiled and ready for playback.`
        );
        // Automatically trigger AdMob Interstitial ad upon rendering completion
        setTimeout(() => {
          handleTriggerExportAd({ ...proj, status: "completed", progress: 100 });
        }, 800);
      } else {
        setProjects(prev => prev.map(p => {
          if (p.id === projId) {
            return { ...p, progress: currentProgress };
          }
          return p;
        }));
      }
    }, 800);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName) return;

    const newProj: Project = {
      id: "proj-" + Date.now() + "-" + Math.random().toString(36).substring(2, 11),
      name: newProjName,
      status: "queued",
      progress: 0,
      duration: "0:12",
      thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=300&auto=format&fit=crop",
      prompt: newProjPrompt || "Hyper-velocity light wave neon aesthetic, music rhythm audio matching style",
      aspect: newProjAspect,
      size: newProjSize,
      audioTrack: newProjAudio,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setProjects(prev => [newProj, ...prev]);
    setIsCreatingProject(false);
    addSyncLog("system", `New project timeline created: ${newProjName}`);
    
    // Auto-prompt selection helper
    setNewProjName("");
    setNewProjPrompt("");

    // Offer to start render
    setTimeout(() => {
      handleStartRender(newProj.id);
    }, 500);
  };

  const handleDeleteProject = (id: string, name: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    addSyncLog("system", `Timeline project deleted: ${name}`);
  };

  // Reward AdMob interstitial handler
  const triggerAdMobReward = () => {
    setShowInterstitial(true);
    setTimerCount(5);
    addSyncLog("admob", "Requested AdMob reward video: Unlocking rendering passes.");
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showInterstitial && timerCount > 0) {
      timer = setTimeout(() => {
        setTimerCount(prev => prev - 1);
      }, 1000);
    } else if (showInterstitial && timerCount === 0) {
      setRewardClaimed(true);
    }
    return () => clearTimeout(timer);
  }, [showInterstitial, timerCount]);

  const claimAdMobReward = () => {
    setShowInterstitial(false);
    setRewardClaimed(false);
    setCredits(prev => prev + 50);
    addSyncLog("admob", "Rewarded interstitial completed. Added 50 generation credits!");
    onTriggerNotification("AdMob Reward Claimed!", "50 VeoVibe generator tokens have been credited to your active wallet.");
  };

  const handleTriggerExportAd = (proj: Project) => {
    setInterstitialExportProject(proj);
    setExportAdTimer(5);
    setExportStage("ad");
    setExportProgress(0);
    addSyncLog("admob", `[AdMob Interstitial] Prefetching full-screen ad for export package: ${proj.name}`);
  };

  // Filtered sync logs for the developer workflow search UI
  const filteredLogs = syncLogs.filter(log => {
    // 1. Filter by selected event type checkboxes
    const logTypeLower = log.type.toLowerCase();
    if (!selectedLogTypes.includes(logTypeLower)) {
      return false;
    }

    // 2. Filter by search query (message, device content, or type value)
    if (!logSearchQuery.trim()) return true;
    const query = logSearchQuery.toLowerCase();
    return (
      log.message.toLowerCase().includes(query) ||
      log.device.toLowerCase().includes(query) ||
      log.type.toLowerCase().includes(query)
    );
  });

  return (
    <div className="relative">
      {/* Interactive Floating AdMob Rewarded Video Ad Overlay */}
      {isWatchingRewardedAd && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md rounded-[52px]">
          <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-lg text-center shadow-2xl space-y-4">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono font-bold">
              <span>Google AdMob SDK v12.2</span>
              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-sans">REWARD PASS SECURED</span>
            </div>
            
            <div className="inline-flex items-center justify-center p-3.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <Video className="h-8 w-8 animate-pulse text-blue-400" />
            </div>

            <div>
              <h3 className="text-base font-display font-bold text-slate-100">Live Rewarded Stream Ad</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Compliant AdMob reward simulation active. Watch to gain 150 companion credits.
              </p>
            </div>

            {/* Immersive flowing gradient video mimic container */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex flex-col items-center justify-center border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/30 via-transparent to-emerald-600/20 animate-pulse duration-1000" />
              <div className="z-10 text-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block mb-1" />
                <span className="text-[11px] font-bold text-white block tracking-wider font-mono">AD_RUNNING_SEQUENCE_#{Math.floor(Date.now() / 15000) % 1000}</span>
                <span className="text-[9px] text-white/50 block font-mono mt-0.5">Buffering server-authority state...</span>
              </div>
              <div className="absolute bottom-2.5 right-2.5 px-2 py-1 bg-black/80 rounded-md text-[10px] text-slate-300 font-mono font-semibold">
                {adTimer > 0 ? `Ad closes in ${adTimer}s` : "Compliance clear. Reward Ready!"}
              </div>
            </div>

            <div>
              {adTimer > 0 ? (
                <button disabled className="w-full py-2.5 bg-slate-800 text-slate-500 font-bold rounded-md text-xs cursor-not-allowed">
                  🔒 Locked until complete: {adTimer}s
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsWatchingRewardedAd(false);
                    setCredits(c => c + 150);
                    addSyncLog("admob", "AdMob verified rewarded video payout credentials processed successfully (+150 Tokens)");
                    onTriggerNotification(
                      "AdMob Reward Granted",
                      "Google compliance check cleared! +150 tokens added to account balance."
                    );
                  }}
                  className="w-full py-2.5 bg-green-500 hover:bg-green-400 text-slate-950 font-bold rounded-md text-xs transition shadow-lg shadow-green-500/20 cursor-pointer text-center"
                >
                  Claim Payout & Close Ad
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Floating AdMob Interstitial Simulator */}
      {showInterstitial && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md rounded-[52px]">
          <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-lg text-center shadow-2xl">
            <div className="inline-flex items-center justify-center p-3 mb-4 bg-amber-500/10 text-amber-400 rounded-lg">
              <Award className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-display font-bold text-slate-100">VeoVibe Sponsored Break</h3>
            <p className="text-sm text-slate-400 mt-2 mb-6">
              Complete viewing of this sponsor banner to gain <span className="text-amber-400 font-bold">+50 project rendering tokens</span>.
            </p>

            {/* Simulated Live Video Ad Box */}
            <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden flex flex-col items-center justify-center border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-transparent to-indigo-900/40 animate-pulse" />
              <Zap className="h-10 w-10 text-blue-400 animate-spin" />
              <span className="text-xs text-slate-500 mt-2 font-mono">AD_MOB_CORE_INSTANCE_3020</span>
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] text-slate-300 font-mono">
                {timerCount > 0 ? `Ad closes in ${timerCount}s` : "Dynamic Reward Validated"}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {timerCount > 0 ? (
                <button disabled className="w-full py-3 bg-slate-800 text-slate-500 font-bold rounded-md text-sm cursor-not-allowed">
                  Please wait to skip...
                </button>
              ) : (
                <button 
                  onClick={claimAdMobReward}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md text-sm transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Claim Render Tokens Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 100% Immersive Full-Screen AdMob Interstitial Ad & Export Manager */}
      {interstitialExportProject && (
        <div className="absolute inset-0 z-[70] bg-slate-950 text-white rounded-[52px] overflow-hidden flex flex-col justify-between p-6 select-none animate-fade-in">
          
          {/* Ad Heading bar / standard AdMob Header */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-wider">
            <span className="flex items-center gap-1">
              <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-sans font-bold text-[8px] uppercase">Ad</span>
              <span>AdMob Interstitial v21.1</span>
            </span>
            <span className="text-slate-400 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              {exportStage === "ad" ? (
                exportAdTimer > 0 ? `Skip in ${exportAdTimer}s` : "Close available"
              ) : exportStage === "exporting" ? (
                "Processing Export..."
              ) : (
                "Export Complete"
              )}
            </span>
          </div>

          {/* Core dynamic body based on export stage */}
          {exportStage === "ad" ? (
            <div className="flex-1 flex flex-col justify-center my-4 space-y-4 text-left">
              {/* Publisher validation brand */}
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto mb-2">
                  <Award className="h-6 w-6 animate-bounce" />
                </div>
                <h4 className="text-sm font-bold text-slate-100">VeoVibe Premium Sponsor Break</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs mx-auto">
                  Google publisher guidelines require intermittent full-screen breaks to cover core execution costs.
                </p>
              </div>

              {/* Standard Interstitial Video/Interactive Box */}
              <div className="relative aspect-[4/5] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-transparent to-rose-950/40 animate-pulse" />
                
                {/* Simulated Game/Offer Details */}
                <div className="z-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-md bg-gradient-to-br from-indigo-500 to-rose-500 shadow-md mx-auto flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white animate-spin" />
                  </div>
                  <h5 className="text-[11px] font-bold text-slate-100">Antigravity Coding Agent Pro</h5>
                  <p className="text-[9px] text-slate-400 max-w-[200px] mx-auto leading-normal">
                    Synthesize complex full-stack web architectures with zero boilerplate in seconds.
                  </p>
                  
                  {/* Rating mimics */}
                  <div className="flex gap-0.5 justify-center text-amber-400 text-[8px]">
                    {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                    <span className="text-slate-500 ml-1">(4.9 • 2.1M installs)</span>
                  </div>
                </div>

                {/* Simulated CTA Install button inside the Ad */}
                <div className="z-10 w-full mt-4">
                  <a 
                    href="https://ai.studio/build" 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => {
                      if (isShieldEnabled) {
                        e.preventDefault();
                        setClickShieldActive({
                          title: "Antigravity Coding Agent Pro (Advertiser)",
                          description: "ca-app-pub-3940256099942544-admob-interstitial-sponsor-break",
                          ctaLabel: "Fullscreen Conversion Link Button",
                          action: () => {
                            window.open("https://ai.studio/build", "_blank");
                            addSyncLog("admob", "[AdMob] Verified CTA Click: Navigated advertiser landing page.");
                          }
                        });
                      } else {
                        addSyncLog("admob", "[AdMob] Interstitial click tracked. Navigating to advertiser marketplace.");
                      }
                    }}
                    className="w-full inline-block text-center py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold rounded-lg transition"
                  >
                    Install Now
                  </a>
                </div>
              </div>
            </div>
          ) : exportStage === "exporting" ? (
            <div className="flex-1 flex flex-col justify-center items-center my-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                <HardDrive className="h-6 w-6 text-blue-400" />
              </div>
              
              <div className="text-center">
                <h4 className="text-xs font-bold text-slate-200">Processing Post-Ad Delivery</h4>
                <p className="text-[9px] text-slate-400 mt-1 max-w-[220px]">
                  AdMob compliance validated! Assembling final MP4 video packets...
                </p>
              </div>

              {/* Progress Bar inside device */}
              <div className="w-full max-w-xs space-y-1.5">
                <div className="flex justify-between text-[8px] font-mono text-slate-500">
                  <span>PACKAGING CHUNKS</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-[2px]">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-150 theme-export-progress" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center my-4 space-y-4 animate-scale-up">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Check className="h-7 w-7 text-emerald-400 animate-pulse" />
              </div>
              
              <div className="text-center">
                <h4 className="text-sm font-bold text-slate-200">Export Complete!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  [ {interstitialExportProject.name} ]
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-mono text-slate-400">
                  <span>File Aspect: {interstitialExportProject.aspect}</span>
                  <span>•</span>
                  <span>Format: MP4 ({interstitialExportProject.size})</span>
                </div>
              </div>
            </div>
          )}

          {/* Standard AdMob controls at bottom */}
          <div className="space-y-2 text-center">
            {exportStage === "ad" ? (
              exportAdTimer > 0 ? (
                <button 
                  disabled 
                  className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-500 text-xs font-extrabold rounded-md cursor-not-allowed text-center"
                >
                  🔒 Close Ad Available in {exportAdTimer}s
                </button>
              ) : (
                <button 
                  onClick={() => {
                    addSyncLog("admob", "[AdMob Interstitial] Ad dismissed cleanly. Starting post-impression processing.");
                    setExportStage("exporting");
                    setExportProgress(0);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-md transition shadow-lg shadow-amber-500/10 cursor-pointer text-center"
                >
                  Close Ad & Continue
                </button>
              )
            ) : exportStage === "exporting" ? (
              <button 
                disabled 
                className="w-full py-2.5 bg-slate-900 border border-slate-800 text-slate-500 text-xs font-extrabold rounded-md cursor-not-allowed text-center"
              >
                Generating Download Artifact... {exportProgress}%
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const downloadName = `veovibe-${interstitialExportProject.name.toLowerCase().replace(/\s+/g, "-")}.mp4`;
                    // Trigger a simple local download mimic
                    const element = document.createElement("a");
                    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent("VeoVibe simulated video compilation artifact"));
                    element.setAttribute("download", downloadName);
                    element.style.display = "none";
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    
                    addSyncLog("system", `Downloaded artifact link saved: ${downloadName}`);
                    onTriggerNotification("Download Triggered", `${downloadName} saved successfully.`);
                    setInterstitialExportProject(null);
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-md transition cursor-pointer text-center"
                >
                  Download .MP4
                </button>
                <button 
                  onClick={() => {
                    addSyncLog("system", "Session returned back to list view.");
                    setInterstitialExportProject(null);
                  }}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-md hover:bg-slate-800 transition cursor-pointer text-center"
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <p className="text-[8px] text-slate-600 text-center font-mono mt-2 uppercase tracking-wide">
              COMPLIES WITH GOOGLE PLAY & ADMOB INTERSTITIAL GUIDELINES
            </p>
          </div>
        </div>
      )}

      {/* 100% Immersive Full-Screen AdMob Demo Ad Unit Overlays */}
      {simulatedAdUnit && ["App Open", "Interstitial", "Rewarded Ads", "Rewarded Interstitial"].includes(simulatedAdUnit.format) && (
        <div className="absolute inset-0 z-[80] bg-slate-950 text-white rounded-[52px] overflow-hidden flex flex-col justify-between p-6 select-none animate-fade-in text-left">
          {/* Header */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-wider">
            <span className="flex items-center gap-1">
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[8px] font-bold font-sans uppercase">DEMO AD CREATIVE</span>
              <span>AdMob SDK v21.1</span>
            </span>
            <span className="text-slate-350 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono">
              {simulatedAdTimer > 0 
                ? `Reward opens in ${simulatedAdTimer}s` 
                : "Eligible for Close"
              }
            </span>
          </div>

          {/* Ad Body */}
          <div className="flex-1 flex flex-col justify-center my-4 space-y-4">
            <div className="text-center space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-amber-400">Google Demo Ad Creative Match</span>
              <h4 className="text-xs font-extrabold text-slate-100">{simulatedAdUnit.format} Ad Loaded</h4>
              <p className="text-[8px] text-slate-400 font-mono tracking-tight bg-slate-900/80 py-1.5 rounded select-all break-all overflow-y-auto max-h-12 border border-slate-850 px-2 leading-relaxed">
                Ad Unit ID: <span className="text-amber-300 font-bold">{simulatedAdUnit.id}</span>
              </p>
            </div>

            {/* Test creative simulator panel */}
            <div className="relative aspect-video rounded-md bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-transparent to-red-950/20 animate-pulse" />
              
              <div className="absolute top-1 right-1 px-1 bg-black/60 rounded text-[6px] font-mono text-slate-550">
                Connection Status: Verified Dev Test Mode
              </div>

              {simulatedAdUnit.format === "App Open" ? (
                <div className="z-10 space-y-1 my-auto animate-pulse">
                  <Smartphone className="h-6 w-6 text-indigo-400 mx-auto" />
                  <span className="text-[9px] font-bold block text-slate-200">Simulating App Launch Impression</span>
                  <p className="text-[7.5px] text-slate-500 leading-normal">Fires as soon as active app thread finishes background prefetch.</p>
                </div>
              ) : simulatedAdUnit.format === "Interstitial" ? (
                <div className="z-10 space-y-1 my-auto">
                  <Maximize2 className="h-6 w-6 text-rose-400 mx-auto" />
                  <span className="text-[9px] font-bold block text-slate-200">Transition Compliance Sandbox</span>
                  <p className="text-[7.5px] text-slate-500 leading-normal">Static test interstitial creative covering 100% viewport space.</p>
                </div>
              ) : (
                <div className="z-10 space-y-1 my-auto">
                  <Award className="h-6 w-6 text-amber-400 mx-auto animate-bounce" />
                  <span className="text-[9px] font-bold block text-slate-200">Rewarded Video Ad Stream</span>
                  <p className="text-[7.5px] text-slate-500 leading-normal">Simulated Google video format that rewards user on completed countdown.</p>
                </div>
              )}

              {/* Install / Interact Demo Button */}
              <button 
                onClick={() => {
                  if (isShieldEnabled) {
                    setClickShieldActive({
                      title: `Google Demo Creative Placement (${simulatedAdUnit.format})`,
                      description: simulatedAdUnit.id,
                      ctaLabel: "Sponsor Direct CTA Button",
                      action: () => {
                        addSyncLog("admob", `[AdMob Demo] Shield Verified: User proceeded with ad match for format ${simulatedAdUnit.format}`);
                        onTriggerNotification("Interactive Demo Ad Opened", "Verified ad transition logged correctly.");
                      }
                    });
                  } else {
                    addSyncLog("admob", `[Demo Interstitial] User clicked advertiser CTA: ${simulatedAdUnit.format}`);
                    onTriggerNotification("Interactive Demo Ad Clicked", "Connection established with demo advertiser domain.");
                  }
                }}
                className="z-10 w-full mt-2 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[9px] rounded-lg transition cursor-pointer"
              >
                Visit Demo Advertiser Site
              </button>
            </div>

            {/* Explanation of 100% Screen coverage */}
            <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-md text-left text-[8px] leading-relaxed text-amber-300">
              <span className="font-extrabold text-amber-400 block mb-0.5">💡 AdMob Guideline: 100% Screen Coverage</span>
              Unlike banners, full-screen overlay formats (App Open, Interstitial, and Rewarded Ads) **must cover 100% of the active mobile viewport** to prevent overlapping view bugs, click-hijacking, or layout truncation. Resizing, squeezing, or splitting these formats is a direct violation of AdMob Integration Policy.
            </div>
          </div>

          {/* Footer Controls */}
          <div className="space-y-1.5 text-center">
            {simulatedAdTimer > 0 ? (
              <button 
                disabled 
                className="w-full py-2 bg-slate-900 border border-slate-850 text-slate-600 text-[10px] font-bold rounded-md cursor-not-allowed text-center"
              >
                🔒 Locked: Skip available in {simulatedAdTimer}s
              </button>
            ) : (
              <button 
                onClick={() => {
                  const grantReward = ["Rewarded Ads", "Rewarded Interstitial"].includes(simulatedAdUnit.format);
                  if (grantReward) {
                    setCredits(c => c + 100);
                    addSyncLog("admob", `[AdMob] Mock demo payout validated (+100 Tokens credited cleanly for format: ${simulatedAdUnit.format}).`);
                    onTriggerNotification("Reward Granted!", "Demo rewarded conversion logged safely! +100 tokens added.");
                  } else {
                    addSyncLog("admob", `[AdMob] Interstitial demo container skipped by user.`);
                  }
                  setSimulatedAdUnit(null);
                  setSimulatedAdTimer(5);
                }}
                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-[10px] rounded-md transition cursor-pointer text-center"
              >
                Cancel Demo & Return
              </button>
            )}

            <p className="text-[7px] text-slate-600 text-center font-mono uppercase tracking-widest">
              GOOGLE TESTING PLATFORM • GOOGLE PLAY COMPLIANCE
            </p>
          </div>
        </div>
      )}

      {/* 100% Gated Accidental Click Shield Modal Overlay */}
      {clickShieldActive && (
        <div className="absolute inset-0 z-[95] bg-slate-950/98 backdrop-blur-lg rounded-[52px] flex flex-col justify-between p-6 select-none animate-fade-in text-left">
          {/* Header */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-wider">
            <span className="flex items-center gap-1.5 text-amber-500">
              <AlertCircle className="h-3 w-3 text-amber-400 stroke-[2.5]" />
              <span className="font-extrabold uppercase font-sans tracking-wide">Accidental Click Shield</span>
            </span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">
              Gated Mode
            </span>
          </div>

          {/* Body content */}
          <div className="flex-1 flex flex-col justify-center space-y-4 my-2">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="h-7 w-7 animate-pulse text-amber-400" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="text-xs font-extrabold text-slate-100">Confirm Your Ad Request</h4>
              <p className="text-[9px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Google Quality Guidelines protect advertisers from accidental clicks near high-frequency touch zones and scrolling list-boxes.
              </p>
            </div>

            <div className="p-3 bg-slate-900 border border-slate-850 rounded-md space-y-1.5 font-mono text-[7px] text-slate-400 leading-normal">
              <span className="text-slate-300 font-bold block">INTENDED MATCH DETAILS:</span>
              <div>• Destination Event: <span className="text-blue-400">{clickShieldActive.title}</span></div>
              <div className="truncate text-slate-500 overflow-hidden leading-relaxed max-w-[240px]">• Publisher Unit Resource: <span className="text-amber-500 select-all font-mono block truncate">{clickShieldActive.description}</span></div>
              <div>• Protected Target Format: <span className="text-slate-200">{clickShieldActive.ctaLabel}</span></div>
            </div>
            
            <div className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-md text-[7.5px] text-blue-450 leading-normal">
              <span className="font-bold text-blue-300 block mb-0.5">ℹ️ Tap Spacing Safeguard</span>
              Adding custom gating is highly recommended for mobile layouts when banners are placed near high-frequency scroll containers.
            </div>
          </div>

          {/* Footer actions */}
          <div className="space-y-2">
            <button
              onClick={() => {
                const actionToRun = clickShieldActive.action;
                setClickShieldActive(null);
                actionToRun();
              }}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-extrabold text-[10px] rounded-md transition cursor-pointer text-center block"
            >
              ✓ Confirm Intent & Continue
            </button>
            <button
              onClick={() => {
                addSyncLog("admob", `[Shield] Guard blocked potential accidental tap on event: ${clickShieldActive.title}`);
                onTriggerNotification("Interactive Guard Triggered", "Saved from accidental ad redirect.");
                setClickShieldActive(null);
              }}
              className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 font-bold text-[10px] rounded-md transition cursor-pointer text-center block"
            >
              ✗ Cancel & Return back
            </button>
          </div>
        </div>
      )}

      {/* PHONE CONSOLE SHELL CONTAINER */}
      <div className={`relative w-[345px] h-[705px] mx-auto rounded-[52px] border-[10px] ${darkMode ? "border-slate-800 bg-slate-950 text-white" : "border-slate-250 bg-slate-50 text-slate-950"} overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-colors duration-500`}>
        
        {/* Mobile Navigation Drawer Overlay */}
        {isAuthenticated && isMenuOpen && (
          <div 
            className={`absolute inset-0 ${darkMode ? "bg-slate-950/80" : "bg-slate-900/35"} backdrop-blur-sm z-50 transition-all duration-300`}
            onClick={() => setIsMenuOpen(false)}
          >
            <div 
              className={`absolute top-0 left-0 bottom-0 w-[250px] ${darkMode ? "bg-slate-950/95 border-slate-800" : "bg-white border-slate-200"} border-r p-5 space-y-5 shadow-2xl flex flex-col justify-between animate-slide-right text-left`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                {/* Header brand details */}
                <div className={`flex justify-between items-center pb-3 border-b ${darkMode ? "border-slate-900" : "border-slate-150"}`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-0.5 rounded-lg ${darkMode ? "bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border-slate-800" : "bg-gradient-to-tr from-slate-50 via-white to-slate-100 border-slate-200"}`}>
                      <WeoVibeLogo className="h-6 w-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-display font-black text-xs text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-amber-500 block tracking-wide">WeoVibe AI</span>
                      <span className={`text-[8px] ${darkMode ? "text-slate-500" : "text-slate-400"} block uppercase font-mono font-bold leading-none mt-0.5`}>COMPANION HUB</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-1 ${darkMode ? "hover:bg-slate-900 text-slate-400 hover:text-white border-transparent hover:border-slate-800" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-transparent hover:border-slate-200"} rounded-lg transition border cursor-pointer`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Main page tabs list */}
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab("dashboard");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition ${
                      activeTab === "dashboard" 
                        ? (darkMode ? "bg-blue-600/20 border-blue-500/30 text-white font-bold" : "bg-blue-50 border-blue-200 text-blue-700 font-bold") 
                        : (darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100")
                    } border border-transparent cursor-pointer`}
                  >
                    <LayoutGrid className="h-4 w-4 text-blue-500" />
                    <span>📊 Pipeline Overview</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveTab("studio");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition ${
                      activeTab === "studio" 
                        ? (darkMode ? "bg-amber-600/20 border-amber-500/30 text-white font-bold" : "bg-amber-50 border-amber-200 text-amber-700 font-bold") 
                        : (darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100")
                    } border border-transparent cursor-pointer`}
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>✨ Creative Studio</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("sync");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition ${
                      activeTab === "sync" 
                        ? (darkMode ? "bg-emerald-600/20 border-emerald-500/30 text-white font-bold" : "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold") 
                        : (darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100")
                    } border border-transparent cursor-pointer`}
                  >
                    <RefreshCw className="h-4 w-4 text-emerald-500" />
                    <span>🔄 Handshake Logs</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("settings");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition ${
                      activeTab === "settings" 
                        ? (darkMode ? "bg-indigo-600/20 border-indigo-500/30 text-white font-bold" : "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold") 
                        : (darkMode ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900" : "text-slate-600 hover:text-slate-950 hover:bg-slate-100")
                    } border border-transparent cursor-pointer`}
                  >
                    <Settings className="h-4 w-4 text-indigo-500" />
                    <span>⚙️ System Config</span>
                  </button>
                </div>

                {/* Fast actions */}
                <div className={`pt-3 border-t ${darkMode ? "border-slate-900" : "border-slate-150"} space-y-2`}>
                  <span className={`text-[9px] font-bold ${darkMode ? "text-slate-500" : "text-slate-400"} uppercase tracking-widest block px-1`}>Integrations & Tests</span>
                  
                  <button
                    onClick={() => {
                      triggerAdMobReward();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs transition cursor-pointer font-bold text-left ${
                      darkMode 
                        ? "bg-slate-900/40 border border-slate-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20" 
                        : "bg-amber-50 border border-amber-200/60 text-amber-700 hover:bg-amber-100/50"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>Unlock Free Tokens</span>
                  </button>

                  <button
                    onClick={() => {
                      handleDeviceSync();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs transition cursor-pointer font-bold text-left ${
                      darkMode 
                        ? "bg-slate-900/40 border border-slate-800 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20" 
                        : "bg-blue-50 border border-blue-200/60 text-blue-700 hover:bg-blue-105/50"
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Trigger VibeSync now</span>
                  </button>
                </div>
              </div>

              {/* Drawer footer close logic */}
              <div className={`pt-4 border-t ${darkMode ? "border-slate-900" : "border-slate-150"} flex flex-col gap-2`}>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full py-2.5 border font-bold rounded-md text-xs transition cursor-pointer text-center ${
                    darkMode 
                      ? "border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-450" 
                      : "border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-rose-600"
                  }`}
                >
                  Unlink Device Node
                </button>
                <div className={`text-[8px] ${darkMode ? "text-slate-600" : "text-slate-400"} mt-1 font-mono text-center`}>
                  Device ID: VEO-PWA-NODE-3000
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notch / Speaker bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-800 rounded-b-2xl z-40 flex items-center justify-center">
          {/* Subtle Speaker & Camera lens mimic */}
          <div className="w-16 h-1 bg-slate-700 rounded-full" />
          <div className="w-3 h-3 bg-slate-900 border border-slate-700 rounded-full ml-3" />
        </div>

        {/* Home Screen Status Indicator Panel */}
        <div className={`h-11 px-6 pt-3 flex justify-between items-center text-[11.5px] font-semibold tracking-wider font-mono opacity-80 z-20 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          <span>9:41 AM</span>
          <div className="flex items-center gap-1.5">
            <Smartphone className={`h-3.5 w-3.5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            {isSyncing ? (
              <span className={`text-[10px] font-bold animate-sync-breathe ${darkMode ? "text-blue-400" : "text-blue-600"} select-none`}>
                ● SYNCING
              </span>
            ) : (
              <span className={`text-[10px] font-bold pulse-beacon ${darkMode ? "text-green-400" : "text-emerald-600"}`}>● SYNC</span>
            )}
            <div className={`w-4 h-2.5 border rounded-sm p-[1px] flex items-center ${darkMode ? "border-slate-700" : "border-slate-400"}`}>
              <div className="w-full h-full bg-current rounded-2xs" />
            </div>
          </div>
        </div>

        {/* APP CONTENT SCROLL PORT PORTAL */}
        <AdMobPointerGuard 
          showInterstitial={showInterstitial}
          isWatchingRewardedAd={isWatchingRewardedAd}
          simulatedAdUnit={simulatedAdUnit}
          interstitialExportProject={interstitialExportProject}
          exportStage={exportStage}
          className={`h-[555px] overflow-y-auto px-4 pt-2 animate-fade-in transition-all ${
            simulatedBannerActive 
              ? (bannerPaddingEnabled ? "pb-[110px]" : "pb-24") 
              : "pb-14"
          }`}
        >
          
          {/* SECURE AUTHENTICATION RE-GATE */}
          {!isAuthenticated ? (
            <div className="py-4 px-2 text-center flex flex-col justify-center h-full">
              <div className="mx-auto p-4 bg-blue-500/10 text-blue-500 rounded-lg w-fit mb-4">
                <Lock className="h-10 w-10 animate-pulse" />
              </div>
              <h3 className={`text-xl font-display font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>Secure Companion Sync</h3>
              <p className={`text-xs mt-2 mb-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Connect your account to access real-time desk synchronization and rendering outputs.
              </p>

              <form onSubmit={handleAuthSubmit} className="space-y-3 text-left">
                <div>
                  <label className={`text-[10px] font-bold tracking-wider uppercase ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Sync Username</label>
                  <input 
                    type="text" 
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    required
                    className={`w-full mt-1 p-3 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition ${
                      darkMode 
                        ? "bg-slate-900 border-slate-800 text-white" 
                        : "bg-white border-slate-200 text-slate-805"
                    }`}
                  />
                </div>
                <div>
                  <label className={`text-[10px] font-bold tracking-wider uppercase ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Security Token</label>
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                    className={`w-full mt-1 p-3 rounded-lg text-sm focus:border-blue-500 focus:outline-none transition ${
                      darkMode 
                        ? "bg-slate-900 border-slate-800 text-white" 
                        : "bg-white border-slate-200 text-slate-805"
                    }`}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rainbow-glow-btn text-white font-bold rounded-lg text-sm transition mt-4 cursor-pointer"
                >
                  {isLoggingIn ? "Establishing Handshake..." : "Link Active Device"}
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* BRAND HEADER & METRICS SUMMARY */}
              <div className="flex justify-between items-center mb-4 text-left">
                <div className="flex items-center gap-2 max-w-[70%]">
                  {/* Left Menu Hamburger Button */}
                  <button 
                    onClick={() => setIsMenuOpen(true)}
                    className={`p-1 px-1.5 border transition rounded-lg cursor-pointer shrink-0 ${
                      darkMode 
                        ? "hover:bg-slate-900/80 hover:border-slate-800 text-slate-400 hover:text-slate-200 border-transparent" 
                        : "hover:bg-slate-105 hover:border-slate-300 text-slate-700 bg-slate-100 hover:text-slate-950 border-slate-200 shadow-xs"
                    }`}
                    title="Open Sidebar"
                  >
                    <Menu className="h-4 w-4" />
                  </button>

                  {/* Left Logo SVG Visual */}
                  <div className={`shrink-0 flex items-center justify-center p-0.5 rounded-lg shadow-md border ${
                    darkMode 
                      ? "bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border-slate-800/80" 
                      : "bg-gradient-to-tr from-white via-slate-50 to-slate-100 border-slate-200"
                  }`}>
                    <WeoVibeLogo className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <span className={`text-[9px] font-bold uppercase tracking-wider block truncate ${darkMode ? "text-blue-500" : "text-blue-600"}`}>Companion Suite</span>
                    <div className="flex items-center gap-1">
                      <span className={`font-display font-black text-sm block truncate text-transparent bg-clip-text bg-gradient-to-r ${
                        darkMode ? "from-blue-400 to-indigo-500" : "from-blue-600 to-indigo-700"
                      }`}>WeoVibe AI</span>
                      <span className={`px-1 py-0.2 text-[7px] rounded uppercase font-bold shrink-0 ${
                        darkMode ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-650 border border-blue-100"
                      }`}>v3.1</span>
                    </div>
                  </div>
                </div>
                
                {/* Sync status button */}
                <button 
                  onClick={handleDeviceSync} 
                  disabled={isSyncing}
                  className={`p-2 rounded-md border ${
                    isSyncing 
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400 animate-spin" 
                      : (darkMode ? "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-400" : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-sm")
                  } transition cursor-pointer`}
                  title="Force Synchronize with Desktop"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {/* TAB VIEWS */}
              {activeTab === "dashboard" && (
                <div className="space-y-4">
                  {/* Account Wallet Cards with magnificent AI-glow */}
                  <div className={`p-4 rounded-lg border relative overflow-hidden rainbow-glow-card ${
                    darkMode 
                      ? "bg-gradient-to-tr from-slate-900/60 via-slate-950/40 to-slate-950 border-blue-500/10 text-slate-50" 
                      : "bg-white border-slate-200 shadow-md shadow-slate-100/55 text-slate-900"
                  }`}>
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/15 rounded-full blur-3xl" />
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-xs flex items-center gap-1 ${darkMode ? "text-slate-400" : "text-slate-650 font-bold"}`}>
                          <HardDrive className={`h-3.5 w-3.5 ${darkMode ? "text-blue-400" : "text-blue-650"}`} /> Active Render Credits
                        </span>
                        <div className={`text-3xl font-display font-extrabold mt-1 ${darkMode ? "text-slate-50" : "text-slate-950"}`}>
                          {credits} <span className={`text-xs font-normal ${darkMode ? "text-slate-400" : "text-slate-505"}`}>tokens</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                        isPremium 
                          ? (darkMode ? "bg-amber-500/15 text-amber-400 border-amber-500/35" : "bg-amber-50 text-amber-700 border-amber-250") 
                          : (darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200")
                      }`}>
                        {isPremium ? "PRO CREATOR" : "STARTER"}
                      </span>
                    </div>

                    <div className={`mt-4 pt-4 border-t flex justify-between items-center text-[10px] ${
                      darkMode ? "border-slate-900 text-slate-400" : "border-slate-150 text-slate-605"
                    }`}>
                      <span>Syncing with Safari Mac M3</span>
                      <button 
                        onClick={triggerAdMobReward}
                        className={`font-bold flex items-center gap-1 uppercase cursor-pointer ${
                          darkMode ? "text-amber-400 hover:underline" : "text-amber-600 hover:underline hover:text-amber-700"
                        }`}
                      >
                        <Zap className="h-3 w-3" /> Get free tokens
                      </button>
                    </div>
                  </div>

                  {/* ADMOB INTEGRATION BANNER mimic (Acts as simulated advertisement in Free Tier, removable in premium) */}
                  {!isPremium && (
                    <div className={`p-2 border rounded-lg flex items-center justify-between text-left relative overflow-hidden transition-all duration-300 ${
                      darkMode ? "border-slate-800/80 bg-slate-900/40 text-slate-300" : "border-slate-200 bg-white shadow-xs shadow-slate-200/40 text-slate-900"
                    }`} id="admob-simulator-banner">
                      <div className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] rounded-bl font-mono font-bold ${
                        darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500 border-l border-b border-slate-200"
                      }`}>AdMob Sponsor</div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md flex items-center justify-center text-xs font-bold text-slate-950 font-mono scale-90">Ad</div>
                        <div>
                          <div className={`text-[11px] font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Generate Videos Faster?</div>
                          <div className={`text-[9px] ${darkMode ? "text-slate-400" : "text-slate-605"}`}>Watch short rewarded segment to skip rendering queues</div>
                        </div>
                      </div>
                      <button 
                        onClick={triggerAdMobReward}
                        className={`py-1 px-3 text-[10px] font-bold rounded-lg transition cursor-pointer ${
                          darkMode ? "bg-slate-800 hover:bg-slate-700 text-amber-400" : "bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-200"
                        }`}
                      >
                        Launch Ad
                      </button>
                    </div>
                  )}

                  {/* ACTIVE PIPELINE / MILESTONES */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-655"}`}>Mobile Job Pipelines</span>
                      <button 
                        onClick={() => setIsCreatingProject(true)}
                        className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer ${darkMode ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"}`}
                      >
                        <Plus className="h-3.5 w-3.5" /> New Vibe
                      </button>
                    </div>

                    {isCreatingProject && (
                      <form onSubmit={handleCreateProject} className={`p-3 rounded-lg border space-y-2.5 transition ${
                        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-150"
                      }`}>
                        <div className={`text-xs font-bold ${darkMode ? "text-slate-300" : "text-slate-800"}`}>Assemble Render Job</div>
                        <input 
                          type="text" 
                          placeholder="Project title (e.g., Space Beat Drop)" 
                          required
                          value={newProjName}
                          onChange={(e) => setNewProjName(e.target.value)}
                          className={`w-full p-2 border rounded-lg text-xs focus:outline-none focus:border-blue-500 transition ${
                            darkMode ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                          }`}
                        />
                        <textarea 
                          placeholder="Google Veo Cinematic Prompts..."
                          value={newProjPrompt}
                          onChange={(e) => setNewProjPrompt(e.target.value)}
                          className={`w-full p-2 h-16 border rounded-lg text-xs focus:outline-none focus:border-blue-500 resize-none transition ${
                            darkMode ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600" : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white"
                          }`}
                        />
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <span className={`block ${darkMode ? "text-slate-500" : "text-slate-600 font-bold"}`}>Aspect Ratio</span>
                            <select 
                              value={newProjAspect}
                              onChange={(e) => setNewProjAspect(e.target.value)}
                              className={`w-full p-2 border rounded text-xs mt-0.5 focus:outline-none focus:border-blue-500 transition ${
                                darkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-705"
                              }`}
                            >
                              <option value="16:9">16:9 Landscape</option>
                              <option value="9:16">9:16 vertical short</option>
                              <option value="1:1">1:1 square card</option>
                              <option value="21:9">21:9 ultra cinematic</option>
                            </select>
                          </div>
                          <div>
                            <span className={`block ${darkMode ? "text-slate-500" : "text-slate-600 font-bold"}`}>Video Size Format</span>
                            <select 
                              value={newProjSize} 
                              onChange={(e) => setNewProjSize(e.target.value)}
                              className={`w-full p-2 border rounded text-xs mt-0.5 focus:outline-none focus:border-blue-500 transition ${
                                darkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-750"
                              }`}
                            >
                              <option value="1K">1K Standard HD</option>
                              <option value="2K">2K Quad Detail</option>
                              <option value="4K">4K Studio cinematic (Paid Pro)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          <button 
                            type="button" 
                            onClick={() => setIsCreatingProject(false)}
                            className={`px-3 py-1 text-[10px] rounded-lg cursor-pointer border transition ${
                              darkMode ? "text-slate-400 hover:text-slate-300 border-slate-800" : "text-slate-600 hover:text-slate-900 bg-slate-55 border-slate-200 hover:bg-slate-100 shadow-3xs"
                            }`}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-3 py-1 text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer"
                          >
                            Assemble & Sync
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="space-y-2">
                      {projects.map(p => (
                        <div 
                          key={p.id} 
                          className={`p-3 rounded-lg border flex items-center justify-between gap-2.5 transition group ${
                            darkMode ? "bg-slate-900 hover:bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 hover:bg-slate-50/50 shadow-sm shadow-slate-100/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0" onClick={() => onSelectProject(p)}>
                            <div className={`w-11 h-11 rounded-md overflow-hidden relative flex-shrink-0 flex items-center justify-center border ${
                              darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
                            }`}>
                              {p.status === "completed" ? (
                                <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Cpu className={`h-5 w-5 ${p.status === "processing" ? "text-blue-400 animate-spin" : "text-slate-550"}`} />
                              )}
                              {p.status === "processing" && (
                                <div className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold font-mono ${
                                  darkMode ? "bg-slate-950/70 text-blue-400" : "bg-slate-900/10 text-white"
                                }`}>
                                  {p.progress}%
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={`text-[11px] font-bold truncate ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{p.name}</div>
                              <p className={`text-[9px] truncate mt-0.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{p.prompt}</p>
                              
                              {/* Status Indicators */}
                              <div className="flex gap-1.5 items-center mt-1 text-[8px] font-mono">
                                <span className={`px-1.5 py-0.2 rounded uppercase font-extrabold border ${
                                  p.status === "completed" ? (darkMode ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-50 text-green-700 border-green-200") : 
                                  p.status === "processing" ? (darkMode ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-750 border-blue-200") :
                                  (darkMode ? "bg-slate-800 text-slate-400 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200")
                                }`}>
                                  {p.status}
                                </span>
                                <span className={`text-[8px] ${darkMode ? "text-slate-500" : "text-slate-500 font-bold"}`}>{p.aspect} • {p.size}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-between self-stretch">
                            <button 
                              onClick={() => handleDeleteProject(p.id, p.name)}
                              className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            
                            {p.status === "queued" && (
                              <button 
                                onClick={() => handleStartRender(p.id)}
                                className="px-2 py-0.5 rainbow-glow-btn text-[9px] font-bold rounded-lg text-white transition flex items-center gap-0.5 cursor-pointer"
                              >
                                <Play className="h-1.5 w-1.5 fill-current" /> Render
                              </button>
                            )}

                            {p.status === "completed" && (
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const pubUrl = `${window.location.origin}/share/${p.id}`;
                                    if (navigator.clipboard) {
                                      navigator.clipboard.writeText(pubUrl).catch(() => {});
                                    } else {
                                      const textarea = document.createElement("textarea");
                                      textarea.value = pubUrl;
                                      document.body.appendChild(textarea);
                                      textarea.select();
                                      document.execCommand("copy");
                                      document.body.removeChild(textarea);
                                    }
                                    addSyncLog("system", `Copied public link from mobile simulator pipeline: ${pubUrl}`);
                                    onTriggerNotification(
                                      "Public Link Copied", 
                                      `Shareable link for [${p.name}] is copied to clipboard!`
                                    );
                                  }}
                                  className={darkMode ? VEOVIBE_THEME.buttons.copyPublicLinkMobile.dark : VEOVIBE_THEME.buttons.copyPublicLinkMobile.light}
                                  title="Copy Public Link"
                                >
                                  <Copy className="h-2 w-2" /> Link
                                </button>

                                <button 
                                  onClick={() => handleTriggerExportAd(p)}
                                  className={`px-2 py-0.5 text-[9px] font-bold rounded-lg border transition-colors flex items-center gap-0.5 cursor-pointer ${
                                    darkMode 
                                      ? "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400" 
                                      : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700 shadow-3xs"
                                  }`}
                                >
                                  <Share2 className="h-2 w-2" /> Export
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PREMIUM DASHBOARD ANALYTICS PREVIEW (Recharts style but fully customized high-fidelity inline visual charts) */}
                  <div className={`p-3.5 rounded-lg border ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                  }`}>
                    <div className="flex justify-between items-center mb-2.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Sync & AdMob Revenue Stats</span>
                      {isSyncing ? (
                        <span className={`text-[8px] font-mono flex items-center gap-1 animate-sync-breathe font-bold uppercase ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" /> Syncing Active
                        </span>
                      ) : (
                        <span className={`text-[8px] font-mono flex items-center gap-1 animate-pulse font-bold uppercase ${
                          darkMode ? "text-green-400" : "text-emerald-600"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Live Synchronized
                        </span>
                      )}
                    </div>

                    {/* Chart lines mimics */}
                    <div className="space-y-2 mt-2 text-left">
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className={`${darkMode ? "text-slate-400" : "text-slate-600"}`}>AdMob click CPM ($ / view)</span>
                          <span className={`font-bold font-mono ${darkMode ? "text-blue-400" : "text-blue-600"}`}>$21.43 <span className="text-green-500 text-[8px] font-bold">+3.2%</span></span>
                        </div>
                        {/* Custom visual progress trend bar chart line */}
                        <div className={`h-3 rounded-full overflow-hidden p-[2px] flex ${darkMode ? "bg-slate-950" : "bg-slate-100"}`}>
                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-505 rounded-full transition-all duration-1000 w-[84%]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className={`${darkMode ? "text-slate-400" : "text-slate-600"}`}>Real-Time Core Queue CPU Loads</span>
                          <span className={`font-bold font-mono ${darkMode ? "text-cyan-400" : "text-cyan-600"}`}>23,490 GigaFLOPS</span>
                        </div>
                        <div className={`h-3 rounded-full overflow-hidden p-[2px] ${darkMode ? "bg-slate-950" : "bg-slate-100"}`}>
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-505 rounded-full transition-all duration-1000 w-[61%]" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Footnote information */}
                    <div className={`mt-3 text-[9px] leading-normal border-t pt-2 flex justify-between items-center ${
                      darkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-500"
                    }`}>
                      <span>Server Handshakes: 34 ms latency</span>
                      <span className={`underline cursor-pointer ${
                        darkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-900 font-bold"
                      }`}>View Server Analytics</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STUDIO WRAPPER TAB INSIDE MOBILE COMPANION */}
              {activeTab === "studio" && (
                <div className="space-y-3.5 pb-2">
                  {/* Elegant Top Header with Minimal Spacing */}
                  <div className={`text-center py-3.5 px-4 border rounded-lg ${
                    darkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-100/60 border-slate-200"
                  }`}>
                    <Sparkles className="h-7 w-7 text-blue-500 mx-auto mb-1.5 animate-pulse" />
                    <div className={`text-xs font-bold leading-none ${darkMode ? "text-slate-100" : "text-slate-800"}`}>Companion Sandbox Studio</div>
                    <p className={`text-[9.5px] max-w-[250px] mx-auto mt-1 leading-normal ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                      Preview and test fully functional components optimized for compliance.
                    </p>
                  </div>

                  {/* Sub tab navigation */}
                  <div className={`grid grid-cols-3 gap-1 p-0.5 rounded-md border ${
                    darkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-100 border-slate-200/80"
                  }`}>
                    <button 
                      onClick={() => setStudioSubtab("inputs")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                        studioSubtab === "inputs"
                          ? (darkMode ? "bg-blue-600 text-white shadow" : "bg-white text-slate-900 border border-slate-200 shadow-2xs font-extrabold")
                          : (darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-950")
                      }`}
                    >
                      <ImageIcon className="h-3 w-3" />
                      Inputs
                    </button>
                    <button 
                      onClick={() => setStudioSubtab("media")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                        studioSubtab === "media"
                          ? (darkMode ? "bg-blue-600 text-white shadow" : "bg-white text-slate-900 border border-slate-200 shadow-2xs font-extrabold")
                          : (darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-950")
                      }`}
                    >
                      <Video className="h-3 w-3" />
                      Media
                    </button>
                    <button 
                      onClick={() => setStudioSubtab("monetize")}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                        studioSubtab === "monetize"
                          ? (darkMode ? "bg-blue-600 text-white shadow" : "bg-white text-slate-900 border border-slate-200 shadow-2xs font-extrabold")
                          : (darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-950")
                      }`}
                    >
                      <Award className="h-3 w-3" />
                      Promo
                    </button>
                  </div>

                  {/* 1. INPUTS HUB SUBTAB */}
                  {studioSubtab === "inputs" && (
                    <div className="space-y-3.5">
                      {/* Dropdowns card (Native and Custom) */}
                      <div className={`p-3 border rounded-lg text-left space-y-2.5 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Dropdown Configurations</span>
                          <span className="text-[8.5px] bg-blue-500/10 text-blue-500 px-1.5 py-0.2 rounded font-mono font-bold">Accessible</span>
                        </div>
                        
                        <div className="space-y-1">
                          <label className={`text-[9px] font-bold block ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Active Sync Preset</label>
                          <div className="relative">
                            <select 
                              value={selectedDropdownValue}
                              onChange={(e) => {
                                setSelectedDropdownValue(e.target.value);
                                addSyncLog("system", `Active Sync Preset changed to: ${e.target.value}`);
                              }}
                              className={`w-full p-2 pr-8 border rounded-lg text-xs appearance-none cursor-pointer focus:outline-none focus:border-blue-500 transition-all font-semibold ${
                                darkMode 
                                  ? "bg-slate-950 border-slate-800 text-slate-100" 
                                  : "bg-slate-50 border-slate-200 text-slate-900"
                              }`}
                            >
                              <option value="optimized">High-Performance (Payload SHA-256)</option>
                              <option value="lightweight">Lightweight Stream (Zero-Lag)</option>
                              <option value="safe-backup">Periodic Lazy-Check Backup</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none stroke-[2.5]" />
                          </div>
                        </div>

                        <div className="space-y-1 relative">
                          <label className={`text-[9px] font-bold block ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Audio Equalizer Preset</label>
                          <button
                            onClick={() => setCustomDropdownOpen(!customDropdownOpen)}
                            className={`w-full flex justify-between items-center p-2 border rounded-lg text-xs font-semibold cursor-pointer transition ${
                              darkMode 
                                ? "bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-100" 
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900"
                            }`}
                          >
                            <span>{audioTrackIndex === 0 ? "Ambient Neon Rhythm" : audioTrackIndex === 1 ? "Deep Quartz Drone" : "Synthesized Meadow Vibe"}</span>
                            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${customDropdownOpen ? "rotate-180" : ""}`} />
                          </button>
                          
                          {customDropdownOpen && (
                            <div className={`absolute left-0 right-0 mt-1 p-1 rounded-md border z-50 shadow-xl transition-all duration-205 ${
                              darkMode ? "bg-slate-950 border-slate-800 shadow-slate-950/80" : "bg-white border-slate-200 shadow-slate-200/50"
                            }`}>
                              {[
                                { label: "Ambient Neon Rhythm", idx: 0 },
                                { label: "Deep Quartz Drone", idx: 1 },
                                { label: "Synthesized Meadow Vibe", idx: 2 }
                              ].map((item) => (
                                <button
                                  key={item.idx}
                                  onClick={() => {
                                    setAudioTrackIndex(item.idx);
                                    setCustomDropdownOpen(false);
                                    addSyncLog("system", `Audio preset shifted to index: ${item.idx}`);
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold text-left transition cursor-pointer ${
                                    audioTrackIndex === item.idx
                                      ? (darkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-50 text-blue-800")
                                      : (darkMode ? "text-slate-300 hover:bg-slate-900" : "text-slate-700 hover:bg-slate-50")
                                  }`}
                                >
                                  <span>{item.label}</span>
                                  {audioTrackIndex === item.idx && <Check className="h-3.5 w-3.5 text-blue-500 stroke-[3]" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Image Upload card (supporting Single and Multi Uploads under Usability guidelines) */}
                      <div className={`p-3 border rounded-lg text-left space-y-3 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div>
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Digital Asset Upload Samples</span>
                          <p className={`text-[8px] mt-0.5 leading-normal ${darkMode ? "text-slate-550" : "text-slate-500 font-medium"}`}>Supports drag-and-drop and manual selections beautifully.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {/* Single upload module */}
                          <div className="space-y-1.5">
                            <label className={`text-[9px] font-bold block ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Single Icon/Photo Upload</label>
                            
                            {!singleImage ? (
                              <div 
                                onClick={() => {
                                  addSyncLog("system", "Simulating Single File selection workflow.");
                                  setSingleImage({
                                    name: "vibe_map_render_1.png",
                                    size: "189 KB",
                                    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60"
                                  });
                                  addSyncLog("system", "File validation matches signature. Upload finalized (+1 single preview slot).");
                                  onTriggerNotification("File Upload Complete", "vibe_map_render_1.png is saved in cache.");
                                }}
                                className={`border border-dashed rounded-md p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-blue-500/50 ${
                                  darkMode ? "bg-slate-950/40 border-slate-800 hover:bg-slate-950/80" : "bg-slate-50 border-slate-300 hover:bg-white"
                                }`}
                              >
                                <ImageIcon className="h-5 w-5 text-slate-400 mb-1" />
                                <span className={`text-[9px] font-bold block ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Click or drag image here</span>
                                <span className="text-[7.5px] text-slate-505 block font-mono">PNG/JPG assets up to 5MB</span>
                              </div>
                            ) : (
                              <div className={`p-2 border rounded-md flex items-center justify-between gap-2 ${
                                darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                              }`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <img src={singleImage.url} alt="upload preview" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                                  <div className="min-w-0">
                                    <span className={`text-[9px] font-bold block truncate max-w-[140px] ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{singleImage.name}</span>
                                    <span className="text-[8px] text-slate-500 font-mono block">{singleImage.size}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => {
                                    setSingleImage(null);
                                    addSyncLog("system", "Single cover image deleted from sandbox slots.");
                                  }}
                                  className={`p-1 hover:text-rose-500 transition cursor-pointer shrink-0 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Multi upload module */}
                          <div className="space-y-1.5 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-center">
                              <label className={`text-[9px] font-bold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Multi-Asset Manager</label>
                              <button 
                                onClick={() => {
                                  const indexNum = multipleImages.length + 1;
                                  const nameList = ["launcher_icon_dark.png", "concept_sheet_v2.png", "spectrum_schema.png", "audio_payout_ticket.png"];
                                  const matchName = nameList[(indexNum - 1) % nameList.length];
                                  const imgUrls = [
                                    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=150&auto=format&fit=crop&q=60",
                                    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150&auto=format&fit=crop&q=60"
                                  ];
                                  const extraImage = {
                                    id: `img-${Date.now()}`,
                                    name: matchName,
                                    size: `${Math.floor(Math.random() * 190) + 45} KB`,
                                    url: imgUrls[(indexNum - 1) % imgUrls.length]
                                  };
                                  setMultipleImages(prev => [...prev, extraImage]);
                                  addSyncLog("system", `Multi-upload pipeline: registered ${extraImage.name}`);
                                }}
                                className="text-[8px] text-blue-500 font-extrabold hover:underline cursor-pointer"
                              >
                                + Simulate Queue File
                              </button>
                            </div>

                            <div className="h-[48px] overflow-x-auto overflow-y-hidden flex gap-2 pb-1 pr-1">
                              {multipleImages.length === 0 ? (
                                <div className={`w-full flex items-center justify-center border border-dashed rounded-md py-2 ${
                                  darkMode ? "border-slate-805 text-slate-500" : "border-slate-300 text-slate-400"
                                }`}>
                                  <span className="text-[8px] font-mono select-none">Queue is empty</span>
                                </div>
                              ) : (
                                multipleImages.map(img => (
                                  <div 
                                    key={img.id} 
                                    className={`flex-shrink-0 w-24 p-1 border rounded-lg flex items-center gap-1.5 relative ${
                                      darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                                    }`}
                                  >
                                    <img src={img.url} alt="thumbnail" className="w-6 h-6 rounded object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                                    <div className="min-w-0 flex-1">
                                      <span className={`text-[7.5px] font-bold block truncate max-w-[50px] ${darkMode ? "text-slate-300" : "text-slate-800"}`}>{img.name}</span>
                                      <span className="text-[6.5px] text-slate-550 font-mono block leading-none">{img.size}</span>
                                    </div>
                                    <button 
                                      onClick={() => {
                                        setMultipleImages(prev => prev.filter(x => x.id !== img.id));
                                        addSyncLog("system", ` Purged ${img.name} from draft queue.`);
                                      }}
                                      className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white p-0.5 rounded-full cursor-pointer shadow"
                                    >
                                      <X className="h-2 w-2 stroke-[3]" />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Button-wise Multi-Choice Options panel with integrated checkmarks */}
                      <div className={`p-3 border rounded-lg text-left space-y-2.5 transition ${
                        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div>
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Option Token Selectors</span>
                          <p className={`text-[8px] mt-0.5 leading-normal ${darkMode ? "text-slate-550" : "text-slate-500 font-medium"}`}>Direct button-wise checkboxes. Click to toggle state.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "bg-sync", title: "Background Sync", desc: "Allow system handshakes" },
                            { id: "compress-logs", title: "Zipped Logs", desc: "Reduce payload weights" },
                            { id: "low-latency", title: "Low Latency", desc: "Prioritize sync buffers" },
                            { id: "secure-lock", title: "Double Lock", desc: "Pre-verifies pay slots" }
                          ].map((opt) => {
                            const isSelected = multiChoiceSelections.includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setMultiChoiceSelections(prev => prev.filter(x => x !== opt.id));
                                    addSyncLog("system", `Option toggled: ${opt.title} disabled`);
                                  } else {
                                    setMultiChoiceSelections(prev => [...prev, opt.id]);
                                    addSyncLog("system", `Option toggled: ${opt.title} enabled`);
                                  }
                                }}
                                className={`p-2 border rounded-md text-left transition relative cursor-pointer group flex flex-col justify-between ${
                                  isSelected 
                                    ? (darkMode ? "bg-blue-600/10 border-blue-500/80 text-blue-400 shadow-lg" : "bg-blue-50/50 border-blue-500 text-blue-805 shadow-xs")
                                    : (darkMode ? "bg-slate-950/45 border-slate-800 text-slate-300 hover:bg-slate-900" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-white")
                                }`}
                              >
                                <div className="flex justify-between items-start w-full gap-1">
                                  <span className="text-[9px] font-bold truncate leading-tight">{opt.title}</span>
                                  <div className={`h-3.5 w-3.5 rounded-md flex items-center justify-center font-mono border transition ${
                                    isSelected 
                                      ? "bg-blue-600 border-blue-600 text-white" 
                                      : (darkMode ? "bg-slate-950 border-slate-700 group-hover:border-slate-500" : "bg-white border-slate-300 group-hover:border-slate-400")
                                  }`}>
                                    {isSelected && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                                  </div>
                                </div>
                                <span className={`text-[7.5px] leading-tight block mt-1 ${isSelected ? (darkMode ? "text-blue-300/80" : "text-blue-600 font-semibold") : "text-slate-500"}`}>
                                  {opt.desc}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Previous Creative Brainstorm widget embedded cleanly at the bottom */}
                      <div className={`p-3 border rounded-lg text-left space-y-2.5 ${
                        darkMode ? "bg-slate-900/40 border-slate-800" : "bg-slate-50/50 border-slate-200"
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Creative Vibe Targets</span>
                          <span className="text-[7.5px] text-slate-500 font-mono">Legacy</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          {["1K", "2K", "4K"].map(sz => (
                            <button 
                              key={sz} 
                              onClick={() => {
                                addSyncLog("system", `Format target changed: size ${sz}`);
                                if (sz === "4K" && !isPremium) {
                                  onTriggerNotification("Pro Sub Required", "4K rendering requires Premium Sub.");
                                }
                              }}
                              className={`py-1 text-[8px] rounded border cursor-pointer font-bold transition ${
                                darkMode 
                                  ? "bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800" 
                                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. MULTIMEDIA HUB SUBTAB */}
                  {studioSubtab === "media" && (
                    <div className="space-y-3.5">
                      {/* Responsive video player block */}
                      <div className={`p-3 border rounded-lg text-left space-y-3 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-400" : "text-slate-550"}`}>Responsive Video Player</span>
                            <div className={`text-[8px] ${darkMode ? "text-slate-500" : "text-slate-550 font-medium"}`}>Supports real-time landscape (16:9) and vertical reels (9:16).</div>
                          </div>
                          
                          <div className={`p-0.5 rounded-md border flex items-center gap-1 transition-all ${
                            darkMode 
                              ? "bg-slate-950 border-slate-800/80" 
                              : "bg-slate-100 border-slate-250 shadow-inner"
                          }`}>
                            {[
                              { id: "16:9", label: "16:9 Wide", icon: Monitor, desc: "Landscape" },
                              { id: "9:16", label: "9:16 Tall", icon: Smartphone, desc: "Portrait" }
                            ].map(item => {
                              const isActive = videoAspect === item.id;
                              const IconComp = item.icon;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    setVideoAspect(item.id as any);
                                    addSyncLog("system", `Active Aspect Ratio updated to: ${item.id}`);
                                    onTriggerNotification("Aspect Flipped", `Video bounds resized to ${item.id}`);
                                  }}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200 select-none ${
                                    isActive
                                      ? (darkMode 
                                          ? "bg-slate-900 border-2 border-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.35)]" 
                                          : "bg-slate-950 border-2 border-indigo-600 text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] animate-pulse"
                                        )
                                      : (darkMode 
                                          ? "border-2 border-transparent text-slate-400 hover:text-white hover:bg-slate-900/60" 
                                          : "border-2 border-transparent text-slate-550 hover:text-slate-950 hover:bg-slate-200/50"
                                        )
                                  }`}
                                >
                                  <div className="relative flex items-center justify-center shrink-0">
                                    <IconComp className={`h-3 w-3 ${isActive ? (darkMode ? "text-blue-400" : "text-emerald-400") : "text-slate-500 opacity-60"}`} />
                                    {isActive && (
                                      <span className="absolute -top-1.5 -right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full border border-slate-950 animate-ping" />
                                    )}
                                  </div>
                                  <div className="text-left leading-none">
                                    <span className="text-[7.5px] font-extrabold block tracking-tight">
                                      {item.id}
                                    </span>
                                    <span className={`text-[6.5px] font-mono block tracking-tight ${isActive ? "text-slate-100 opacity-90" : "text-slate-500"}`}>
                                      {item.desc}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Simulated live video viewport box based on state aspects */}
                        <div className="flex items-center justify-center w-full min-h-[140px] py-1 bg-slate-950/20 dark:bg-slate-950/50 rounded-lg">
                          <div className={`relative bg-black rounded-lg overflow-hidden border border-slate-800 flex flex-col justify-between p-2.5 shadow-lg transition-all duration-300 ${
                            videoAspect === "16:9" ? "w-full aspect-video" : "w-[96px] h-[160px]"
                          }`}>
                            <div className={`absolute inset-0 bg-gradient-to-br from-violet-600/25 via-blue-900/10 to-indigo-600/30 transition-all ${
                              videoPlaying ? "animate-pulse duration-1000" : "opacity-40"
                            }`} />
                            
                            <div className="z-10 flex justify-between items-center text-[7px] text-slate-400 font-mono">
                              <span className="truncate max-w-[60px]">vibe_feed_#{Math.floor(videoProgress * 1.5)}.mp4</span>
                              <span className="bg-red-500 text-white px-1 py-0.1 rounded-2xs font-sans font-bold leading-none">LIVE</span>
                            </div>

                            <div className="z-10 text-center flex flex-col items-center justify-center py-2">
                              {videoPlaying ? (
                                <div className="flex flex-col items-center">
                                  <span className="h-1 w-1 rounded-full bg-red-500 animate-ping mb-1" />
                                  <span className="text-[8px] font-bold text-white tracking-wide font-mono drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                                    {videoProgress < 30 ? "Initializing matrices..." : videoProgress < 75 ? "Aligning spectrums..." : "Master bounce complete!"}
                                  </span>
                                  <span className="text-[6.5px] text-slate-400 font-mono block opacity-80 mt-0.5">
                                    Progress: {Math.floor(videoProgress)}%
                                  </span>
                                </div>
                              ) : (
                                <div 
                                  className="bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition flex items-center justify-center" 
                                  onClick={() => setVideoPlaying(true)}
                                >
                                  <Play className="h-4 w-4 text-white stroke-[3.5]" />
                                </div>
                              )}
                            </div>

                            {/* Timeline Slider element inside player */}
                            <div className="z-10 space-y-1">
                              <div className="flex justify-between items-center text-[6.5px] text-slate-400 font-mono">
                                <span>0:{Math.floor(videoProgress * 0.3).toString().padStart(2, '0')}</span>
                                <span>0:30</span>
                              </div>
                              <div className="relative h-1 bg-slate-800 rounded-full cursor-pointer overflow-hidden">
                                <input 
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={videoProgress}
                                  onChange={(e) => setVideoProgress(parseInt(e.target.value))}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full theme-video-progress" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Player control HUD */}
                        <div className={`p-2 border rounded-md flex items-center justify-between gap-2.5 ${
                          darkMode ? "bg-slate-950 border-slate-805" : "bg-slate-50 border-slate-200"
                        }`}>
                          <button
                            onClick={() => {
                              setVideoPlaying(!videoPlaying);
                              addSyncLog("system", `Simulated Video Player state shifted to: ${!videoPlaying ? "playing" : "paused"}`);
                            }}
                            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
                          >
                            {videoPlaying ? <span className="h-3 w-3 bg-white block rounded-xs" /> : <Play className="h-3 w-3 text-white stroke-[3.5]" />}
                          </button>

                          <div className="flex items-center gap-1.5 flex-1 max-w-[124px]">
                            <button 
                              onClick={() => {
                                setVideoMuted(!videoMuted);
                                addSyncLog("system", `Video sound stream toggled to: ${!videoMuted ? "muted" : "unmuted"}`);
                              }}
                              className={`p-1 hover:text-blue-500 transition cursor-pointer ${darkMode ? "text-slate-400" : "text-slate-605"}`}
                            >
                              {videoMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                            </button>
                            <span className={`text-[8px] font-mono leading-none ${darkMode ? "text-slate-450" : "text-slate-600 font-bold"}`}>
                              {videoMuted ? "SOUND OFF" : "100% VOL"}
                            </span>
                          </div>

                          <span className={`text-[7.5px] font-mono shrink-0 ${darkMode ? "text-slate-550" : "text-slate-500 font-bold"}`}>
                            {videoAspect} Video View
                          </span>
                        </div>
                      </div>

                      {/* Equalized Audio track block */}
                      <div className={`p-3 border rounded-lg text-left space-y-2.5 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Equalizer Audio Player</span>
                            <div className={`text-[8px] ${darkMode ? "text-slate-500" : "text-slate-505 font-medium"}`}>Sleek visual custom spectra. Wave reacts to play state.</div>
                          </div>
                          <span className="text-[8px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.2 rounded font-mono font-bold">Dynamic Spectrum</span>
                        </div>

                        <div className={`p-2 border rounded-md flex items-center gap-2 ${
                          darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}>
                          <div className="h-8 w-8 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[9px] font-black font-mono shadow theme-audio-indicator-rotate">
                            OSC
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[9.5px] font-black truncate block ${darkMode ? "text-slate-200" : "text-slate-900"}`}>
                              {audioTrackIndex === 0 ? "Ambient Neon Rhythm" : audioTrackIndex === 1 ? "Deep Quartz Drone" : "Synthesized Meadow Vibe"}
                            </span>
                            <span className="text-[7.5px] text-slate-500 block font-mono">Companion Synth Audio System</span>
                          </div>
                        </div>

                        {/* Interactive bouncing column wave */}
                        <div className={`h-10 rounded-md flex items-end justify-center gap-[2.5px] px-3 py-1.5 border overflow-hidden ${
                          darkMode ? "bg-slate-950/80 border-slate-800" : "bg-slate-50/70 border-slate-200"
                        }`}>
                          {eqWaves.map((h, i) => (
                            <div 
                              key={i} 
                              className={`w-[4.5px] rounded-full transition-all duration-300 bg-gradient-to-t theme-eq-bar-${i} ${
                                darkMode 
                                  ? "from-indigo-600 via-blue-500 to-cyan-400" 
                                  : "from-blue-600 via-blue-550 to-indigo-500"
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex justify-between items-center gap-2">
                          <div className="flex gap-1 items-center">
                            <button 
                              onClick={() => {
                                setAudioTrackIndex(prev => (prev === 0 ? 2 : prev - 1));
                                addSyncLog("system", "Skipped back 1 track");
                              }}
                              className={`p-1.5 border rounded-lg cursor-pointer text-xs ${
                                darkMode ? "border-slate-800 text-slate-400 bg-slate-950 hover:bg-slate-900" : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                              }`}
                            >
                              ⏮️
                            </button>
                            <button
                              onClick={() => {
                                setAudioPlaying(!audioPlaying);
                                addSyncLog("system", `Audio synth output toggled: ${!audioPlaying ? "active" : "muted"}`);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-extrabold rounded-lg shadow cursor-pointer transition"
                            >
                              {audioPlaying ? "⏸️ Pause" : "▶️ Play Synths"}
                            </button>
                            <button 
                              onClick={() => {
                                setAudioTrackIndex(prev => (prev === 2 ? 0 : prev + 1));
                                addSyncLog("system", "Skipped forward 1 track");
                              }}
                              className={`p-1.5 border rounded-lg cursor-pointer text-xs ${
                                darkMode ? "border-slate-800 text-slate-400 bg-slate-950 hover:bg-slate-900" : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                              }`}
                            >
                              ⏭️
                            </button>
                          </div>
                          
                          <div className="text-right font-mono text-[7px] text-slate-500">
                            Volume: {audioVolume}% • {audioPlaying ? "Oscillating" : "Static"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. MONETIZATION PRO REGION */}
                  {studioSubtab === "monetize" && (
                    <div className="space-y-4">
                      {/* Double Consent AdMob Reward box */}
                      <div className={`p-3 border rounded-lg text-left space-y-3 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-300" : "text-slate-850"}`}>AdMob Payout Console</span>
                          </div>
                          <span className="text-[8px] text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded font-mono font-bold">+150 Tokens</span>
                        </div>

                        <div className={`p-2 rounded-md border border-dashed text-[8.2px] leading-relaxed ${
                          darkMode ? "bg-slate-950/40 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}>
                          <span className="font-extrabold text-blue-500 uppercase block mb-0.5">Publisher Policy Compliance Check</span>
                          Google publishers must use explicit consent before firing full-screen ads. Press below to launch a compliant 5s reward ad mockup.
                        </div>

                        <button
                          onClick={() => {
                            addSyncLog("admob", "Consent validated. Running secure AdMob Rewarded Interstitial pipeline...");
                            setIsWatchingRewardedAd(true);
                            setAdTimer(5);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-[10px] font-bold rounded-md transition shadow-md cursor-pointer text-center"
                        >
                          Observe Compliant Video Ad (+150 Tokens)
                        </button>
                      </div>

                      {/* ACCIDENTAL CLICK SHIELD CONFIGURATOR */}
                      <div className={`p-3 border rounded-lg text-left space-y-3 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-blue-500 stroke-[2.5]" />
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-200" : "text-slate-900"}`}>Accidental Click Shield</span>
                          </div>
                          <span className="text-[7.5px] text-green-500 font-mono font-extrabold bg-green-500/10 px-1.5 py-0.2 rounded">Safety System</span>
                        </div>

                        <div className="space-y-3">
                          {/* 1. Click Shield Gate Toggle */}
                          <div className="flex justify-between items-center bg-slate-550/5 p-2 rounded-md border border-slate-500/10">
                            <div className="max-w-[70%]">
                              <span className="text-[9px] font-bold block">Double-Tap Tap Protection</span>
                              <p className="text-[7px] text-slate-500 leading-relaxed mt-0.5">Asks user to explicitly confirm ad clicks, preventing sudden background page redirects or fake scrolling clicks.</p>
                            </div>
                            <button
                              onClick={() => {
                                setIsShieldEnabled(!isShieldEnabled);
                                addSyncLog("system", `Accidental Click Shield changed to: ${!isShieldEnabled ? "STRICT COMPLY" : "BYPASS"}`);
                                onTriggerNotification("Guard Updated", `Protection check is now ${!isShieldEnabled ? "Enabled" : "Disabled"}`);
                              }}
                              className={`p-1 px-1.5 text-[7px] font-mono leading-none tracking-tight font-extrabold rounded-md cursor-pointer border transition-all ${
                                isShieldEnabled 
                                  ? "bg-blue-500/15 border-blue-500/30 text-blue-400" 
                                  : "bg-slate-500/10 border-slate-500/30 text-slate-500"
                              }`}
                            >
                              {isShieldEnabled ? "STRICT COMPLY" : "BYPASS MODE"}
                            </button>
                          </div>

                          {/* 2. Dynamic Scroll Spacing Buffer */}
                          <div className="flex justify-between items-center bg-slate-550/5 p-2 rounded-md border border-slate-500/10">
                            <div className="max-w-[70%]">
                              <span className="text-[9px] font-bold block">Safety Padding Buffer</span>
                              <p className="text-[7px] text-slate-500 leading-relaxed mt-0.5">Dynamically appends 54px offset cushion to the scroll zone's bottom view-edge so bottom actions scroll fully above floating banners.</p>
                            </div>
                            <button
                              onClick={() => {
                                setBannerPaddingEnabled(!bannerPaddingEnabled);
                                addSyncLog("system", `Safety bottom padding cushion toggled to: ${!bannerPaddingEnabled}`);
                                onTriggerNotification("Padding Cushions Updated", `Safety cushion is now ${!bannerPaddingEnabled ? "Enabled" : "Disabled"}`);
                              }}
                              className={`p-1 px-1.5 text-[7px] font-mono leading-none tracking-tight font-extrabold rounded-md cursor-pointer border transition-all ${
                                bannerPaddingEnabled 
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
                                  : "bg-slate-500/10 border-slate-500/30 text-slate-500"
                              }`}
                            >
                              {bannerPaddingEnabled ? "ACTIVE (110PX)" : "DISABLED"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Google AdMob Demo Ad Units Widget */}
                      <div className={`p-3 border rounded-lg text-left space-y-3 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-200" : "text-slate-900"}`}>Google Demo Ad Units</span>
                          <span className="text-[8px] text-blue-500 font-mono font-extrabold bg-blue-500/10 px-1.5 py-0.5 rounded">SDK Test Suite</span>
                        </div>

                        <div className={`p-2 rounded-md text-[8px] leading-relaxed ${
                          darkMode ? "bg-slate-950/40 text-slate-400" : "bg-slate-50 text-slate-600 shadow-3xs"
                        }`}>
                          Use Google-provided demo ad units to securely test rendering without risk of invalid traffic. <span className="font-bold text-amber-500">Key Point:</span> Replace these with your own unit IDs before build release.
                        </div>

                        {/* Interactive list of Demo Ad Units */}
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                          {[
                            { format: "App Open", id: "ca-app-pub-3940256099942544/9257395921", type: "Full Screen", desc: "Showcases immediately on cold boot start" },
                            { format: "Achored Adaptive Banner", id: "ca-app-pub-3940256099942544/9214589741", type: "Banner", desc: "Fitted adaptive screen-width bottom bar" },
                            { format: "Inline Adaptive Banner", id: "ca-app-pub-3940256099942544/9214589741", type: "Banner", desc: "In-line scrollable text block placement" },
                            { format: "Fixed Size Banner", id: "ca-app-pub-3940256099942544/6300978111", type: "Banner", desc: "320x50 standard rect placement" },
                            { format: "Interstitial", id: "ca-app-pub-3940256099942544/1033173712", type: "Full Screen", desc: "Static coverage at route switch points" },
                            { format: "Rewarded Ads", id: "ca-app-pub-3940256099942544/5224354917", type: "Full Screen", desc: "Awards in-game/premium tokens on complete" },
                            { format: "Rewarded Interstitial", id: "ca-app-pub-3940256099942544/5354046379", type: "Full Screen", desc: "Immersive layout that grants fast payout" },
                            { format: "Native", id: "ca-app-pub-3940256099942544/2247696110", type: "Native Inline", desc: "App-styled typography/component layout block" },
                            { format: "Native Video", id: "ca-app-pub-3940256099942544/1044960115", type: "Native Inline", desc: "Native styled template featuring a videobox" }
                          ].map((unit) => {
                            const isBanner = unit.type === "Banner";
                            const isNative = unit.type === "Native Inline";
                            const isBannerActive = simulatedBannerActive === unit.format;
                            const isCopied = copiedAdUnitId === unit.id;
                            
                            return (
                              <div key={unit.format} className={`p-2 border rounded-md space-y-1.5 transition-colors ${
                                darkMode ? "bg-slate-950/85 border-slate-900 hover:bg-slate-950" : "bg-slate-50 border-slate-200 hover:bg-slate-100/50"
                              }`}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-[9px] font-extrabold block">{unit.format}</span>
                                    <span className="text-[6.5px] text-slate-500 font-mono tracking-tighter truncate max-w-[130px] block select-all">
                                      {unit.id}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <button 
                                      onClick={() => {
                                        try {
                                          navigator.clipboard.writeText(unit.id);
                                        } catch (e) {}
                                        setCopiedAdUnitId(unit.id);
                                        addSyncLog("admob", `Demo Unit Referenced: ${unit.format}`);
                                        setTimeout(() => setCopiedAdUnitId(null), 1500);
                                      }}
                                      className={`p-1 rounded text-[8px] font-bold border transition duration-150 ${
                                        isCopied 
                                          ? "bg-green-500/10 border-green-500/30 text-green-500" 
                                          : (darkMode ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white" : "bg-white border-slate-200 text-slate-650 hover:text-black")
                                      }`}
                                      title="Copy ID to Clipboard"
                                    >
                                      {isCopied ? "Copied" : <Copy className="h-2 w-2" />}
                                    </button>

                                    {isBanner ? (
                                      <button 
                                        onClick={() => {
                                          if (isBannerActive) {
                                            setSimulatedBannerActive(null);
                                            addSyncLog("system", `AdMob Banner unmounted: ${unit.format}`);
                                          } else {
                                            setSimulatedBannerActive(unit.format);
                                            addSyncLog("admob", `[AdMob SDK] Mounting simulated demo banner: ${unit.format}`);
                                            onTriggerNotification("Demo Banner Mounted", "Docks at the bottom edge above navigation rail.");
                                          }
                                        }}
                                        className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-bold border cursor-pointer transition ${
                                          isBannerActive
                                            ? "bg-blue-600 border-blue-500 text-white"
                                            : (darkMode ? "bg-slate-900 border-slate-800 text-blue-400 hover:bg-slate-850" : "bg-white border-blue-200 text-blue-700 hover:bg-blue-50")
                                        }`}
                                      >
                                        {isBannerActive ? "Remove" : "Mount Ad"}
                                      </button>
                                    ) : isNative ? (
                                      <button 
                                        onClick={() => {
                                          addSyncLog("admob", `[Native AdMob] Rendered custom Match UI for native ad unit ${unit.format}`);
                                          onTriggerNotification("Native Placement Refreshed", "Matches design parameters uniquely.");
                                        }}
                                        className={`px-1.5 py-0.5 rounded text-[7px] font-mono font-bold border cursor-pointer ${
                                          darkMode ? "bg-slate-900 border-slate-850 text-indigo-400 hover:bg-slate-850" : "bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                        }`}
                                      >
                                        Inline Test
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => {
                                          addSyncLog("admob", `[AdMob SDK] Firing full-screen prefetch pipeline for: ${unit.format}`);
                                          setSimulatedAdUnit(unit);
                                          setSimulatedAdTimer(5);
                                        }}
                                        className="px-1.5 py-0.5 rounded text-[7px] font-mono font-bold cursor-pointer bg-gradient-to-r from-amber-500/80 to-yellow-600/80 text-slate-950 font-bold border border-amber-300 hover:opacity-90"
                                      >
                                        Launch 100%
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[7px] text-slate-500 leading-normal">{unit.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explicit Interactive Q&A regarding 100% screen coverage */}
                      <div className={`p-3 border rounded-lg text-left space-y-2 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div className="flex items-center gap-1.5 text-blue-500">
                          <HelpCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wide">Guideline FAQ Check</span>
                        </div>
                        <div className="space-y-2 text-[8px]">
                          <div>
                            <span className={`font-extrabold block ${darkMode ? "text-slate-350" : "text-slate-850"} leading-snug`}>
                              Q: Does reward AdMob need 100% full mobile screen covered?
                            </span>
                            <p className="text-slate-500 leading-relaxed mt-0.5">
                              <span className="text-emerald-500 font-extrabold uppercase">YES!</span> As demonstrated by our "Launch 100%" simulation overlays, full-screen formats (Rewarded Ads, Rewarded Interstitials, App Open, and standard Interstitials) <span className="font-semibold text-slate-400">must cover 100% of the active mobile viewport</span>. 
                              Squeezing full-screen creatives into partial blocks, inner scrollable subviews, or mini widgets is an absolute policy violation that triggers immediate account suspension.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Active Test Devices Programmatic Settings */}
                      <div className={`p-3 border rounded-lg text-left space-y-2.5 transition ${
                        darkMode ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200 shadow-sm shadow-slate-100/50"
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] uppercase tracking-wider font-extrabold ${darkMode ? "text-slate-300" : "text-slate-850"}`}>Configure Test Devices</span>
                          <span className="text-[7px] font-mono leading-none font-bold px-1.5 py-0.5 rounded border border-green-500/20 text-green-500 bg-green-500/10">
                            ACTIVE CONNECTION: SECURE
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[7.5px] uppercase text-slate-500">Simulator Device ID</span>
                            <span className="text-[7.5px] font-mono text-blue-500 font-bold select-all bg-slate-500/5 px-1 rounded">VEOVIBE_EMU_SIM_F9B24</span>
                          </div>

                          {/* List of active dev test devices */}
                          <div className="flex flex-wrap gap-1">
                            {testDevices.map((dev) => (
                              <div key={dev} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-slate-800 bg-slate-950 text-[7px] font-mono text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span>{dev}</span>
                                <button 
                                  onClick={() => {
                                    setTestDevices(prev => prev.filter(p => p !== dev));
                                    addSyncLog("system", `Removed test device association for device hash: ${dev}`);
                                  }}
                                  className="text-red-500 hover:text-red-400 ml-1 leading-none text-[8px] font-bold cursor-pointer"
                                  title="Unregister device"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add test device form */}
                          <div className="flex gap-1">
                            <input 
                              type="text"
                              value={newDeviceInput}
                              onChange={(e) => setNewDeviceInput(e.target.value)}
                              placeholder="Add custom device ID/Hash..."
                              className={`flex-1 px-2 py-1 text-[8px] rounded border focus:outline-hidden ${
                                darkMode 
                                  ? "bg-slate-950 border-slate-850 text-slate-300 focus:border-blue-500" 
                                  : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500"
                              }`}
                            />
                            <button 
                              onClick={() => {
                                if (newDeviceInput.trim()) {
                                  const trimmed = newDeviceInput.trim().toUpperCase();
                                  if (!testDevices.includes(trimmed)) {
                                    setTestDevices(prev => [...prev, trimmed]);
                                    addSyncLog("system", `Registered test device programmatically: ${trimmed}. Mock production ads will substitute with test templates.`);
                                    onTriggerNotification("Test Device Configured", `Registered programmatic test instance ${trimmed}.`);
                                  }
                                  setNewDeviceInput("");
                                }
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[8px] font-bold rounded cursor-pointer leading-none"
                            >
                              Add
                            </button>
                          </div>
                          
                          <p className="text-[7.5px] text-slate-500 leading-snug font-mono">
                            Devices registered as Test Devices will receive production-layout templates without generating policy violations or fraudulent ad requests.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REAL-TIME SYNCHRONIZATION LOGS */}
              {activeTab === "sync" && (() => {
                const chartData = syncLogs && syncLogs.length > 0
                  ? syncLogs.map((log, index) => ({
                      name: `#${index + 1}`,
                      latency: log.latency || 45,
                      timestamp: log.timestamp,
                      type: log.type
                    }))
                  : [
                      { name: "#1", latency: 35, timestamp: "Idle", type: "system" }
                    ];

                const CustomTooltip = ({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className={`border rounded-lg p-2.5 shadow-xl text-[9px] font-mono leading-tight z-50 ${
                        darkMode ? "bg-slate-950/95 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                      }`}>
                        <div className={`font-bold mb-0.5 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{data.timestamp}</div>
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span className={darkMode ? "text-slate-200" : "text-slate-800 font-bold"}>Latency: <span className="text-blue-600 font-bold">{data.latency}ms</span></span>
                        </div>
                        {data.type && (
                          <div className={`text-[8px] uppercase mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-500 font-bold"}`}>Type: {data.type}</div>
                        )}
                      </div>
                    );
                  }
                  return null;
                };

                const avgLatency = Math.round(
                  chartData.reduce((acc, curr) => acc + curr.latency, 0) / chartData.length
                );

                return (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-left">
                      <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-655"}`}>Sync Handshake Logs</span>
                      {isSyncing && (
                        <span className="text-[10px] text-blue-500 font-bold font-mono animate-sync-breathe flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> SYNC ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Optional Auto-Clear and Clear action controls bar */}
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-md border ${
                      darkMode ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200 shadow-sm shadow-slate-100/40"
                    }`}>
                      <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                        <input 
                          type="checkbox"
                          checked={autoClear}
                          onChange={(e) => {
                            setAutoClear(e.target.checked);
                            if (e.target.checked) {
                              addSyncLog("system", "Auto-clear protocol activated (capping at 15 logs).");
                            } else {
                              addSyncLog("system", "Auto-clear protocol deactivated.");
                            }
                          }}
                          className={`rounded w-3.5 h-3.5 cursor-pointer accent-blue-500 ${
                            darkMode ? "border-slate-800 bg-slate-950 text-blue-500 focus:ring-blue-500" : "border-slate-300 bg-white"
                          }`}
                        />
                        <span className={`text-[10px] font-mono font-bold whitespace-nowrap ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Auto-Clear max (15)</span>
                      </label>
                      
                      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
                        <button 
                          onClick={() => {
                            onClearLogs();
                            addSyncLog("system", "Logs synchronized buffer flushed manually.");
                          }}
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer border shadow-sm ${
                            darkMode ? "bg-slate-950 hover:bg-slate-900 border-slate-800 text-blue-400 hover:text-blue-300" : "bg-white hover:bg-slate-50 border-slate-200 text-blue-600 hover:text-blue-700 hover:border-slate-300"
                          }`}
                        >
                          Clear Logs
                        </button>

                        <button 
                          onClick={() => {
                            if (filteredLogs.length === 0) return;
                            try {
                              const jsonString = JSON.stringify(filteredLogs, null, 2);
                              const blob = new Blob([jsonString], { type: "application/json" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `sync_logs_${new Date().toISOString().slice(0, 19).replace(/T|:/g, "_")}.json`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                              addSyncLog("system", `Exported ${filteredLogs.length} current log entries to JSON successfully.`);
                            } catch (err) {
                              addSyncLog("system", `Failed to export logs: ${err instanceof Error ? err.message : String(err)}`);
                            }
                          }}
                          disabled={filteredLogs.length === 0}
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer border shadow-sm flex items-center gap-1 ${
                            filteredLogs.length === 0
                              ? "opacity-40 cursor-not-allowed border-slate-800/20 text-slate-500"
                              : darkMode
                                ? "bg-slate-950 hover:bg-indigo-950/45 border-slate-800 hover:border-indigo-500/30 text-indigo-400 hover:text-indigo-300"
                                : "bg-white hover:bg-indigo-50/50 border-slate-200 hover:border-indigo-200 text-indigo-600 hover:text-indigo-700"
                          }`}
                          title="Export logs matching current filters as JSON file"
                        >
                          <Download className="h-3 w-3" />
                          <span>JSON</span>
                        </button>

                        <button 
                          onClick={() => {
                            if (filteredLogs.length === 0) return;
                            try {
                              const headers = ["ID", "Timestamp", "Type", "Device", "Message", "Latency (ms)"];
                              const csvRows = [
                                headers.join(","),
                                ...filteredLogs.map(log => {
                                  const escapedMessage = (log.message || "").replace(/"/g, '""');
                                  const escapedDevice = (log.device || "").replace(/"/g, '""');
                                  return [
                                    `"${log.id}"`,
                                    `"${log.timestamp}"`,
                                    `"${log.type}"`,
                                    `"${escapedDevice}"`,
                                    `"${escapedMessage}"`,
                                    log.latency !== undefined ? log.latency : ""
                                  ].join(",");
                                })
                              ];
                              const csvString = csvRows.join("\n");
                              const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `sync_logs_${new Date().toISOString().slice(0, 19).replace(/T|:/g, "_")}.csv`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                              addSyncLog("system", `Exported ${filteredLogs.length} current log entries to CSV successfully.`);
                            } catch (err) {
                              addSyncLog("system", `Failed to export logs: ${err instanceof Error ? err.message : String(err)}`);
                            }
                          }}
                          disabled={filteredLogs.length === 0}
                          className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer border shadow-sm flex items-center gap-1 ${
                            filteredLogs.length === 0
                              ? "opacity-40 cursor-not-allowed border-slate-800/20 text-slate-500"
                              : darkMode
                                ? "bg-slate-950 hover:bg-emerald-950/45 border-slate-800 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300"
                                : "bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-200 text-emerald-600 hover:text-emerald-700"
                          }`}
                          title="Export logs matching current filters as CSV spreadsheet"
                        >
                          <Download className="h-3 w-3" />
                          <span>CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Sync Performance Trend Chart */}
                    <div className={`p-3 rounded-lg border ${
                      darkMode ? "bg-slate-950/80 border-slate-800/80" : "bg-white border-slate-200 shadow-sm shadow-slate-200/40"
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3 w-3 text-blue-400 animate-pulse" />
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-slate-300" : "text-slate-800"}`}>Sync Performance Trend</span>
                        </div>
                        <div className={`text-[9px] font-mono font-bold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                          Avg: <span className={darkMode ? "text-green-400" : "text-emerald-700 font-extrabold"}>{avgLatency} ms</span>
                        </div>
                      </div>
                      
                      <div className="w-full h-24">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart 
                            data={chartData} 
                            margin={{ top: 5, right: 5, left: -28, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="latencyGlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e2e8f0"} vertical={false} />
                            <XAxis 
                              dataKey="name" 
                              stroke={darkMode ? "#475569" : "#64748b"} 
                              fontSize={7} 
                              tickLine={false} 
                              axisLine={false}
                            />
                            <YAxis 
                              stroke={darkMode ? "#475569" : "#64748b"} 
                              fontSize={7} 
                              tickLine={false} 
                              axisLine={false}
                              domain={[0, 'auto']}
                              unit="ms"
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: "2 2" }} />
                            <Area 
                              type="monotone" 
                              dataKey="latency" 
                              stroke="#3b82f6" 
                              strokeWidth={1.5}
                              fillOpacity={1} 
                              fill="url(#latencyGlow)" 
                              activeDot={{ r: 3, strokeWidth: 0, fill: '#60a5fa' }} 
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Sync Logs Filter Search Input */}
                    <div className="space-y-3">
                      <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                          <Search className="h-3.5 w-3.5" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search logs by event, device, or message..."
                          value={logSearchQuery}
                          onChange={(e) => setLogSearchQuery(e.target.value)}
                          className={`w-full pl-8 pr-7 py-2 border focus:border-indigo-500/50 rounded-md text-[10.5px] font-mono focus:outline-none transition-all ${
                            darkMode ? "bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white"
                          }`}
                        />
                        {(logSearchQuery || selectedLogTypes.length < 5) && (
                          <button
                            onClick={() => {
                              setLogSearchQuery("");
                              setSelectedLogTypes(["system", "sync", "notification", "auth", "admob"]);
                            }}
                            className={`absolute inset-y-0 right-0 pr-2.5 flex items-center transition-colors ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-700"}`}
                            title="Clear all filters & search"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Explicit Checkboxes for event types */}
                      <div className={`p-2.5 rounded-md border ${darkMode ? "bg-slate-950/60 border-slate-850" : "bg-slate-50/50 border-slate-200"} space-y-2`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500">
                            FILTER BY EVENT TYPES ({selectedLogTypes.length}/5)
                          </span>
                          <button
                            onClick={() => {
                              if (selectedLogTypes.length === 5) {
                                setSelectedLogTypes([]);
                              } else {
                                setSelectedLogTypes(["system", "sync", "notification", "auth", "admob"]);
                              }
                            }}
                            className="text-[8px] font-mono font-black uppercase text-blue-500 hover:text-blue-400 cursor-pointer"
                          >
                            {selectedLogTypes.length === 5 ? "Deselect All" : "Select All"}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { id: "sync", label: "Sync Handshakes", dotClass: "bg-blue-400" },
                            { id: "auth", label: "Auth Protocols", dotClass: "bg-emerald-400" },
                            { id: "admob", label: "AdMob Platform", dotClass: "bg-amber-400" },
                            { id: "notification", label: "Alerts & Notifs", dotClass: "bg-indigo-400" },
                            { id: "system", label: "System Core", dotClass: "bg-slate-400" }
                          ].map((evt) => {
                            const isChecked = selectedLogTypes.includes(evt.id);
                            return (
                              <label 
                                key={evt.id}
                                className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[9px] font-mono cursor-pointer select-none transition-all duration-200 ${
                                  isChecked 
                                    ? darkMode
                                      ? "bg-[#090a10] border-[#5159ea]/70 text-white shadow-[0_0_8px_rgba(81,89,234,0.12)]"
                                      : "bg-blue-50/30 border-blue-500/50 text-slate-800"
                                    : darkMode
                                      ? "bg-slate-950/40 border-slate-900 text-slate-500"
                                      : "bg-white border-slate-100 hover:bg-slate-50 text-slate-500"
                                }`}
                              >
                                <div className="relative flex items-center justify-center shrink-0">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setSelectedLogTypes(selectedLogTypes.filter(t => t !== evt.id));
                                      } else {
                                        setSelectedLogTypes([...selectedLogTypes, evt.id]);
                                      }
                                    }}
                                    className="sr-only"
                                  />
                                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                                    isChecked 
                                      ? "bg-[#5159ea] border-[#5159ea] text-white" 
                                      : darkMode 
                                        ? "border-slate-800 bg-slate-950/80" 
                                        : "border-slate-300 bg-white"
                                  }`}>
                                    {isChecked && <Check className="h-2.5 w-2.5 stroke-[3px]" />}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 truncate">
                                  <span className={`w-1 h-1 rounded-full ${evt.dotClass}`} />
                                  <span className="font-bold truncate text-[8.5px]">{evt.id.toUpperCase()}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {filteredLogs.length === 0 ? (
                      <div className={`flex flex-col items-center justify-center p-4 border border-dashed rounded-lg text-center h-[185px] ${
                        darkMode ? "border-slate-800/80 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
                      }`}>
                        <Search className="h-4 w-4 text-slate-500 mb-1.5 animate-pulse" />
                        <p className={`text-[9px] font-mono font-bold ${darkMode ? "text-slate-500" : "text-slate-500"}`}>No matching handshake logs</p>
                        <button 
                          onClick={() => {
                            setLogSearchQuery("");
                            setSelectedLogTypes(["system", "sync", "notification", "auth", "admob"]);
                          }}
                          className={`mt-2 px-2.5 py-0.5 border text-[8px] font-mono rounded-md transition-all font-bold ${
                            darkMode ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-blue-400" : "bg-white border-slate-200 hover:bg-slate-50 text-blue-600 shadow-sm"
                          }`}
                        >
                          Clear Filters
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 h-[185px] overflow-y-auto pr-1">
                        {filteredLogs.slice().reverse().map(log => (
                          <div key={log.id} className={`p-2 border rounded-lg text-[9px] font-mono leading-normal ${
                            darkMode ? "border-slate-800 bg-slate-950 text-slate-300" : "border-slate-200 bg-slate-50/70 text-slate-800 shadow-3xs"
                          }`}>
                            <div className="flex justify-between items-center text-[8px] text-slate-500 mb-0.5">
                              <span className={`font-bold ${
                                log.type === "sync" ? (darkMode ? "text-green-400" : "text-emerald-700") :
                                log.type === "auth" ? (darkMode ? "text-blue-400" : "text-blue-600") :
                                log.type === "notification" ? (darkMode ? "text-yellow-400" : "text-amber-600") :
                                log.type === "admob" ? (darkMode ? "text-amber-500" : "text-orange-600") :
                                (darkMode ? "text-slate-400" : "text-slate-600")
                              }`}>
                                [{log.type.toUpperCase()}]
                              </span>
                              <span className={darkMode ? "text-slate-500" : "text-slate-500 font-medium"}>{log.device} • {log.timestamp} {log.latency ? `(${log.latency}ms)` : ""}</span>
                            </div>
                            <p className={`text-[10px] break-words ${darkMode ? "text-slate-300" : "text-slate-700 font-medium"}`}>{log.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sync node indicators */}
                    <div className={`grid grid-cols-2 gap-2 text-center text-[9px] font-mono mt-2 pt-2 border-t ${
                      darkMode ? "border-slate-800" : "border-slate-150"
                    }`}>
                      <div className={`p-1 border rounded leading-tight ${
                        darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white shadow-3xs text-slate-800"
                      }`}>
                        <span className={darkMode ? "text-slate-550" : "text-slate-500 font-bold"}>Android Node</span>
                        <span className={`block font-bold mt-0.5 ${darkMode ? "text-green-400" : "text-emerald-700"}`}>Linked (✓ PWA)</span>
                      </div>
                      <div className={`p-1 border rounded leading-tight ${
                        darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white shadow-3xs text-slate-800"
                      }`}>
                        <span className={darkMode ? "text-slate-550" : "text-slate-500 font-bold"}>iOS WebKit Node</span>
                        <span className={`block font-bold mt-0.5 ${darkMode ? "text-green-400" : "text-emerald-700"}`}>Linked (✓ PWA)</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* COMPANION SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="space-y-3.5 text-left">
                  <div className={`flex items-center gap-2 mb-3 pb-2 border-b ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                      <Settings className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>{authUsername}</div>
                      <div className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-650 font-bold"}`}>Primary Linked Profile</div>
                    </div>
                  </div>

                  {/* Settings toggles */}
                  <div className="space-y-3">
                    {/* Daylight Mode / Night Shift Select Control */}
                    <div className={`space-y-1.5 pb-2.5 border-b ${darkMode ? "border-slate-900/60" : "border-slate-200"}`}>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`text-[10px] ${darkMode ? "text-slate-400" : "text-slate-700 font-bold"} uppercase tracking-wider`}>Simulator Frame Theme</span>
                        <span className={`text-[9px] ${darkMode ? "text-blue-400" : "text-blue-700"} font-mono font-bold`}>{darkMode ? "Night Shift" : "Daylight Mode"}</span>
                      </div>
                      <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-md border ${darkMode ? "bg-slate-950/80 border-slate-900" : "bg-slate-200/80 border-slate-300"}`}>
                        <button
                          onClick={() => {
                            setDarkMode(false);
                            addSyncLog("system", "Switched simulator frame class state to 'Daylight Mode' (light theme).");
                          }}
                          className={!darkMode ? VEOVIBE_THEME.buttons.mobileDaylightMode.active : VEOVIBE_THEME.buttons.mobileDaylightMode.inactive}
                        >
                          <Sun className="h-3.5 w-3.5 shrink-0 animate-[spin_4s_linear_infinite]" />
                          <span>Daylight Mode</span>
                        </button>
                        <button
                          onClick={() => {
                            setDarkMode(true);
                            addSyncLog("system", "Switched simulator frame class state to 'Night Shift' (dark theme).");
                          }}
                          className={darkMode ? VEOVIBE_THEME.buttons.mobileNightShift.active : VEOVIBE_THEME.buttons.mobileNightShift.inactive}
                        >
                          <Moon className="h-3.5 w-3.5 shrink-0" />
                          <span>Night Shift</span>
                        </button>
                      </div>
                    </div>

                    <div className={`flex justify-between items-center text-xs ${darkMode ? "text-slate-200" : "text-slate-800 font-bold"}`}>
                      <span>Auto-clear Handshake Logs</span>
                      <button 
                        onClick={() => {
                          setAutoClear(!autoClear);
                          addSyncLog("system", `Auto-clear protocol toggled: ${!autoClear ? "ON (capped at 15 items)" : "OFF"}`);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition ${autoClear ? "bg-blue-600" : (darkMode ? "bg-slate-800" : "bg-slate-300")} cursor-pointer`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition ${autoClear ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <div className={`flex justify-between items-center text-xs ${darkMode ? "text-slate-200" : "text-slate-800 font-bold"}`}>
                      <div className="flex flex-col">
                        <span>Rainbow Glow Effects</span>
                        <span className={`text-[8px] ${darkMode ? "text-slate-500" : "text-slate-600 font-bold"}`}>Reduce visual noise/power</span>
                      </div>
                      <button 
                        onClick={() => {
                          setRainbowGlowEnabled(!rainbowGlowEnabled);
                          addSyncLog("system", `Rainbow Glow visual effects toggled: ${!rainbowGlowEnabled ? "ENABLED" : "DISABLED (Low Power Mode)"}`);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition ${rainbowGlowEnabled ? "bg-blue-600" : (darkMode ? "bg-slate-800" : "bg-slate-300")} cursor-pointer`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition ${rainbowGlowEnabled ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <div className={`flex justify-between items-center text-xs ${darkMode ? "text-slate-200" : "text-slate-800 font-bold"}`}>
                      <span>Milestone Push Alerts</span>
                      <span className={`text-[10px] font-bold ${darkMode ? "text-green-400" : "text-emerald-700"} font-mono`}>ENABLED</span>
                    </div>

                    <div className={`flex justify-between items-center text-xs ${darkMode ? "text-slate-200" : "text-slate-800 font-bold"}`}>
                      <span>AdMob Non-Personalized</span>
                      <button 
                        onClick={() => addSyncLog("admob", "Toggled personalized tracking preferences.")}
                        className={`text-[10px] ${darkMode ? "text-blue-400" : "text-blue-700"} hover:underline font-bold cursor-pointer`}
                      >
                        Configure GDPR
                      </button>
                    </div>
                  </div>

                  <div className={`p-3 border rounded-md space-y-1 mt-4 ${darkMode ? "bg-slate-900/55 border-slate-800" : "bg-slate-100 border-slate-250 shadow-2xs"}`}>
                    <div className={`text-[10px] font-mono ${darkMode ? "text-blue-400" : "text-blue-700"} font-bold uppercase`}>Device Core Blueprint</div>
                    <p className={`text-[9px] ${darkMode ? "text-slate-500" : "text-slate-700 font-medium"} leading-normal`}>
                      Device specifications verified for PWA deployment: Chrome OS/Android WebVibe API compliant. AdMob SDK target valid. Offline caching service-worker listening.
                    </p>
                  </div>

                  {/* Logout trigger button */}
                  <button 
                    onClick={handleLogout}
                    className={`w-full mt-4 py-2 border font-bold rounded-lg text-xs transition cursor-pointer ${
                      darkMode 
                        ? "border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-400" 
                        : "border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-sm"
                    }`}
                  >
                    Unlink Safe Companion Node
                  </button>
                </div>
              )}
            </>
          )}

        </AdMobPointerGuard>

        {/* AdMob Banner Overlay above navigation bar */}
        {isAuthenticated && simulatedBannerActive && (
          <div className={`absolute bottom-14 inset-x-0 h-[46px] border-t border-b z-30 flex items-center justify-between px-3 animate-slide-up select-none ${
            darkMode 
              ? "bg-slate-900 border-slate-800 text-slate-100" 
              : "bg-slate-50 border-slate-200 text-slate-900 shadow-3xs"
          }`}>
            <div className="absolute top-0.5 left-1 px-1 bg-amber-500 rounded text-[5px] font-bold text-slate-950 uppercase font-sans tracking-widest leading-none scale-90 origin-top-left">
              Google Demo Ad Banner
            </div>
            
            {/* Clickable Banner Match Area protected by Gated Consent */}
            <div 
              onClick={() => {
                if (isShieldEnabled) {
                  setClickShieldActive({
                    title: simulatedBannerActive === "Achored Adaptive Banner" ? "Adaptive AdMob Banner Ad" : "Fixed 320x50 Banner Ad",
                    description: simulatedBannerActive === "Achored Adaptive Banner" ? "ca-app-pub-3940256099942544/9214589741" : "ca-app-pub-3940256099942544/6300978111",
                    ctaLabel: "AdMob Bottom Banner Click Target",
                    action: () => {
                      addSyncLog("admob", `[AdMob Banner] Shield Verified: User proceeded with banner click-through on: ${simulatedBannerActive}`);
                      onTriggerNotification("Sponsor Ad Opened", "Verified ad transition completed.");
                    }
                  });
                } else {
                  addSyncLog("admob", `[AdMob Banner] Banner click registered directly.`);
                  onTriggerNotification("Interactive Banner Tap", "Navigating to banner partner page.");
                }
              }}
              className="flex-1 flex items-center gap-1.5 mt-2 h-full cursor-pointer"
              title="Interactive Sponsor Match - Verified Shield Active"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping shrink-0" />
              <div className="text-left leading-none min-w-0">
                <span className="text-[7.5px] font-extrabold tracking-tight block hover:underline truncate max-w-[150px]">
                  {simulatedBannerActive === "Achored Adaptive Banner" ? "Adaptive AdMob Banner" : "Fixed 320x50 Banner"}
                </span>
                <span className="text-[6.5px] text-slate-550 font-mono tracking-tighter block mt-0.5 truncate max-w-[155px]">
                  ID: {simulatedBannerActive === "Achored Adaptive Banner" ? "ca-app-pub-3940256099942544/9214589741" : "ca-app-pub-3940256099942544/6300978111"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 mt-1 shrink-0">
              <button 
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(
                      simulatedBannerActive === "Achored Adaptive Banner" 
                        ? "ca-app-pub-3940256099942544/9214589741" 
                        : "ca-app-pub-3940256099942544/6300978111"
                    );
                  } catch(e) {}
                  addSyncLog("system", `Copied banner unit ID: ${simulatedBannerActive}`);
                  onTriggerNotification("Ad Unit Copied", "Google Demo Banner id stored to clipboard.");
                }}
                className="p-1 rounded hover:bg-slate-500/10 text-slate-500 hover:text-blue-500 transition cursor-pointer"
                title="Copy Banner ID"
              >
                <Copy className="h-2.5 w-2.5" />
              </button>
              <button 
                onClick={() => {
                  addSyncLog("admob", `[AdMob] Dismissed banner placement: ${simulatedBannerActive}`);
                  setSimulatedBannerActive(null);
                }}
                className="p-1 rounded hover:bg-slate-500/10 text-slate-400 hover:text-red-500 transition cursor-pointer"
                title="Hide Banner"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        )}

        {/* COMPANION NAVIGATION RAIL (Persistent system buttons at bottom) */}
        {isAuthenticated && (
          <AdMobPointerGuard
            showInterstitial={showInterstitial}
            isWatchingRewardedAd={isWatchingRewardedAd}
            simulatedAdUnit={simulatedAdUnit}
            interstitialExportProject={interstitialExportProject}
            exportStage={exportStage}
            className={`absolute bottom-0 inset-x-0 h-14 border-t z-30 flex justify-between items-center px-4 transition-colors duration-300 ${
              darkMode 
                ? "border-slate-800/80 bg-slate-950/80 backdrop-blur-xl" 
                : "border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(15,23,42,0.06)]"
            }`}
          >
            
            <button 
              onClick={() => setActiveTab("dashboard")}
              className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-200 cursor-pointer ${
                activeTab === "dashboard" 
                  ? (darkMode ? "text-blue-400 font-bold scale-105" : "text-blue-700 font-extrabold scale-105") 
                  : (darkMode ? "text-slate-500 hover:text-slate-350" : "text-slate-600 hover:text-slate-900 font-bold")
              }`}
            >
              <LayoutGrid className="h-4 w-4 stroke-[2.5]" />
              <span className="text-[9.5px]">Pipeline</span>
            </button>

            <button 
              onClick={() => setActiveTab("studio")}
              className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-200 cursor-pointer ${
                activeTab === "studio" 
                  ? (darkMode ? "text-blue-400 font-bold scale-105" : "text-blue-700 font-extrabold scale-105") 
                  : (darkMode ? "text-slate-500 hover:text-slate-350" : "text-slate-600 hover:text-slate-900 font-bold")
              }`}
            >
              <Sparkles className="h-4 w-4 stroke-[2.5]" />
              <span className="text-[9.5px]">Studio</span>
            </button>

            <button 
              onClick={() => setActiveTab("sync")}
              className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-200 cursor-pointer ${
                activeTab === "sync" 
                  ? (darkMode ? "text-blue-400 font-bold scale-105" : "text-blue-700 font-extrabold scale-105") 
                  : (darkMode ? "text-slate-500 hover:text-slate-350" : "text-slate-600 hover:text-slate-900 font-bold")
              }`}
              id="sync-logs-tab-button"
            >
              <div className="relative">
                <RefreshCw className="h-4 w-4 stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-ping" />
              </div>
              <span className="text-[9.5px]">Logs</span>
            </button>

            <button 
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center gap-1 flex-1 py-1 transition-all duration-200 cursor-pointer ${
                activeTab === "settings" 
                  ? (darkMode ? "text-blue-400 font-bold scale-105" : "text-blue-700 font-extrabold scale-105") 
                  : (darkMode ? "text-slate-500 hover:text-slate-350" : "text-slate-600 hover:text-slate-900 font-bold")
              }`}
            >
              <Settings className="h-4 w-4 stroke-[2.5]" />
              <span className="text-[9.5px]">Config</span>
            </button>

          </AdMobPointerGuard>
        )}

      </div>
    </div>
  );
}
