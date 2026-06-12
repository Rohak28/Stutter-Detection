"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileAudio,
  BarChart2,
  Award,
  ArrowLeft,
  Clock,
  AlertCircle,
  Download,
  Share2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  Volume2,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Play,
  Pause,
  ClipboardCheck,
  Save,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Edit3,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Animated Score Circle Component
const ScoreCircle = ({ score, size = 180, strokeWidth = 12, delay = 0 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 60;
      const increment = score / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  const getScoreColor = () => {
    if (animatedScore >= 80) return "stroke-emerald-500";
    if (animatedScore >= 60) return "stroke-amber-500";
    return "stroke-red-500";
  };

  const getScoreGradient = () => {
    if (animatedScore >= 80) return "from-emerald-400 to-green-600";
    if (animatedScore >= 60) return "from-amber-400 to-orange-600";
    return "from-red-400 to-rose-600";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className={`fill-none ${getScoreColor()}`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: delay / 1000, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className={`text-4xl font-bold bg-gradient-to-br ${getScoreGradient()} bg-clip-text text-transparent`}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay / 1000 + 0.5 }}
        >
          {animatedScore}%
        </motion.span>
        <span className="text-sm text-muted-foreground mt-1">Fluency Score</span>
      </div>
      <div className="absolute -bottom-2 flex gap-1">
        {score >= 80 && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        {score < 80 && score >= 60 && <AlertCircle className="h-4 w-4 text-amber-500" />}
        {score < 60 && <XCircle className="h-4 w-4 text-red-500" />}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, trendValue, color, delay, subValue }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="glass border-white/10 dark:border-white/5 overflow-hidden group hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
            {trend && (
              <div className={`flex items-center gap-1 text-sm ${trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Severity Badge Component
const SeverityBadge = ({ severity }) => {
  const config = {
    Severe: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle },
    Moderate: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", icon: AlertCircle },
    Mild: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  };
  const { bg, text, icon: Icon } = config[severity] || config.Mild;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
      <Icon className="h-4 w-4" />
      {severity}
    </span>
  );
};

// Model Accuracy Card Component
const ModelAccuracyCard = ({ label, value, icon, gradient, bgGlow, desc, delay = 0 }) => {
  const numVal = parseFloat(value) || 0;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dur = 1200;
      const steps = 50;
      const inc = numVal / steps;
      let cur = 0;
      const iv = setInterval(() => {
        cur += inc;
        if (cur >= numVal) { setAnimated(numVal); clearInterval(iv); }
        else setAnimated(parseFloat(cur.toFixed(1)));
      }, dur / steps);
      return () => clearInterval(iv);
    }, delay + 200);
    return () => clearTimeout(timer);
  }, [numVal, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: delay / 1000, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
    >
      <div
        className="relative rounded-2xl border border-white/10 dark:border-white/5 p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
        style={{ background: bgGlow }}
      >
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-80`} />

        {/* Icon */}
        <div className={`inline-flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4 shadow-lg`}>
          {icon}
        </div>

        {/* Percentage */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className={`text-4xl font-extrabold tracking-tight bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {animated.toFixed(1)}
          </span>
          <span className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>%</span>
        </div>

        {/* Label & Desc */}
        <p className="text-sm font-semibold text-foreground mb-0.5">{label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>

        {/* Glow on hover */}
        <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
      </div>
    </motion.div>
  );
};

export default function Results() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStatus, setTaskStatus] = useState("pending");
  const [activeTab, setActiveTab] = useState("overview");
  const [videoUrl, setVideoUrl] = useState(null); // Video/audio recording URL

  // Remote config for toggling page features in real-time
  const [appConfigs, setAppConfigs] = useState(() => {
    try {
      const stored = localStorage.getItem("_app_config");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Client-side spectrogram generation state
  const spectrogramCanvasRef = useRef(null);
  const [clientSpectrogramReady, setClientSpectrogramReady] = useState(false);
  const [clientSpectrogramError, setClientSpectrogramError] = useState(null);
  const [isGeneratingSpectrogram, setIsGeneratingSpectrogram] = useState(false);

  // SLP Assessment State - SSI-4 Proper Fields
  const [slpAssessment, setSlpAssessment] = useState({
    // Frequency - Reading Task (%SS input)
    reading_percent_ss: "",
    // Frequency - Speaking Task (%SS input)
    speaking_percent_ss: "",
    // Duration - Average of 3 longest stuttering events
    duration_avg: "",
    // Physical Concomitants (0-5 scale each)
    distracting_sounds: 0,
    facial_grimaces: 0,
    head_movements: 0,
    // Other fields
    clinical_notes: "",
    model_is_accurate: null,
    model_feedback: "",
    // Age group for severity calculation
    age_group: "school_age", // preschool, school_age, adult
  });
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);
  const [existingAssessment, setExistingAssessment] = useState(null);
  const [patientName, setPatientName] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const taskId = location.state?.taskId || new URLSearchParams(location.search).get("task_id") || new URLSearchParams(location.search).get("taskId");
  const initialTab = location.state?.activeTab || "overview";
  const { currentUser, isSLP } = useAuth();

  const shouldShowFeature = (configVal) => {
    if (currentUser?.userType === "admin") return true;
    if (!configVal || configVal === "everyone") return true;
    if (configVal === "hidden" || configVal === "none") return false;
    if (configVal === "patients" && currentUser?.userType === "patient") return true;
    if (configVal === "slps" && currentUser?.userType === "slp") return true;
    return false;
  };

  // Sync real-time config updates via window event
  useEffect(() => {
    const handleConfigUpdate = (e) => {
      if (e.detail) {
        setAppConfigs(e.detail);
      } else {
        try {
          const stored = localStorage.getItem("_app_config");
          if (stored) setAppConfigs(JSON.parse(stored));
        } catch {}
      }
    };
    window.addEventListener("app_config_update", handleConfigUpdate);
    return () => window.removeEventListener("app_config_update", handleConfigUpdate);
  }, []);

  // Initial fast load of public configs
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/public/config`)
      .then(res => res.json())
      .then(data => {
        setAppConfigs(data);
        localStorage.setItem("_app_config", JSON.stringify(data));
      })
      .catch(err => console.error("Error fetching public config:", err));
  }, []);

  // Fallback to overview tab if current active tab is disabled in real-time
  useEffect(() => {
    if (activeTab === "transcription" && !shouldShowFeature(appConfigs.show_transcription_tab)) {
      setActiveTab("overview");
    }
    if (activeTab === "charts" && !shouldShowFeature(appConfigs.show_analytics_tab)) {
      setActiveTab("overview");
    }
  }, [appConfigs, activeTab, currentUser]);

  // Pure-JavaScript radix-2 FFT implementation
  const fftRadix2 = useCallback((re, im) => {
    const n = re.length;
    if (n <= 1) return;
    
    // Bit-reversal permutation
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        [re[i], re[j]] = [re[j], re[i]];
        [im[i], im[j]] = [im[j], im[i]];
      }
    }
    
    // Cooley-Tukey FFT
    for (let len = 2; len <= n; len <<= 1) {
      const half = len >> 1;
      const angle = -2 * Math.PI / len;
      const wRe = Math.cos(angle);
      const wIm = Math.sin(angle);
      for (let i = 0; i < n; i += len) {
        let curRe = 1, curIm = 0;
        for (let j = 0; j < half; j++) {
          const tRe = curRe * re[i + j + half] - curIm * im[i + j + half];
          const tIm = curRe * im[i + j + half] + curIm * re[i + j + half];
          re[i + j + half] = re[i + j] - tRe;
          im[i + j + half] = im[i + j] - tIm;
          re[i + j] += tRe;
          im[i + j] += tIm;
          const newCurRe = curRe * wRe - curIm * wIm;
          curIm = curRe * wIm + curIm * wRe;
          curRe = newCurRe;
        }
      }
    }
  }, []);

  // Client-side spectrogram generator using Web Audio API + pure-JS FFT
  const generateClientSpectrogram = useCallback(async (audioUrl) => {
    if (!audioUrl || !spectrogramCanvasRef.current) return;
    setIsGeneratingSpectrogram(true);
    setClientSpectrogramError(null);
    
    try {
      const fullUrl = audioUrl.startsWith('/') ? `${API_BASE_URL}${audioUrl}` : audioUrl;
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Get mono audio data
      const channelData = audioBuffer.getChannelData(0);
      const sampleRate = audioBuffer.sampleRate;
      
      const canvas = spectrogramCanvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Spectrogram parameters
      const fftSize = 2048;
      const hopSize = Math.floor(fftSize / 4);
      const numFrames = Math.max(1, Math.floor((channelData.length - fftSize) / hopSize));
      const numBins = fftSize / 2;
      
      // Set canvas dimensions
      const canvasWidth = Math.min(Math.max(numFrames, 400), 1200);
      const canvasHeight = 400;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // Create Hann window
      const hannWindow = new Float32Array(fftSize);
      for (let i = 0; i < fftSize; i++) {
        hannWindow[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (fftSize - 1)));
      }
      
      // Compute spectrogram frame by frame using pure-JS FFT
      const magnitudes = [];
      let maxMag = -Infinity;
      let minMag = Infinity;
      
      for (let frame = 0; frame < numFrames; frame++) {
        const startIdx = frame * hopSize;
        const re = new Float64Array(fftSize);
        const im = new Float64Array(fftSize);
        
        // Apply Hann window
        for (let i = 0; i < fftSize; i++) {
          re[i] = (channelData[startIdx + i] || 0) * hannWindow[i];
          im[i] = 0;
        }
        
        // Compute FFT in-place
        fftRadix2(re, im);
        
        // Compute magnitude in dB for the first half (positive frequencies)
        const frameMags = new Float32Array(numBins);
        for (let i = 0; i < numBins; i++) {
          const mag = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
          // Convert to dB (with floor to avoid -Infinity)
          frameMags[i] = 20 * Math.log10(Math.max(mag, 1e-10));
          if (frameMags[i] > maxMag) maxMag = frameMags[i];
          if (frameMags[i] < minMag && isFinite(frameMags[i])) minMag = frameMags[i];
        }
        magnitudes.push(frameMags);
      }
      
      // Clamp range for better contrast
      const range = (maxMag - minMag) || 1;
      
      // Magma-inspired color map: black → purple → red → orange → yellow
      const colorMap = (val) => {
        const t = Math.max(0, Math.min(1, val));
        let r, g, b;
        if (t < 0.25) {
          const s = t / 0.25;
          r = Math.floor(s * 80);
          g = 0;
          b = Math.floor(20 + s * 100);
        } else if (t < 0.5) {
          const s = (t - 0.25) / 0.25;
          r = Math.floor(80 + s * 140);
          g = Math.floor(s * 20);
          b = Math.floor(120 - s * 40);
        } else if (t < 0.75) {
          const s = (t - 0.5) / 0.25;
          r = Math.floor(220 + s * 35);
          g = Math.floor(20 + s * 130);
          b = Math.floor(80 - s * 80);
        } else {
          const s = (t - 0.75) / 0.25;
          r = 255;
          g = Math.floor(150 + s * 105);
          b = Math.floor(s * 80);
        }
        return `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
      };
      
      // Draw spectrogram
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      const xStep = canvasWidth / magnitudes.length;
      const maxFreqBin = Math.min(numBins, Math.floor(8000 / (sampleRate / fftSize))); // Cap at 8kHz
      
      for (let frame = 0; frame < magnitudes.length; frame++) {
        for (let bin = 0; bin < maxFreqBin; bin++) {
          const normalized = (magnitudes[frame][bin] - minMag) / range;
          ctx.fillStyle = colorMap(normalized);
          
          const x = Math.floor(frame * xStep);
          const y = canvasHeight - Math.floor((bin / maxFreqBin) * canvasHeight);
          const h = Math.max(1, Math.ceil(canvasHeight / maxFreqBin));
          ctx.fillRect(x, y - h, Math.max(1, Math.ceil(xStep)), h);
        }
      }
      
      // Draw axis labels
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '12px sans-serif';
      ctx.fillText('0s', 5, canvasHeight - 5);
      ctx.fillText(`${(channelData.length / sampleRate).toFixed(1)}s`, canvasWidth - 45, canvasHeight - 5);
      ctx.fillText('8kHz', 5, 15);
      ctx.fillText('0Hz', 5, canvasHeight - 20);
      
      // Title
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Speech Spectrogram Analysis', canvasWidth / 2 - 100, 20);
      
      setClientSpectrogramReady(true);
      audioContext.close();
    } catch (err) {
      console.error("Client-side spectrogram generation failed:", err);
      setClientSpectrogramError(err.message);
    } finally {
      setIsGeneratingSpectrogram(false);
    }
  }, [fftRadix2]);

  // Auto-generate client spectrogram when tab is active and backend spectrogram is unavailable
  useEffect(() => {
    if (
      activeTab === "spectrogram" &&
      taskId &&
      results &&
      !results.spectrogram &&
      !results.visualization &&
      !clientSpectrogramReady &&
      !isGeneratingSpectrogram &&
      videoUrl
    ) {
      generateClientSpectrogram(videoUrl);
    }
  }, [activeTab, taskId, results, clientSpectrogramReady, isGeneratingSpectrogram, videoUrl, generateClientSpectrogram]);

  // Share result handler
  const handleShare = async () => {
    if (!taskId) return;
    setIsSharing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/share_result/${taskId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser?.id })
      });

      if (response.ok) {
        const data = await response.json();
        const fullUrl = `${window.location.origin}/shared/${data.token}`;
        setShareUrl(fullUrl);

        // Copy to clipboard
        await navigator.clipboard.writeText(fullUrl);
        alert(`Share link copied to clipboard!\n\nLink: ${fullUrl}\n\nValid for 7 days.`);
      } else {
        alert("Failed to create share link");
      }
    } catch (err) {
      console.error("Error creating share link:", err);
      alert("Failed to create share link");
    } finally {
      setIsSharing(false);
    }
  };

  // PDF Download handler
  const handleDownloadPDF = () => {
    // Generate PDF report using browser print
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to download the PDF report.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Speech Analysis Report - ${patientName || "Patient"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            h1 { color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
            h2 { color: #4f46e5; margin-top: 30px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .score { font-size: 48px; font-weight: bold; color: #10b981; text-align: center; }
            .stat { margin: 10px 0; padding: 10px; background: #f3f4f6; border-radius: 8px; }
            .stat-label { font-weight: bold; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; border: 1px solid #e5e7eb; text-align: left; }
            th { background: #f9fafb; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Speech Analysis Report</h1>
              <p><strong>Patient:</strong> ${patientName || "N/A"} (${patientId || "N/A"})</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Task ID:</strong> ${taskId}</p>
            </div>
          </div>
          
          <h2>Fluency Analysis</h2>
          <div class="score">${displayResults?.fluency_score?.toFixed(1) || displayResults?.fluencyScore?.toFixed(1) || "N/A"}%</div>
          <p style="text-align: center; color: #6b7280;">Fluency Score</p>
          
          <div class="stat">
            <span class="stat-label">Duration:</span> ${displayResults?.duration?.toFixed(1) || "N/A"} seconds
          </div>
          <div class="stat">
            <span class="stat-label">Stutter Events:</span> ${displayResults?.stuttering_events?.length || displayResults?.stutteringEvents?.length || 0}
          </div>
          <div class="stat">
            <span class="stat-label">Stutter Rate:</span> ${displayResults?.stutter_rate?.toFixed(1) || "N/A"}%
          </div>
          
          ${displayResults?.stuttering_events?.length > 0 || displayResults?.stutteringEvents?.length > 0 ? `
            <h2>Stutter Events</h2>
            <table>
              <tr><th>Time</th><th>Type</th><th>Severity</th><th>Word</th></tr>
              ${(displayResults?.stuttering_events || displayResults?.stutteringEvents || []).slice(0, 20).map(e => `
                <tr>
                  <td>${e.start_time?.toFixed(2) || e.time || "N/A"}s</td>
                  <td>${e.stutter_type || e.type || "N/A"}</td>
                  <td>${e.severity || "N/A"}</td>
                  <td>${e.word || "N/A"}</td>
                </tr>
              `).join("")}
            </table>
          ` : ""}
          
          <div class="footer">
            <p>Generated by StutterSense - AI-Powered Speech Analysis</p>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Set initial tab from navigation state
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (!taskId) {
      setError("No task ID provided");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let pollInterval = null;
    let isCompleted = false; // Local flag to track completion

    async function fetchResults() {
      // Don't fetch if already completed
      if (isCompleted) return;

      try {
        const statusResponse = await fetch(`${API_BASE_URL}/api/task_status/${taskId}`);

        if (!statusResponse.ok) {
          throw new Error(`Failed to fetch task status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();

        if (!isMounted) return;

        setTaskStatus(statusData.status);

        // Store video URL if available
        if (statusData.video_url) {
          setVideoUrl(statusData.video_url);
        }

        // Store patient info if available
        if (statusData.patient_name) {
          setPatientName(statusData.patient_name);
        }
        if (statusData.patient_id) {
          setPatientId(statusData.patient_id);
        }

        if (statusData.status === "completed") {
          isCompleted = true; // Mark as completed to stop polling

          // First fetch: get results WITHOUT visualization (fast, ~10KB)
          const resultResponse = await fetch(`${API_BASE_URL}/api/get_result/${taskId}`);

          if (!resultResponse.ok) {
            throw new Error(`Failed to fetch results: ${resultResponse.status}`);
          }

          const resultData = await resultResponse.json();

          if (!isMounted) return;

          // Construct fallback spectrogram URL from taskId (in case API doesn't return it)
          const fallbackSpectrogramUrl = `/analysis_results/${taskId}/spectrogram.png`;
          const spectrogramFromApi = resultData.spectrogram || null;

          const transformedResults = {
            taskId: taskId,
            timestamp: new Date().toISOString(),
            fluencyScore: resultData.fluency_score || 0,
            stutteringEvents: resultData.stuttering_events || [],
            disfluencyTypes: resultData.disfluency_types || {},
            duration: resultData.duration || 0,
            analysisDetails: resultData.analysis_details || {},
            visualization: null, // Will be loaded separately
            spectrogram: spectrogramFromApi, // URL string, available in initial fetch
            transcription: resultData.transcription || "",
            language: resultData.language || "en",
            transcriptionModel: resultData.transcription_model || "Whisper",
            videoAnalysis: resultData.video_analysis || null,
            audioFluencyScore: resultData.audio_fluency_score ?? null,
            videoFluencyScore: resultData.video_fluency_score ?? null,
            combinedFluencyScore: resultData.combined_fluency_score ?? null,
          };

          setResults(transformedResults);
          setError(null);
          setIsLoading(false);

          // Stop polling immediately
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }

          // Second fetch: get visualization separately (large, ~700KB, only once)
          try {
            const vizResponse = await fetch(`${API_BASE_URL}/api/get_result/${taskId}?include_visualization=true`);
            if (vizResponse.ok && isMounted) {
              const vizData = await vizResponse.json();
              if (vizData.visualization || vizData.spectrogram) {
                setResults(prev => ({
                  ...prev,
                  visualization: vizData.visualization || prev.visualization,
                  spectrogram: vizData.spectrogram || prev.spectrogram
                }));
              }
            }
          } catch (vizErr) {
            console.warn("Could not load visualization:", vizErr);
          }

          // If spectrogram URL is still missing, try the fallback URL directly
          if (!spectrogramFromApi && isMounted) {
            try {
              const spectrogramCheckUrl = `${API_BASE_URL}${fallbackSpectrogramUrl}`;
              const headResponse = await fetch(spectrogramCheckUrl, { method: 'HEAD' });
              if (headResponse.ok && isMounted) {
                console.log("Spectrogram found via fallback URL:", fallbackSpectrogramUrl);
                setResults(prev => ({
                  ...prev,
                  spectrogram: fallbackSpectrogramUrl
                }));
              }
            } catch (specErr) {
              console.warn("Fallback spectrogram not available:", specErr);
            }
          }

        } else if (statusData.status === "failed") {
          isCompleted = true;
          setError("Analysis failed. Please try again.");
          setIsLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        if (isMounted) {
          setError(err.message || "Failed to load results");
          setIsLoading(false);
        }
      }
    }

    fetchResults();

    // Only poll if not already completed
    pollInterval = setInterval(() => {
      if (!isCompleted) {
        fetchResults();
      }
    }, 2000);

    // ✅ FIX: Max timeout — stop polling after 10 minutes and show a clear error.
    // Without this, if the server's AI model crashes or the task gets stuck,
    // users see an infinite loading spinner with no way to recover.
    const maxWaitTimeout = setTimeout(() => {
      if (!isCompleted && isMounted) {
        isCompleted = true;
        if (pollInterval) clearInterval(pollInterval);
        setError(
          "Analysis is taking longer than expected (10+ minutes). " +
          "The server may be busy or the file may be too large. " +
          "Please try again with a shorter recording (under 2 minutes)."
        );
        setIsLoading(false);
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      clearTimeout(maxWaitTimeout);
    };
  }, [taskId]); // Removed taskStatus from dependencies to prevent re-running

  // Fetch existing SLP assessment (if any) and pre-fill the form
  useEffect(() => {
    if (!taskId || !isSLP) return;

    const fetchExistingAssessment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/get_slp_assessment/${taskId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.assessment) {
            const a = data.assessment;
            setExistingAssessment(a);

            // Pre-fill the form with saved values
            setSlpAssessment({
              reading_percent_ss: a.raw_inputs?.reading_percent_ss || "",
              speaking_percent_ss: a.raw_inputs?.speaking_percent_ss || "",
              duration_avg: a.raw_inputs?.duration_avg || "",
              distracting_sounds: a.physical_concomitants?.distracting_sounds ?? 0,
              facial_grimaces: a.physical_concomitants?.facial_grimaces ?? 0,
              head_movements: a.physical_concomitants?.head_movements ?? 0,
              clinical_notes: a.clinical_notes || "",
              model_is_accurate: a.model_validation?.is_accurate ?? null,
              model_feedback: a.model_validation?.feedback || "",
              age_group: a.raw_inputs?.age_group || "school_age",
            });
          }
        }
      } catch (err) {
        console.warn("Could not load existing SLP assessment:", err);
      }
    };

    fetchExistingAssessment();
  }, [taskId, isSLP]);

  // Demo data - only used when no taskId is provided (demo mode)
  const mockResults = {
    taskId: "demo-task",
    timestamp: new Date().toISOString(),
    fluencyScore: 78,
    stutteringEvents: [
      { time: "0:05", type: "Repetition", severity: "Mild", word: "the" },
      { time: "0:12", type: "Prolongation", severity: "Moderate", word: "speaking" },
      { time: "0:28", type: "Block", severity: "Severe", word: "difficult" },
      { time: "0:35", type: "Repetition", severity: "Mild", word: "and" },
      { time: "0:42", type: "Interjection", severity: "Mild", word: "um" },
    ],
    disfluencyTypes: {
      Repetition: 5,
      Prolongation: 3,
      Block: 2,
      Interjection: 4,
    },
    duration: 45,
    analysisDetails: {
      totalWords: 120,
      stutteredWords: 14,
      speechRate: 2.67,
      pauseDuration: 3.2,
    },
    videoAnalysis: {
      overall_metrics: {
        avg_ear: 0.28,
        avg_mar: 0.15,
        head_stability_score: 92.4,
        facial_tension_index: 1.2
      }
    }
  };

  // IMPORTANT: Only use mock data if explicitly in demo mode (no taskId)
  // Otherwise, use actual results from the API
  const isDemo = !taskId;
  const displayResults = isDemo ? mockResults : results;

  // Calculate dynamic fluency scores based on analysis results with full backward-compatibility fallbacks
  const audioFluencyScore = displayResults
    ? (displayResults.audioFluencyScore ?? (() => {
        if (!displayResults.videoAnalysis) return displayResults.fluencyScore;
        const videoEventsCount = (displayResults.stutteringEvents || []).filter(e => e.source === 'video').length;
        return Math.min(100, displayResults.fluencyScore + videoEventsCount * 2.0);
      })())
    : 0;

  const videoFluencyScore = displayResults
    ? (displayResults.videoFluencyScore ?? (() => {
        if (!displayResults.videoAnalysis) return null;
        const videoEventsCount = (displayResults.stutteringEvents || []).filter(e => e.source === 'video' || e.source === 'both').length;
        const videoScore = Math.max(0, 100 - videoEventsCount * 5.0);
        const headStability = displayResults.videoAnalysis?.overall_metrics?.head_stability_score ?? 100.0;
        return Math.round((0.8 * videoScore + 0.2 * headStability) * 10) / 10;
      })())
    : null;

  const combinedFluencyScore = displayResults
    ? (displayResults.combinedFluencyScore ?? displayResults.fluencyScore)
    : 0;

  // If we have a real taskId but no results yet, show loading or processing state
  const showLoading = !isDemo && (isLoading || (!results && taskStatus !== "completed"));

  // Chart data - safely handle null displayResults
  const disfluencyData = displayResults ? Object.entries(displayResults.disfluencyTypes || {}).map(
    ([type, count]) => ({ name: type, count, fill: type === "Repetition" ? "#3b82f6" : type === "Prolongation" ? "#8b5cf6" : type === "Block" ? "#ef4444" : "#f59e0b" })
  ) : [];

  const pieData = displayResults ? Object.entries(displayResults.disfluencyTypes || {}).map(
    ([name, value]) => ({ name, value })
  ) : [];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b"];

  const eventTimeline = displayResults ? (displayResults.stutteringEvents || []).map((event, idx) => ({
    time: event.time || `${idx}:00`,
    severity: event.severity === "Severe" ? 3 : event.severity === "Moderate" ? 2 : 1,
    type: event.type,
  })) : [];

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    ...(shouldShowFeature(appConfigs.show_transcription_tab)
      ? [{ id: "transcription", label: "Transcription", icon: FileAudio }]
      : []),
    { id: "spectrogram", label: "Spectrogram", icon: Volume2 },
    { id: "events", label: "Events", icon: MessageSquare },
    ...(shouldShowFeature(appConfigs.show_analytics_tab)
      ? [{ id: "charts", label: "Analytics", icon: BarChart2 }]
      : []),
    ...(isSLP ? [{ id: "slp-assessment", label: "SLP Assessment", icon: ClipboardCheck }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/analyze")}
                  className="rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                Analysis <span className="gradient-text">Results</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                {patientName && (
                  <p className="text-foreground font-medium">
                    <span className="text-muted-foreground">Patient:</span> {patientName}
                  </p>
                )}
                {patientId && (
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {patientId}
                  </span>
                )}
                <p className="text-muted-foreground text-sm">
                  Task ID: {taskId?.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl" onClick={handleShare} disabled={isSharing}>
                <Share2 className="h-4 w-4 mr-2" />
                {isSharing ? "Sharing..." : "Share"}
              </Button>
              <Button className="btn-premium text-white rounded-xl" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {showLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-[60vh]"
            >
              <Card className="glass border-white/10 shadow-2xl">
                <CardContent className="py-16 px-20 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-6"
                  >
                    <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">
                    {taskStatus === "processing" ? "Analyzing Your Speech" : "Loading Results"}
                  </h3>
                  <p className="text-muted-foreground">
                    {taskStatus === "processing"
                      ? "Our AI is processing your recording with multilingual support..."
                      : "Fetching your analysis results..."}
                  </p>
                  {taskStatus === "processing" && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Detecting: English, Hindi (हिंदी), Marathi (मराठी)
                    </p>
                  )}
                  <div className="mt-6 flex justify-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-primary"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
            <Card className="border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
              <CardContent className="py-8 flex items-center gap-6">
                <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/50">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 text-lg mb-1">Error Loading Results</h3>
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                </div>
                <Button onClick={() => navigate("/analyze")} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Content */}
        {!showLoading && !error && displayResults && (
          <>
            {/* Main Score and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Score Circle Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1"
              >
                <Card className="glass border-white/10 dark:border-white/5 h-full">
                  <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                    <ScoreCircle score={displayResults.fluencyScore} delay={200} />
                    <div className="mt-6 text-center">
                      <p className="text-lg font-semibold">
                        {displayResults.fluencyScore >= 80 ? "Excellent" : displayResults.fluencyScore >= 60 ? "Good" : "Needs Improvement"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on {displayResults.analysisDetails?.totalWords || 0} words analyzed
                      </p>
                      {/* Language Badge */}
                      {displayResults.language && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                          <span className="text-xs text-primary font-medium">
                            {displayResults.language === "hi" ? "🇮🇳 Hindi (हिंदी)" :
                              displayResults.language === "mr" ? "🇮🇳 Marathi (मराठी)" :
                                "🇬🇧 English"}
                          </span>
                        </div>
                      )}
                      {/* Model Badge */}
                      {displayResults.transcription_model && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            🤖 {displayResults.transcription_model === "IndicConformer"
                              ? "IndicConformer (AI4Bharat)"
                              : "Whisper (OpenAI)"}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Stats Grid */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                <StatCard
                  icon={Clock}
                  label="Duration"
                  value={`${displayResults.duration}s`}
                  delay={0.2}
                  color="from-blue-500 to-cyan-500"
                />
                <StatCard
                  icon={Volume2}
                  label="Total Words"
                  value={displayResults.analysisDetails?.totalWords || 0}
                  trend={shouldShowFeature(appConfigs.show_words_trend) ? "up" : undefined}
                  trendValue={shouldShowFeature(appConfigs.show_words_trend) ? "+12%" : undefined}
                  delay={0.3}
                  color="from-emerald-500 to-green-500"
                />
                <StatCard
                  icon={AlertCircle}
                  label="Stutter Events"
                  value={(displayResults.stutteringEvents || []).length}
                  delay={0.4}
                  color="from-amber-500 to-orange-500"
                />
                <StatCard
                  icon={Zap}
                  label="Speech Rate"
                  value={`${displayResults.analysisDetails?.speechRate || 0} w/s`}
                  delay={0.5}
                  color="from-purple-500 to-pink-500"
                />
                {displayResults.videoAnalysis && shouldShowFeature(appConfigs.show_video_analysis) && (
                  <>
                    <StatCard
                      icon={Eye}
                      label="Visual Stability"
                      value={`${displayResults.videoAnalysis.overall_metrics?.head_stability_score?.toFixed(1) || 0}%`}
                      subValue="Head/Neck position"
                      delay={0.6}
                      color="from-emerald-500 to-teal-500"
                    />
                    <StatCard
                      icon={Activity}
                      label="Facial Tension"
                      value={displayResults.videoAnalysis.overall_metrics?.facial_tension_index?.toFixed(1) || 0}
                      subValue="MAR/EAR deviance"
                      delay={0.7}
                      color="from-orange-500 to-red-500"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  {/* Disfluency Distribution */}
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-primary" />
                        Disfluency Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={disfluencyData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {disfluencyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Multi-modal Fluency Scores */}
                  <Card className="glass border-white/10 dark:border-white/5 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Multi-modal Fluency Scores
                      </CardTitle>
                      <CardDescription>
                        Fluency scores calculated across audio, video, and combined channels for this session
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const showVideoFluency = displayResults?.videoAnalysis && 
                          (appConfigs.show_video_fluency !== undefined ? shouldShowFeature(appConfigs.show_video_fluency) : shouldShowFeature(appConfigs.show_video_accuracy));

                        const showCombinedFluency = displayResults?.videoAnalysis && 
                          (appConfigs.show_combined_fluency !== undefined ? shouldShowFeature(appConfigs.show_combined_fluency) : shouldShowFeature(appConfigs.show_combined_accuracy));

                        return (
                          <div className={`grid gap-5 ${
                            showVideoFluency && showCombinedFluency
                              ? "grid-cols-1 md:grid-cols-3"
                              : showVideoFluency || showCombinedFluency
                                ? "grid-cols-1 md:grid-cols-2"
                                : "grid-cols-1"
                          }`}>
                            {/* Audio Fluency Score - Always Visible */}
                            <ModelAccuracyCard
                              label="Audio Fluency Score"
                              value={audioFluencyScore}
                              icon={<Volume2 className="h-5 w-5" />}
                              gradient="from-blue-500 to-cyan-500"
                              bgGlow="rgba(59,130,246,0.12)"
                              desc="Fluency rate based purely on speech patterns, pauses, and disfluencies"
                              delay={0}
                            />

                            {/* Video Fluency Score - Admin Togglable */}
                            {showVideoFluency && (
                              <ModelAccuracyCard
                                label="Video Fluency Score"
                                value={videoFluencyScore}
                                icon={<Eye className="h-5 w-5" />}
                                gradient="from-emerald-500 to-teal-500"
                                bgGlow="rgba(16,185,129,0.12)"
                                desc="Fluency rate based on physical tension, grimaces, and head stability"
                                delay={150}
                              />
                            )}

                            {/* Combined Fluency Score - Admin Togglable */}
                            {showCombinedFluency && (
                              <ModelAccuracyCard
                                label="Combined Fluency Score"
                                value={combinedFluencyScore}
                                icon={<Zap className="h-5 w-5" />}
                                gradient="from-violet-500 to-purple-500"
                                bgGlow="rgba(139,92,246,0.12)"
                                desc="Holistic fluency score integrating both vocal and physical patterns"
                                delay={300}
                              />
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Multi-modal Fusion Breakdown */}
                  <Card className="glass border-white/10 dark:border-white/5 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Multi-modal Detection Breakdown
                      </CardTitle>
                      <CardDescription>
                        Overlap between audio indicators and visual behaviors
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              Confirmed (Both)
                            </span>
                            <span className="text-sm font-bold">
                              {displayResults.stutteringEvents?.filter(e => e.source === "both").length || 0}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full">
                             <div 
                              className="h-full bg-red-500 rounded-full" 
                              style={{ width: `${(displayResults.stutteringEvents?.filter(e => e.source === "both").length / displayResults.stutteringEvents?.length * 100) || 0}%` }}
                             />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              Audio Indicators
                            </span>
                            <span className="text-sm font-bold">
                              {displayResults.stutteringEvents?.filter(e => e.source === "audio" || !e.source).length || 0}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full">
                             <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${(displayResults.stutteringEvents?.filter(e => e.source === "audio" || !e.source).length / displayResults.stutteringEvents?.length * 100) || 0}%` }}
                             />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-emerald-500" />
                              Visual Indicators
                            </span>
                            <span className="text-sm font-bold">
                              {displayResults.stutteringEvents?.filter(e => e.source === "video").length || 0}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full">
                             <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${(displayResults.stutteringEvents?.filter(e => e.source === "video").length / displayResults.stutteringEvents?.length * 100) || 0}%` }}
                             />
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-sm text-center text-muted-foreground">
                          Overlapping detections between audio and video suggest a <span className="text-red-500 font-bold">100% confidence level</span> for that stutter event.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transcription with Stutter Highlights */}
                  {displayResults.transcription && shouldShowFeature(appConfigs.show_transcription_tab) && (
                    <Card className="glass border-white/10 dark:border-white/5 lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-primary" />
                          Speech Transcription
                        </CardTitle>
                        <CardDescription>
                          Words in color indicate detected disfluencies (hover for details)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                          <p className="text-lg leading-relaxed">
                            {(() => {
                              // Get stuttered words from events
                              const stutteredWords = new Map();
                              (displayResults.stutteringEvents || []).forEach(event => {
                                if (event.word) {
                                  stutteredWords.set(event.word.toLowerCase(), {
                                    type: event.type,
                                    severity: event.severity
                                  });
                                }
                              });

                              // Split transcription into words and highlight stuttered ones
                              const words = displayResults.transcription.split(/\s+/);
                              return words.map((word, idx) => {
                                const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
                                const stutterInfo = stutteredWords.get(cleanWord);

                                if (stutterInfo) {
                                  const colorClass = stutterInfo.type === "Repetition" ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/50" :
                                    stutterInfo.type === "Prolongation" ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50" :
                                      stutterInfo.type === "Block" ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/50" :
                                        "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50";

                                  return (
                                    <span
                                      key={idx}
                                      className={`inline-block px-1 mx-0.5 rounded border ${colorClass} cursor-help`}
                                      title={`${stutterInfo.type} (${stutterInfo.severity})`}
                                    >
                                      {word}
                                    </span>
                                  );
                                }
                                return <span key={idx}>{word} </span>;
                              });
                            })()}
                          </p>
                        </div>

                        {/* Stutter Type Legend */}
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500/50" />
                            <span className="text-xs text-muted-foreground">Repetition</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-500/50" />
                            <span className="text-xs text-muted-foreground">Prolongation</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500/50" />
                            <span className="text-xs text-muted-foreground">Block</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-amber-500/50" />
                            <span className="text-xs text-muted-foreground">Interjection</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {activeTab === "transcription" && (
                <motion.div
                  key="transcription"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileAudio className="h-5 w-5 text-primary" />
                        Full Transcription
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span>Language: {displayResults.language?.toUpperCase() || "EN"}</span>
                        <span>•</span>
                        <span>Model: {displayResults.transcriptionModel || "Whisper"}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Full Transcription Text */}
                      <div className="p-6 bg-muted/30 rounded-lg border border-border/50">
                        {displayResults.transcription ? (
                          <p className="text-lg leading-relaxed whitespace-pre-wrap">
                            {(() => {
                              const stutteredWords = new Map();
                              (displayResults.stutteringEvents || []).forEach(event => {
                                if (event.word) {
                                  stutteredWords.set(event.word.toLowerCase(), {
                                    type: event.type,
                                    severity: event.severity
                                  });
                                }
                              });

                              const words = displayResults.transcription.split(/\s+/);
                              return words.map((word, idx) => {
                                const cleanWord = word.replace(/[.,!?;:]/g, '').toLowerCase();
                                const stutterInfo = stutteredWords.get(cleanWord);

                                if (stutterInfo) {
                                  const colorClass = stutterInfo.type === "Repetition" ? "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/50" :
                                    stutterInfo.type === "Prolongation" ? "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/50" :
                                      stutterInfo.type === "Block" ? "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/50" :
                                        "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50";

                                  return (
                                    <span
                                      key={idx}
                                      className={`inline-block px-1 mx-0.5 rounded border ${colorClass} cursor-help`}
                                      title={`${stutterInfo.type} (${stutterInfo.severity})`}
                                    >
                                      {word}
                                    </span>
                                  );
                                }
                                return <span key={idx}>{word} </span>;
                              });
                            })()}
                          </p>
                        ) : (
                          <p className="text-muted-foreground italic">No transcription available</p>
                        )}
                      </div>

                      {/* Stutter Type Legend */}
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
                        <span className="text-sm font-medium text-muted-foreground">Legend:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-blue-500/50" />
                          <span className="text-xs text-muted-foreground">Repetition</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-purple-500/50" />
                          <span className="text-xs text-muted-foreground">Prolongation</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-red-500/50" />
                          <span className="text-xs text-muted-foreground">Block</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded bg-amber-500/50" />
                          <span className="text-xs text-muted-foreground">Interjection</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "spectrogram" && (
                <motion.div
                  key="spectrogram"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Volume2 className="h-5 w-5 text-primary" />
                        Speech Spectrogram
                      </CardTitle>
                      <CardDescription>
                        Visual representation of speech frequency over time - useful for SLP verification
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {displayResults.spectrogram ? (
                        <div className="space-y-4">
                          <div className="rounded-lg overflow-hidden border border-border/50 bg-black/5 dark:bg-white/5">
                            <img
                              src={displayResults.spectrogram.startsWith('/') ? `${API_BASE_URL}${displayResults.spectrogram}` : `data:image/png;base64,${displayResults.spectrogram}`}
                              alt="Speech Spectrogram Analysis"
                              className="w-full h-auto"
                              onError={(e) => {
                                console.warn("Backend spectrogram image failed to load, falling back to client-side generation");
                                // Clear the spectrogram URL so the client-side fallback renders
                                setResults(prev => prev ? { ...prev, spectrogram: null } : prev);
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span>X-axis: Time (seconds)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span>Y-axis: Frequency (Hz)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <span>Color: Amplitude (dB)</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            💡 <strong>For SLPs:</strong> Use this spectrogram to verify detected stuttering events.
                            Look for irregular patterns, gaps (blocks), elongated formants (prolongations), or repeated patterns (repetitions).
                          </p>
                        </div>
                      ) : displayResults.visualization ? (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Spectrogram is included in the full analysis visualization below (second panel):
                          </p>
                          <div className="rounded-lg overflow-hidden border border-border/50 bg-black/5 dark:bg-white/5">
                            <img
                              src={displayResults.visualization.startsWith('/') ? `${API_BASE_URL}${displayResults.visualization}` : `data:image/png;base64,${displayResults.visualization}`}
                              alt="Full Speech Analysis Visualization"
                              className="w-full h-auto"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Client-side spectrogram canvas */}
                          <div className="rounded-lg overflow-hidden border border-border/50 bg-black/5 dark:bg-white/5">
                            <canvas
                              ref={spectrogramCanvasRef}
                              className="w-full h-auto"
                              style={{ display: clientSpectrogramReady ? 'block' : 'none' }}
                            />
                          </div>

                          {/* Loading state while generating */}
                          {isGeneratingSpectrogram && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                              <p className="text-muted-foreground font-medium">Generating spectrogram from audio...</p>
                              <p className="text-sm text-muted-foreground/70 mt-1">This may take a few seconds</p>
                            </div>
                          )}

                          {/* Error state */}
                          {clientSpectrogramError && !isGeneratingSpectrogram && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                              <p className="text-muted-foreground">Could not generate spectrogram</p>
                              <p className="text-sm text-muted-foreground/70 mt-1">{clientSpectrogramError}</p>
                              {videoUrl && (
                                <Button
                                  variant="outline"
                                  className="mt-4 rounded-xl"
                                  onClick={() => {
                                    setClientSpectrogramReady(false);
                                    setClientSpectrogramError(null);
                                    generateClientSpectrogram(videoUrl);
                                  }}
                                >
                                  Retry
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Initial state - no audio available */}
                          {!isGeneratingSpectrogram && !clientSpectrogramReady && !clientSpectrogramError && !videoUrl && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <Volume2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                              <p className="text-muted-foreground">Spectrogram is not available</p>
                              <p className="text-sm text-muted-foreground/70 mt-1">The audio file could not be accessed for visualization</p>
                            </div>
                          )}

                          {/* Axis legend (shown when spectrogram is ready) */}
                          {clientSpectrogramReady && (
                            <>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                  <span>X-axis: Time (seconds)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                  <span>Y-axis: Frequency (Hz)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary" />
                                  <span>Color: Amplitude (dB)</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                💡 <strong>For SLPs:</strong> Use this spectrogram to verify detected stuttering events.
                                Look for irregular patterns, gaps (blocks), elongated formants (prolongations), or repeated patterns (repetitions).
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "events" && (
                <motion.div
                  key="events"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle>Stuttering Events Timeline</CardTitle>
                      <CardDescription>Detailed breakdown of detected stuttering events</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(displayResults.stutteringEvents || []).map((event, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Time</p>
                                <p className="font-mono font-semibold">{event.time}</p>
                              </div>
                              <div className="h-8 w-px bg-border" />
                              <div>
                                <p className="font-semibold flex items-center gap-2">
                                  {event.type}
                                  {event.source === "both" && <Zap className="h-3 w-3 text-red-500 fill-red-500" />}
                                  {event.source === "video" && <Eye className="h-3 w-3 text-emerald-500" />}
                                </p>
                                {event.word && <p className="text-sm text-muted-foreground">Word: "{event.word}"</p>}
                                {event.source === "both" && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Verified by Audio & Video</p>}
                              </div>
                            </div>
                            <SeverityBadge severity={event.severity} />
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === "charts" && (
                <motion.div
                  key="charts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Severity Over Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={eventTimeline}>
                          <defs>
                            <linearGradient id="severityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="time" />
                          <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(v) => ["", "Mild", "Moderate", "Severe"][v]} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="severity"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            fill="url(#severityGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Analysis Details Accordion */}
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle>Detailed Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="metrics">
                          <AccordionTrigger>Speech Metrics</AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground">Speech Rate</p>
                                <p className="text-2xl font-bold">{displayResults.analysisDetails?.speechRate || 0}</p>
                                <p className="text-xs text-muted-foreground">words/sec</p>
                              </div>
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground">Pause Duration</p>
                                <p className="text-2xl font-bold">{displayResults.analysisDetails?.pauseDuration || 0}</p>
                                <p className="text-xs text-muted-foreground">seconds</p>
                              </div>
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground">Stuttered Words</p>
                                <p className="text-2xl font-bold">{displayResults.analysisDetails?.stutteredWords || 0}</p>
                                <p className="text-xs text-muted-foreground">words</p>
                              </div>
                              <div className="p-4 rounded-xl bg-muted/50">
                                <p className="text-sm text-muted-foreground">Total Words</p>
                                <p className="text-2xl font-bold">{displayResults.analysisDetails?.totalWords || 0}</p>
                                <p className="text-xs text-muted-foreground">words</p>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        {displayResults.videoAnalysis && shouldShowFeature(appConfigs.show_video_analysis) && (
                          <AccordionItem value="video-metrics">
                            <AccordionTrigger>Video Analysis Metrics</AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-muted/50">
                                  <p className="text-sm text-muted-foreground">Head Stability</p>
                                  <p className="text-2xl font-bold">{displayResults.videoAnalysis.overall_metrics?.head_stability_score?.toFixed(1) || 0}%</p>
                                  <p className="text-xs text-muted-foreground">Score</p>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/50">
                                  <p className="text-sm text-muted-foreground">Avg EAR</p>
                                  <p className="text-2xl font-bold">{displayResults.videoAnalysis.overall_metrics?.avg_ear?.toFixed(3) || 0}</p>
                                  <p className="text-xs text-muted-foreground">Eye Aspect Ratio</p>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/50">
                                  <p className="text-sm text-muted-foreground">Avg MAR</p>
                                  <p className="text-2xl font-bold">{displayResults.videoAnalysis.overall_metrics?.avg_mar?.toFixed(3) || 0}</p>
                                  <p className="text-xs text-muted-foreground">Mouth Aspect Ratio</p>
                                </div>
                                <div className="p-4 rounded-xl bg-muted/50">
                                  <p className="text-sm text-muted-foreground">Facial Tension</p>
                                  <p className="text-2xl font-bold">{displayResults.videoAnalysis.overall_metrics?.facial_tension_index?.toFixed(1) || 0}</p>
                                  <p className="text-xs text-muted-foreground">Index</p>
                                </div>
                              </div>
                              <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-sm text-muted-foreground">
                                  Visual indicators detect physical concomitants like eye squeezing, jaw tension, and sudden head movements that often accompany stuttering blocks.
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* SLP Assessment Tab - Only visible for SLPs */}
              {activeTab === "slp-assessment" && isSLP && (
                <motion.div
                  key="slp-assessment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Previously Assessed Banner */}
                  {existingAssessment && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          Previously Assessed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SSI-4 assessment was saved on{" "}
                          {existingAssessment.assessed_at
                            ? new Date(existingAssessment.assessed_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                                hour: "2-digit", minute: "2-digit"
                              })
                            : "a previous date"}
                          {existingAssessment.severity_rating && (
                            <> — Severity: <strong>{existingAssessment.severity_rating}</strong></>
                          )}
                          {existingAssessment.ssi4_scores?.total != null && (
                            <> — Total Score: <strong>{existingAssessment.ssi4_scores.total}</strong></>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-lg">
                        Editing will overwrite
                      </span>
                    </div>
                  )}

                  {/* Recording Playback - Large Video Player */}
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Recording Playback
                      </CardTitle>
                      <CardDescription>
                        Watch/listen to the recording to verify AI analysis accuracy
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
                        {videoUrl ? (
                          <video
                            controls
                            className="w-full h-full object-contain"
                            preload="metadata"
                            src={`${API_BASE_URL}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`}
                          >
                            Your browser does not support video/audio playback.
                          </video>
                        ) : taskId ? (
                          <div className="text-center py-8">
                            <Loader2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground animate-spin" />
                            <p className="text-muted-foreground">Loading recording...</p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Eye className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No recording available</p>
                          </div>
                        )}
                      </div>
                    </CardContent>

                  </Card>

                  {/* AI Model Results Summary */}
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        AI Analysis Results (for Validation)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                          <p className="text-sm text-muted-foreground">Fluency Score</p>
                          <p className="text-2xl font-bold text-primary">{displayResults?.fluencyScore || 0}%</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                          <p className="text-sm text-muted-foreground">Stutter Events</p>
                          <p className="text-2xl font-bold text-amber-500">{displayResults?.stutteringEvents?.length || 0}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="text-2xl font-bold text-blue-500">{displayResults?.duration?.toFixed(1) || 0}s</p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                          <p className="text-sm text-muted-foreground">Detected Types</p>
                          <p className="text-2xl font-bold text-purple-500">{Object.keys(displayResults?.disfluencyTypes || {}).length}</p>
                        </div>
                      </div>

                      {/* Model Validation Feedback */}
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                        <p className="text-sm font-medium mb-3">Is the AI analysis accurate?</p>
                        <div className="flex gap-3">
                          <Button
                            variant={slpAssessment.model_is_accurate === true ? "default" : "outline"}
                            onClick={() => setSlpAssessment(prev => ({ ...prev, model_is_accurate: true }))}
                            className="flex-1"
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Accurate
                          </Button>
                          <Button
                            variant={slpAssessment.model_is_accurate === false ? "destructive" : "outline"}
                            onClick={() => setSlpAssessment(prev => ({ ...prev, model_is_accurate: false }))}
                            className="flex-1"
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Inaccurate
                          </Button>
                        </div>
                        {slpAssessment.model_is_accurate === false && (
                          <textarea
                            value={slpAssessment.model_feedback}
                            onChange={(e) => setSlpAssessment(prev => ({ ...prev, model_feedback: e.target.value }))}
                            placeholder="Describe what the model got wrong..."
                            className="mt-3 w-full p-3 rounded-lg bg-background border border-border/50 text-sm resize-none"
                            rows={3}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* SSI-4 Assessment Form - Accurate Implementation */}
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                        SSI-4 Assessment
                      </CardTitle>
                      <CardDescription>
                        Stuttering Severity Instrument - 4th Edition (Glyndon D. Riley)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Age Group Selection */}
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                        <label className="text-sm font-medium mb-2 block">Age Group</label>
                        <div className="flex gap-3">
                          {[
                            { value: "preschool", label: "Preschool" },
                            { value: "school_age", label: "School-Age" },
                            { value: "adult", label: "Adult" }
                          ].map(opt => (
                            <label
                              key={opt.value}
                              className={`flex-1 p-3 rounded-lg border cursor-pointer text-center transition-all ${slpAssessment.age_group === opt.value
                                  ? "bg-primary/20 border-primary/50 text-primary"
                                  : "bg-muted/30 border-border/50 hover:bg-muted/50"
                                }`}
                            >
                              <input
                                type="radio"
                                name="age_group"
                                value={opt.value}
                                checked={slpAssessment.age_group === opt.value}
                                onChange={(e) => setSlpAssessment(prev => ({ ...prev, age_group: e.target.value }))}
                                className="sr-only"
                              />
                              <span className="text-sm font-medium">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* FREQUENCY SECTION */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-lg flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">1</span>
                          Frequency
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Reading Task */}
                          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                            <label className="text-sm font-medium mb-2 block">1. Reading Task (%SS)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={slpAssessment.reading_percent_ss}
                              onChange={(e) => setSlpAssessment(prev => ({ ...prev, reading_percent_ss: e.target.value }))}
                              placeholder="Enter %SS"
                              className="w-full p-3 rounded-lg bg-background border border-border/50 text-lg font-mono"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              Task Score: <span className="font-bold text-primary">
                                {(() => {
                                  const pss = parseFloat(slpAssessment.reading_percent_ss) || 0;
                                  if (pss >= 21) return 9;
                                  if (pss >= 13) return 8;
                                  if (pss >= 8) return 7;
                                  if (pss >= 5) return 6;
                                  if (pss >= 3) return 5;
                                  if (pss >= 2) return 4;
                                  if (pss >= 1) return 2;
                                  return 0;
                                })()}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              1→2, 2→4, 3-4→5, 5-7→6, 8-12→7, 13-20→8, 21+→9
                            </p>
                          </div>

                          {/* Speaking Task */}
                          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                            <label className="text-sm font-medium mb-2 block">2. Speaking Task (%SS)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={slpAssessment.speaking_percent_ss}
                              onChange={(e) => setSlpAssessment(prev => ({ ...prev, speaking_percent_ss: e.target.value }))}
                              placeholder="Enter %SS"
                              className="w-full p-3 rounded-lg bg-background border border-border/50 text-lg font-mono"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              Task Score: <span className="font-bold text-primary">
                                {(() => {
                                  const pss = parseFloat(slpAssessment.speaking_percent_ss) || 0;
                                  if (pss >= 22) return 9;
                                  if (pss >= 12) return 8;
                                  if (pss >= 8) return 7;
                                  if (pss >= 6) return 6;
                                  if (pss >= 4) return 5;
                                  if (pss >= 3) return 4;
                                  if (pss >= 2) return 3;
                                  if (pss >= 1) return 2;
                                  return 0;
                                })()}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              1→2, 2→3, 3→4, 4-5→5, 6-7→6, 8-11→7, 12-21→8, 22+→9
                            </p>
                          </div>
                        </div>

                        {/* Frequency Score Display */}
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex justify-between items-center">
                          <span className="text-sm font-medium">Frequency Score (Reading + Speaking)</span>
                          <span className="text-xl font-bold text-primary">
                            {(() => {
                              const reading = parseFloat(slpAssessment.reading_percent_ss) || 0;
                              const speaking = parseFloat(slpAssessment.speaking_percent_ss) || 0;

                              // Reading Task Score
                              let readingScore = 0;
                              if (reading >= 21) readingScore = 9;
                              else if (reading >= 13) readingScore = 8;
                              else if (reading >= 8) readingScore = 7;
                              else if (reading >= 5) readingScore = 6;
                              else if (reading >= 3) readingScore = 5;
                              else if (reading >= 2) readingScore = 4;
                              else if (reading >= 1) readingScore = 2;

                              // Speaking Task Score
                              let speakingScore = 0;
                              if (speaking >= 22) speakingScore = 9;
                              else if (speaking >= 12) speakingScore = 8;
                              else if (speaking >= 8) speakingScore = 7;
                              else if (speaking >= 6) speakingScore = 6;
                              else if (speaking >= 4) speakingScore = 5;
                              else if (speaking >= 3) speakingScore = 4;
                              else if (speaking >= 2) speakingScore = 3;
                              else if (speaking >= 1) speakingScore = 2;

                              return readingScore + speakingScore;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* DURATION SECTION */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-lg flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">2</span>
                          Duration
                        </h4>

                        <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                          <label className="text-sm font-medium mb-2 block">
                            Average length of 3 longest stuttering events (timed to nearest 1/10th second)
                          </label>
                          <select
                            value={slpAssessment.duration_avg}
                            onChange={(e) => setSlpAssessment(prev => ({ ...prev, duration_avg: e.target.value }))}
                            className="w-full p-3 rounded-lg bg-background border border-border/50 text-base"
                          >
                            <option value="">Select duration...</option>
                            <option value="2">Fleeting (0.5 sec or less) → Score: 2</option>
                            <option value="4">Half-second (0.5 - 0.9 sec) → Score: 4</option>
                            <option value="6">1 full second (1.0 - 1.9 sec) → Score: 6</option>
                            <option value="8">2 seconds (2.0 - 2.9 sec) → Score: 8</option>
                            <option value="10">3 seconds (3.0 - 4.9 sec) → Score: 10</option>
                            <option value="12">5 seconds (5.0 - 9.9 sec) → Score: 12</option>
                            <option value="14">10 seconds (10.0 - 29.9 sec) → Score: 14</option>
                            <option value="16">30 seconds (30.0 - 59.9 sec) → Score: 16</option>
                            <option value="18">1 minute (60 sec or more) → Score: 18</option>
                          </select>
                          <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20 flex justify-between items-center">
                            <span className="text-sm font-medium">Duration Score</span>
                            <span className="text-xl font-bold text-primary">
                              {parseInt(slpAssessment.duration_avg) || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* PHYSICAL CONCOMITANTS SECTION */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-lg flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">3</span>
                          Physical Concomitants
                        </h4>

                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm">
                          <p className="font-medium text-amber-600 dark:text-amber-400">Evaluating Scale:</p>
                          <p className="text-muted-foreground">
                            0 = none | 1 = not noticeable unless looking | 2 = barely noticeable | 3 = distracting | 4 = very distracting | 5 = severe
                          </p>
                        </div>

                        <div className="space-y-4">
                          {/* Distracting Sounds */}
                          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <label className="text-sm font-medium block">Distracting Sounds</label>
                                <p className="text-xs text-muted-foreground">
                                  Noisy breathing, whistling, sniffing, blowing, clicking sounds
                                </p>
                              </div>
                              <span className="text-lg font-bold text-primary">{slpAssessment.distracting_sounds}</span>
                            </div>
                            <div className="flex gap-2">
                              {[0, 1, 2, 3, 4, 5].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setSlpAssessment(prev => ({ ...prev, distracting_sounds: val }))}
                                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${slpAssessment.distracting_sounds === val
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted/50 hover:bg-muted"
                                    }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Facial Grimaces */}
                          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <label className="text-sm font-medium block">Facial Grimaces</label>
                                <p className="text-xs text-muted-foreground">
                                  Jaw jerking, tongue protruding, lip pressing, jaw muscles tense
                                </p>
                              </div>
                              <span className="text-lg font-bold text-primary">{slpAssessment.facial_grimaces}</span>
                            </div>
                            <div className="flex gap-2">
                              {[0, 1, 2, 3, 4, 5].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setSlpAssessment(prev => ({ ...prev, facial_grimaces: val }))}
                                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${slpAssessment.facial_grimaces === val
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted/50 hover:bg-muted"
                                    }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Head Movements */}
                          <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <label className="text-sm font-medium block">Head Movements</label>
                                <p className="text-xs text-muted-foreground">
                                  Back, forward, turning away, poor eye contact, constant looking around
                                </p>
                              </div>
                              <span className="text-lg font-bold text-primary">{slpAssessment.head_movements}</span>
                            </div>
                            <div className="flex gap-2">
                              {[0, 1, 2, 3, 4, 5].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setSlpAssessment(prev => ({ ...prev, head_movements: val }))}
                                  className={`flex-1 py-2 rounded-lg font-medium transition-all ${slpAssessment.head_movements === val
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted/50 hover:bg-muted"
                                    }`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Physical Concomitants Score */}
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex justify-between items-center">
                          <span className="text-sm font-medium">Physical Concomitants Score (max 15)</span>
                          <span className="text-xl font-bold text-primary">
                            {slpAssessment.distracting_sounds + slpAssessment.facial_grimaces + slpAssessment.head_movements}
                          </span>
                        </div>
                      </div>

                      {/* TOTAL SCORE & SEVERITY */}
                      <div className="p-6 rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Frequency</p>
                            <p className="text-2xl font-bold">
                              {(() => {
                                const reading = parseFloat(slpAssessment.reading_percent_ss) || 0;
                                const speaking = parseFloat(slpAssessment.speaking_percent_ss) || 0;
                                let readingScore = 0;
                                if (reading >= 21) readingScore = 9;
                                else if (reading >= 13) readingScore = 8;
                                else if (reading >= 8) readingScore = 7;
                                else if (reading >= 5) readingScore = 6;
                                else if (reading >= 3) readingScore = 5;
                                else if (reading >= 2) readingScore = 4;
                                else if (reading >= 1) readingScore = 2;
                                let speakingScore = 0;
                                if (speaking >= 22) speakingScore = 9;
                                else if (speaking >= 12) speakingScore = 8;
                                else if (speaking >= 8) speakingScore = 7;
                                else if (speaking >= 6) speakingScore = 6;
                                else if (speaking >= 4) speakingScore = 5;
                                else if (speaking >= 3) speakingScore = 4;
                                else if (speaking >= 2) speakingScore = 3;
                                else if (speaking >= 1) speakingScore = 2;
                                return readingScore + speakingScore;
                              })()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-2xl font-bold">{parseInt(slpAssessment.duration_avg) || 0}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">Physical</p>
                            <p className="text-2xl font-bold">
                              {slpAssessment.distracting_sounds + slpAssessment.facial_grimaces + slpAssessment.head_movements}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-primary/20 pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-medium">Total SSI-4 Score</span>
                            <span className="text-3xl font-bold text-primary">
                              {(() => {
                                const reading = parseFloat(slpAssessment.reading_percent_ss) || 0;
                                const speaking = parseFloat(slpAssessment.speaking_percent_ss) || 0;
                                let readingScore = 0;
                                if (reading >= 21) readingScore = 9;
                                else if (reading >= 13) readingScore = 8;
                                else if (reading >= 8) readingScore = 7;
                                else if (reading >= 5) readingScore = 6;
                                else if (reading >= 3) readingScore = 5;
                                else if (reading >= 2) readingScore = 4;
                                else if (reading >= 1) readingScore = 2;
                                let speakingScore = 0;
                                if (speaking >= 22) speakingScore = 9;
                                else if (speaking >= 12) speakingScore = 8;
                                else if (speaking >= 8) speakingScore = 7;
                                else if (speaking >= 6) speakingScore = 6;
                                else if (speaking >= 4) speakingScore = 5;
                                else if (speaking >= 3) speakingScore = 4;
                                else if (speaking >= 2) speakingScore = 3;
                                else if (speaking >= 1) speakingScore = 2;
                                const durationScore = parseInt(slpAssessment.duration_avg) || 0;
                                const physicalScore = slpAssessment.distracting_sounds + slpAssessment.facial_grimaces + slpAssessment.head_movements;
                                return readingScore + speakingScore + durationScore + physicalScore;
                              })()}
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-background/50">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Severity Equivalent</span>
                              <span className="text-lg font-bold">
                                {(() => {
                                  const reading = parseFloat(slpAssessment.reading_percent_ss) || 0;
                                  const speaking = parseFloat(slpAssessment.speaking_percent_ss) || 0;
                                  let readingScore = 0;
                                  if (reading >= 21) readingScore = 9;
                                  else if (reading >= 13) readingScore = 8;
                                  else if (reading >= 8) readingScore = 7;
                                  else if (reading >= 5) readingScore = 6;
                                  else if (reading >= 3) readingScore = 5;
                                  else if (reading >= 2) readingScore = 4;
                                  else if (reading >= 1) readingScore = 2;
                                  let speakingScore = 0;
                                  if (speaking >= 22) speakingScore = 9;
                                  else if (speaking >= 12) speakingScore = 8;
                                  else if (speaking >= 8) speakingScore = 7;
                                  else if (speaking >= 6) speakingScore = 6;
                                  else if (speaking >= 4) speakingScore = 5;
                                  else if (speaking >= 3) speakingScore = 4;
                                  else if (speaking >= 2) speakingScore = 3;
                                  else if (speaking >= 1) speakingScore = 2;
                                  const durationScore = parseInt(slpAssessment.duration_avg) || 0;
                                  const physicalScore = slpAssessment.distracting_sounds + slpAssessment.facial_grimaces + slpAssessment.head_movements;
                                  const total = readingScore + speakingScore + durationScore + physicalScore;

                                  // No Stutter when score is 0
                                  if (total === 0) return "No Stutter";

                                  // Severity based on age group (Table 2.3 for School-Age)
                                  if (slpAssessment.age_group === "school_age") {
                                    if (total >= 36) return "Very Severe";
                                    if (total >= 28) return "Severe";
                                    if (total >= 21) return "Moderate";
                                    if (total >= 11) return "Mild";
                                    return "Very Mild";
                                  } else if (slpAssessment.age_group === "preschool") {
                                    if (total >= 32) return "Very Severe";
                                    if (total >= 27) return "Severe";
                                    if (total >= 17) return "Moderate";
                                    if (total >= 11) return "Mild";
                                    return "Very Mild";
                                  } else { // adult
                                    if (total >= 37) return "Very Severe";
                                    if (total >= 32) return "Severe";
                                    if (total >= 25) return "Moderate";
                                    if (total >= 18) return "Mild";
                                    return "Very Mild";
                                  }
                                })()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Based on {slpAssessment.age_group === "school_age" ? "Table 2.3 - School-Age Children" :
                                slpAssessment.age_group === "preschool" ? "Table 2.2 - Preschool Children" :
                                  "Table 2.4 - Adults"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Clinical Notes & Save */}
                  <Card className="glass border-white/10 dark:border-white/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-primary" />
                        Clinical Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Clinical Notes</label>
                        <textarea
                          value={slpAssessment.clinical_notes}
                          onChange={(e) => setSlpAssessment(prev => ({ ...prev, clinical_notes: e.target.value }))}
                          placeholder="Add your clinical observations, recommendations, and notes..."
                          className="w-full p-3 rounded-lg bg-background border border-border/50 text-sm resize-none"
                          rows={5}
                        />
                      </div>

                      {/* Save Button */}
                      <Button
                        className="w-full btn-premium text-white text-lg py-6"
                        disabled={isSavingAssessment}
                        onClick={async () => {
                          setIsSavingAssessment(true);
                          try {
                            // Calculate scores for saving
                            const reading = parseFloat(slpAssessment.reading_percent_ss) || 0;
                            const speaking = parseFloat(slpAssessment.speaking_percent_ss) || 0;

                            let readingScore = 0;
                            if (reading >= 21) readingScore = 9;
                            else if (reading >= 13) readingScore = 8;
                            else if (reading >= 8) readingScore = 7;
                            else if (reading >= 5) readingScore = 6;
                            else if (reading >= 3) readingScore = 5;
                            else if (reading >= 2) readingScore = 4;
                            else if (reading >= 1) readingScore = 2;

                            let speakingScore = 0;
                            if (speaking >= 22) speakingScore = 9;
                            else if (speaking >= 12) speakingScore = 8;
                            else if (speaking >= 8) speakingScore = 7;
                            else if (speaking >= 6) speakingScore = 6;
                            else if (speaking >= 4) speakingScore = 5;
                            else if (speaking >= 3) speakingScore = 4;
                            else if (speaking >= 2) speakingScore = 3;
                            else if (speaking >= 1) speakingScore = 2;

                            const frequencyScore = readingScore + speakingScore;
                            const durationScore = parseInt(slpAssessment.duration_avg) || 0;
                            const physicalScore = slpAssessment.distracting_sounds + slpAssessment.facial_grimaces + slpAssessment.head_movements;
                            const totalScore = frequencyScore + durationScore + physicalScore;

                            // Calculate severity
                            let severity = "Very Mild";
                            if (totalScore === 0) {
                              severity = "No Stutter";
                            } else if (slpAssessment.age_group === "school_age") {
                              if (totalScore >= 36) severity = "Very Severe";
                              else if (totalScore >= 28) severity = "Severe";
                              else if (totalScore >= 21) severity = "Moderate";
                              else if (totalScore >= 11) severity = "Mild";
                            } else if (slpAssessment.age_group === "preschool") {
                              if (totalScore >= 32) severity = "Very Severe";
                              else if (totalScore >= 27) severity = "Severe";
                              else if (totalScore >= 17) severity = "Moderate";
                              else if (totalScore >= 11) severity = "Mild";
                            } else {
                              if (totalScore >= 37) severity = "Very Severe";
                              else if (totalScore >= 32) severity = "Severe";
                              else if (totalScore >= 25) severity = "Moderate";
                              else if (totalScore >= 18) severity = "Mild";
                            }

                            const assessmentData = {
                              // Raw inputs
                              reading_percent_ss: slpAssessment.reading_percent_ss,
                              speaking_percent_ss: slpAssessment.speaking_percent_ss,
                              duration_avg: slpAssessment.duration_avg,
                              age_group: slpAssessment.age_group,

                              // Calculated SSI-4 scores
                              ssi4_frequency: frequencyScore,
                              ssi4_duration: durationScore,
                              ssi4_physical: physicalScore,

                              // Physical concomitants breakdown
                              distracting_sounds: slpAssessment.distracting_sounds,
                              facial_grimaces: slpAssessment.facial_grimaces,
                              head_movements: slpAssessment.head_movements,

                              // Results
                              total_score: totalScore,
                              severity_rating: severity,

                              // Other fields
                              clinical_notes: slpAssessment.clinical_notes,
                              model_is_accurate: slpAssessment.model_is_accurate,
                              model_feedback: slpAssessment.model_feedback,
                              slp_id: currentUser?.id
                            };

                            const response = await fetch(`${API_BASE_URL}/api/save_slp_assessment/${taskId}`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(assessmentData)
                            });
                            if (response.ok) {
                              const savedData = await response.json();
                              setExistingAssessment(savedData.assessment || assessmentData);
                              alert("Assessment saved successfully!");
                            } else {
                              alert("Failed to save assessment. Please try again.");
                            }
                          } catch (err) {
                            console.error("Error saving assessment:", err);
                            alert("Failed to save assessment. Please try again.");
                          } finally {
                            setIsSavingAssessment(false);
                          }
                        }}
                      >
                        {isSavingAssessment ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Saving Assessment...
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Save SSI-4 Assessment
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <Button
                onClick={() => navigate("/analyze")}
                className="btn-premium text-white rounded-xl px-8"
              >
                <FileAudio className="w-5 h-5 mr-2" />
                New Analysis
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
