"use client"
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mic,
  Upload,
  Loader,
  Play,
  Pause,
  FileAudio,
  AlertCircle,
  Camera,
  CheckCircle,
  StopCircle,
  RotateCcw,
  Download,
  Sparkles,
  Shield,
  Brain,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Calendar,
  Users,
  Globe,
  GraduationCap,
  Heart,
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Save,
  Share2,
  Printer,
  Search,
  Filter,
  SortAsc,
  ChevronDown,
  Eye,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize2,
  MessageSquare,
  ClipboardList,
  ClipboardCheck,
  Target,
  Award,
  AlertTriangle,
  Info,
  X,
  Plus,
  Trash2,
  Edit3,
  FolderOpen,
  History,
  Zap,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReadableText from "@/components/ReadableText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import ConsentPage from "./ConsentPage";
import sentencesData from "../data/sentences.json";

// Floating Particles Background (matching Home page)
const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = [...Array(15)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 15,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {[...Array(totalSteps)].map((_, index) => (
      <motion.div
        key={index}
        className={`h-2 rounded-full transition-all duration-300 ${index < currentStep
          ? "bg-primary w-8"
          : index === currentStep
            ? "bg-primary/60 w-6"
            : "bg-muted w-4"
          }`}
        initial={{ scale: 0.8 }}
        animate={{ scale: index === currentStep ? 1.1 : 1 }}
      />
    ))}
  </div>
);

// Form Field Component with Icon
const FormField = ({ icon: Icon, label, required, children }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-sm font-medium">
      <Icon className="w-4 h-4 text-primary" />
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
  </div>
);

// Stutter type colors for consistent styling
const stutterTypeColors = {
  repetition: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30", fill: "#3b82f6" },
  prolongation: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30", fill: "#8b5cf6" },
  block: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", fill: "#ef4444" },
  interjection: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", fill: "#f59e0b" },
  revision: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30", fill: "#22c55e" },
};

// Metric Card Component
const MetricCard = ({ icon: Icon, label, value, subValue, trend, trendDirection, color = "primary" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass border-white/10 rounded-xl p-4 hover:border-white/20 transition-all"
  >
    <div className="flex items-start justify-between">
      <div className={`p-2 rounded-lg bg-${color}/20`}>
        <Icon className={`w-5 h-5 text-${color}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trendDirection === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
    <div className="mt-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
    </div>
  </motion.div>
);

// Waveform Visualization Component
const WaveformVisualization = ({ audioUrl, stutterMarkers = [], duration = 0, currentTime = 0, onSeek }) => {
  const canvasRef = useRef(null);
  const [waveformData, setWaveformData] = useState([]);

  useEffect(() => {
    // Generate mock waveform data (in real implementation, this would analyze audio)
    const dataPoints = 200;
    const newData = Array.from({ length: dataPoints }, () => Math.random() * 0.8 + 0.1);
    setWaveformData(newData);
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / waveformData.length;

    ctx.clearRect(0, 0, width, height);

    // Draw stutter markers first (as background)
    stutterMarkers.forEach(marker => {
      const startX = (marker.start / duration) * width;
      const endX = (marker.end / duration) * width;
      const color = stutterTypeColors[marker.type]?.fill || '#888';
      ctx.fillStyle = color + '40';
      ctx.fillRect(startX, 0, endX - startX, height);
    });

    // Draw waveform
    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const barHeight = value * height;
      const y = (height - barHeight) / 2;

      const progress = (index / waveformData.length) * duration;
      const isPlayed = progress <= currentTime;

      ctx.fillStyle = isPlayed ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))';
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw playhead
    const playheadX = (currentTime / duration) * width;
    ctx.fillStyle = '#fff';
    ctx.fillRect(playheadX - 1, 0, 2, height);
  }, [waveformData, currentTime, duration, stutterMarkers]);

  const handleClick = (e) => {
    if (!onSeek || duration === 0) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={100}
        className="w-full h-24 rounded-lg bg-black/20 cursor-pointer"
        onClick={handleClick}
      />
      {/* Stutter type legend */}
      <div className="flex flex-wrap gap-3 mt-3">
        {Object.entries(stutterTypeColors).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${colors.bg}`} />
            <span className="text-xs text-muted-foreground capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Transcript with Annotations Component
const AnnotatedTranscript = ({ transcript = "", annotations = [] }) => {
  const renderAnnotatedText = () => {
    if (!transcript) return <span className="text-muted-foreground italic">No transcript available</span>;

    // Sort annotations by start position
    const sortedAnnotations = [...annotations].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastEnd = 0;

    sortedAnnotations.forEach((annotation, index) => {
      // Add text before annotation
      if (annotation.start > lastEnd) {
        elements.push(
          <span key={`text-${index}`}>{transcript.slice(lastEnd, annotation.start)}</span>
        );
      }

      // Add annotated text
      const colors = stutterTypeColors[annotation.type] || { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" };
      elements.push(
        <span
          key={`annotation-${index}`}
          className={`${colors.bg} ${colors.text} ${colors.border} border rounded px-1 mx-0.5 cursor-pointer hover:opacity-80 transition-opacity`}
          title={`${annotation.type}: ${annotation.word}`}
        >
          {transcript.slice(annotation.start, annotation.end)}
        </span>
      );

      lastEnd = annotation.end;
    });

    // Add remaining text
    if (lastEnd < transcript.length) {
      elements.push(<span key="text-end">{transcript.slice(lastEnd)}</span>);
    }

    return elements;
  };

  return (
    <div className="p-4 glass rounded-xl border-white/10 max-h-60 overflow-y-auto">
      <p className="text-sm leading-relaxed">{renderAnnotatedText()}</p>
    </div>
  );
};

// Stutter Breakdown Chart Component
const StutterBreakdownChart = ({ data = {} }) => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0) || 1;

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([type, count]) => {
        const colors = stutterTypeColors[type] || { bg: "bg-gray-500/20", text: "text-gray-400" };
        const percentage = ((count / total) * 100).toFixed(1);

        return (
          <div key={type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={`capitalize ${colors.text}`}>{type}</span>
              <span className="text-muted-foreground">{count} ({percentage}%)</span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={`h-full rounded-full ${colors.bg.replace('/20', '')}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Clinical Notes Component
const ClinicalNotes = ({ notes, onSave }) => {
  const [localNotes, setLocalNotes] = useState(notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave?.(localNotes);
    setIsSaving(false);
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        placeholder="Add clinical observations, treatment notes, recommendations..."
        className="glass border-white/10 min-h-[120px] resize-none"
      />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" className="glass border-white/10">
          <History className="w-4 h-4 mr-2" />
          View History
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isSaving} className="btn-premium text-white">
          {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Notes
        </Button>
      </div>
    </div>
  );
};

// SSI-4 Assessment Component
const SSI4Assessment = ({ data }) => {
  const sections = [
    { label: "Frequency", score: data?.frequency || 0, max: 18 },
    { label: "Duration", score: data?.duration || 0, max: 18 },
    { label: "Physical Concomitants", score: data?.physical || 0, max: 20 },
  ];

  const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
  const maxScore = sections.reduce((sum, s) => sum + s.max, 0);

  const getSeverity = (score) => {
    if (score >= 46) return { label: "Very Severe", color: "text-red-500" };
    if (score >= 36) return { label: "Severe", color: "text-orange-500" };
    if (score >= 28) return { label: "Moderate", color: "text-yellow-500" };
    if (score >= 18) return { label: "Mild", color: "text-green-500" };
    return { label: "Very Mild", color: "text-blue-500" };
  };

  const severity = getSeverity(totalScore);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">SSI-4 Severity Rating</h4>
        <Badge className={`${severity.color} bg-opacity-20`}>{severity.label}</Badge>
      </div>

      {sections.map((section) => (
        <div key={section.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{section.label}</span>
            <span>{section.score}/{section.max}</span>
          </div>
          <Progress value={(section.score / section.max) * 100} className="h-2" />
        </div>
      ))}

      <Separator className="bg-white/10" />

      <div className="flex justify-between items-center">
        <span className="font-medium">Total Score</span>
        <span className="text-xl font-bold">{totalScore}/{maxScore}</span>
      </div>
    </div>
  );
};

// Session Comparison Component
const SessionComparison = ({ currentSession, previousSessions = [] }) => {
  if (previousSessions.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No previous sessions to compare</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="glass rounded-lg p-3 border-white/10">
          <p className="text-2xl font-bold text-green-400">
            {currentSession?.improvement || "+15"}%
          </p>
          <p className="text-xs text-muted-foreground">Fluency Improvement</p>
        </div>
        <div className="glass rounded-lg p-3 border-white/10">
          <p className="text-2xl font-bold text-blue-400">
            {previousSessions.length}
          </p>
          <p className="text-xs text-muted-foreground">Previous Sessions</p>
        </div>
        <div className="glass rounded-lg p-3 border-white/10">
          <p className="text-2xl font-bold text-purple-400">
            {currentSession?.streakDays || 7}
          </p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
      </div>

      <div className="space-y-2">
        {previousSessions.slice(0, 3).map((session, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-xs">
                #{previousSessions.length - index}
              </div>
              <div>
                <p className="text-sm font-medium">{session.date || "Jan 15, 2024"}</p>
                <p className="text-xs text-muted-foreground">{session.duration || "2:34"} duration</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{session.fluencyScore || 85}%</p>
              <p className="text-xs text-muted-foreground">fluency</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Patient Selector Component
const PatientSelector = ({ patients, selectedPatient, onSelect, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search patients..."
          className="glass border-white/10 pl-10"
        />
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {filteredPatients.map((patient) => (
          <motion.button
            key={patient._id || patient.id}
            onClick={() => onSelect(patient)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${selectedPatient?._id === patient._id
              ? "bg-primary/20 border border-primary/30"
              : "hover:bg-white/5 border border-transparent"
              }`}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium">
              {patient.name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{patient.name || "Unknown"}</p>
              <p className="text-xs text-muted-foreground truncate">{patient.email}</p>
            </div>
            {patient.pendingRecordings > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {patient.pendingRecordings} new
              </Badge>
            )}
          </motion.button>
        ))}

        {filteredPatients.length === 0 && (
          <p className="text-center py-4 text-muted-foreground text-sm">No patients found</p>
        )}
      </div>
    </div>
  );
};

// Main Export Component
export default function Analyze() {
  const { currentUser, isPatient, isSLP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [gradeLevel, setGradeLevel] = useState("Class_1_3");
  const [language, setLanguage] = useState("english");
  const [sentences, setSentences] = useState([]);

  const [taskId, setTaskId] = useState(null);
  const [isUserDetailsSubmitted, setIsUserDetailsSubmitted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [slps, setSlps] = useState([]);
  const [selectedSlp, setSelectedSlp] = useState("");
  const [mySlp, setMySlp] = useState(null);
  const [downloadFileName, setDownloadFileName] = useState("stutter_recording");
  const [recordCount, setRecordCount] = useState(1);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(location.state?.consentAccepted || false);

  // User details form
  const [userDetails, setUserDetails] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    age: "",
    gender: "",
    classGrade: "",
    motherTongue: "",
    motherTongueOther: "",
    dateOfBirth: "",
    dateOfRecording: new Date().toISOString().split('T')[0],
  });

  const [dayOfRecording, setDayOfRecording] = useState("");

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age.toString();
  };

  const getDayName = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  useEffect(() => {
    if (userDetails.dateOfBirth) {
      const calculatedAge = calculateAge(userDetails.dateOfBirth);
      setUserDetails(prev => ({ ...prev, age: calculatedAge }));
    }
  }, [userDetails.dateOfBirth]);

  useEffect(() => {
    if (userDetails.dateOfRecording) {
      setDayOfRecording(getDayName(userDetails.dateOfRecording));
    }
  }, [userDetails.dateOfRecording]);

  useEffect(() => {
    setDayOfRecording(getDayName(userDetails.dateOfRecording));
  }, []);

  // Refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Load sentences
  useEffect(() => {
    try {
      if (sentencesData && sentencesData[language] && sentencesData[language][gradeLevel]) {
        setSentences(sentencesData[language][gradeLevel]);
      } else {
        setSentences([]);
      }
    } catch (err) {
      console.error("Error loading sentences:", err);
      setSentences([]);
    }
  }, [language, gradeLevel]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Fetch SLPs
  useEffect(() => {
    if (isPatient && currentUser) {
      fetch("/api/slps")
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") setSlps(data.slps);
        });

      fetch(`/api/my_slp/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.slp) {
            setMySlp(data.slp);
            setSelectedSlp(data.slp._id);
          }
        });
    }
  }, [isPatient, currentUser]);



  // File upload handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && (selectedFile.type.startsWith("audio/") || selectedFile.type.startsWith("video/"))) {
      setFile(selectedFile);
      setError(null);
      setSuccess("File selected successfully!");
      if (selectedFile.type.startsWith("video/") && videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(selectedFile);
        videoRef.current.muted = false;
      }
    } else {
      setError("Please select a valid audio or video file.");
    }
  };

  const startRecording = () => {
    try {
      setError(null);
      chunksRef.current = [];
      if (!streamRef.current) {
        setError("Camera is not ready yet. Please wait a moment.");
        return;
      }
      if (streamRef.current.getAudioTracks().length === 0) {
        setError("Recording video without microphone audio.");
      }
      const audioTracks = streamRef.current.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) {
        setError("Microphone not detected. Please connect or enable your mic.");
        return;
      }
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        saveRecording(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Start recording error:", err);
      setError("Recording failed to start");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const saveRecording = (blob) => {
    try {
      const userName = currentUser?.name?.replace(/\s+/g, "_") || "user";
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
      const filename = `${userName}_rcd${recordCount}_${date}_${time}.webm`;
      const recordedFile = new File([blob], filename, { type: "video/webm" });
      setFile(recordedFile);
      setRecordCount((prev) => prev + 1);
      const url = URL.createObjectURL(recordedFile);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
      }
      setSuccess(`Recording saved as ${filename}`);
      setError(null);
    } catch (err) {
      console.error("Save recording error:", err);
      setError("Failed to save recording");
    }
  };

  const downloadRecording = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name || `stutter_recording_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetRecording = () => {
    setFile(null);
    setIsPlaying(false);
    setRecordingTime(0);
    setError(null);
    setSuccess(null);
    setConfirmed(false);
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.muted = true;
      videoRef.current.play();
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const setupMedia = async () => {
    try {
      setError(null);
      setIsCameraReady(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      let audioStream;
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr) {
        console.warn("Microphone not accessible:", micErr);
        setError("Microphone not accessible. Please check mic or close other apps.");
      }
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...(audioStream ? audioStream.getAudioTracks() : []),
      ]);
      streamRef.current = combinedStream;
      setIsCameraReady(true);
      if (videoRef.current) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Media setup failed:", err);
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied. Please allow camera access.");
      } else if (err.name === "NotFoundError") {
        setError("No camera device detected.");
      } else {
        setError("Unable to access camera.");
      }
      setIsCameraReady(false);
    }
  };

  const handleUserDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!userDetails.name || !userDetails.email || !userDetails.gender) {
      setError("Please fill in all required details");
      return;
    }
    if (!userDetails.classGrade) {
      setError("Please select your class/grade");
      return;
    }
    if (!userDetails.motherTongue) {
      setError("Please select your mother tongue");
      return;
    }
    if (userDetails.motherTongue === "other" && !userDetails.motherTongueOther) {
      setError("Please specify your mother tongue");
      return;
    }
    if (!userDetails.dateOfBirth) {
      setError("Please enter your date of birth");
      return;
    }
    if (!userDetails.dateOfRecording) {
      setError("Please select the date of recording");
      return;
    }
    setIsUserDetailsSubmitted(true);
    setError(null);
    await setupMedia();
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      setError("Please confirm the recording before sending to therapist.");
      return;
    }
    if (!file) {
      setError("Please select or record an audio/video file.");
      return;
    }
    try {
      setError(null);
      setIsAnalyzing(true);
      const newTaskId = `${currentUser?.id || "user"}_${Date.now()}`;
      setTaskId(newTaskId);
      if (selectedSlp && (!mySlp || selectedSlp !== mySlp._id)) {
        await fetch("/api/assign_slp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: currentUser.id, slp_id: selectedSlp })
        });
      }
      // Map frontend language to ISO code for the backend
      const languageIsoMap = { english: "en", hindi: "hi", marathi: "mr" };
      const languageIso = languageIsoMap[language] || "en";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("task_id", newTaskId);
      formData.append("user_id", currentUser?.id || "");
      formData.append("user_details", JSON.stringify(userDetails));
      formData.append("language", languageIso);
      const response = await fetch(`/api/upload_audio/${newTaskId}`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      setSuccess("File uploaded successfully! Analysis in progress...");
      setFile(null);
      setTimeout(() => {
        navigate("/results", { state: { taskId: newTaskId } });
      }, 2000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Patient view - Redesigned
  if (isPatient) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 gradient-hero" />
        <ParticleBackground />

        {/* Animated Background Blobs */}
        <motion.div
          className="fixed top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="fixed bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 p-4 md:p-8"
        >
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
              >
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-bold font-display mb-3">
                Speech <span className="gradient-text">Analysis</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Record or upload your speech for comprehensive AI-powered stuttering analysis
              </p>
            </motion.div>

            {/* Step Indicator */}
            <StepIndicator
              currentStep={isUserDetailsSubmitted ? 1 : 0}
              totalSteps={2}
            />

            {/* Consent Gate for Patients */}
            <AnimatePresence>
              {isPatient && !consentAccepted && (
                <ConsentPage
                  onAccept={() => setConsentAccepted(true)}
                  onCancel={() => navigate("/")}
                />
              )}
            </AnimatePresence>


            {/* User Details Section */}
            {!isUserDetailsSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <Card className="glass border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-xl">
                  <CardHeader className="text-center pb-2">
                    <div className="inline-flex mx-auto p-3 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-display">Your Details</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      Please fill in your information to begin the analysis
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUserDetailsSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <FormField icon={User} label="Name" required>
                          <Input
                            value={userDetails.name}
                            onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                            placeholder="Your full name"
                            className="glass border-white/10"
                          />
                        </FormField>

                        {/* Email */}
                        <FormField icon={Mail} label="Email" required>
                          <Input
                            type="email"
                            value={userDetails.email}
                            onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                            placeholder="your@email.com"
                            className="glass border-white/10"
                          />
                        </FormField>

                        {/* Date of Birth */}
                        <FormField icon={Calendar} label="Date of Birth" required>
                          <Input
                            type="date"
                            value={userDetails.dateOfBirth}
                            onChange={(e) => setUserDetails({ ...userDetails, dateOfBirth: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            className="glass border-white/10"
                          />
                        </FormField>

                        {/* Age (Auto-calculated) */}
                        <FormField icon={Calendar} label="Age (Auto-calculated)">
                          <Input
                            type="text"
                            value={userDetails.age ? `${userDetails.age} years` : ""}
                            readOnly
                            className="glass border-white/10 bg-muted/50 cursor-not-allowed"
                            placeholder="Select date of birth"
                          />
                        </FormField>

                        {/* Gender */}
                        <FormField icon={User} label="Gender" required>
                          <Select
                            value={userDetails.gender}
                            onValueChange={(value) => setUserDetails({ ...userDetails, gender: value })}
                          >
                            <SelectTrigger className="glass border-white/10">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>

                        {/* Class/Grade */}
                        <FormField icon={GraduationCap} label="Class / Grade">
                          <Select
                            value={userDetails.classGrade}
                            onValueChange={(value) => setUserDetails({ ...userDetails, classGrade: value })}
                          >
                            <SelectTrigger className="glass border-white/10">
                              <SelectValue placeholder="Select class/grade" />
                            </SelectTrigger>
                            <SelectContent>
                              {["None", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"].map((grade) => (
                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormField>

                        {/* Mother Tongue */}
                        <FormField icon={Globe} label="Mother Tongue" required>
                          <Select
                            value={userDetails.motherTongue}
                            onValueChange={(value) => setUserDetails({ ...userDetails, motherTongue: value, motherTongueOther: value !== "other" ? "" : userDetails.motherTongueOther })}
                          >
                            <SelectTrigger className="glass border-white/10">
                              <SelectValue placeholder="Select mother tongue" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="hindi">Hindi</SelectItem>
                              <SelectItem value="marathi">Marathi</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>

                        {/* Other Mother Tongue */}
                        {userDetails.motherTongue === "other" && (
                          <FormField icon={Globe} label="Specify Mother Tongue" required>
                            <Input
                              value={userDetails.motherTongueOther}
                              onChange={(e) => setUserDetails({ ...userDetails, motherTongueOther: e.target.value })}
                              placeholder="Enter your mother tongue"
                              className="glass border-white/10"
                            />
                          </FormField>
                        )}

                        {/* Date of Recording */}
                        <FormField icon={Calendar} label="Date of Recording" required>
                          <Input
                            type="date"
                            value={userDetails.dateOfRecording}
                            onChange={(e) => setUserDetails({ ...userDetails, dateOfRecording: e.target.value })}
                            className="glass border-white/10"
                          />
                        </FormField>

                        {/*  {/* Day of Recording 
                        <FormField icon={Calendar} label="Day of Recording">
                          <Input
                            type="text"
                            value={dayOfRecording}
                            readOnly
                            className="glass border-white/10 bg-muted/50 cursor-not-allowed font-medium"
                            placeholder="Select recording date"
                          />
                        </FormField>   */}

                        {/* SLP Selection */}
                        <div className="md:col-span-2">
                          <FormField icon={Heart} label="Choose your SLP (Therapist)">
                            <Select value={selectedSlp} onValueChange={setSelectedSlp}>
                              <SelectTrigger className="glass border-white/10">
                                <SelectValue placeholder="Select an SLP" />
                              </SelectTrigger>
                              <SelectContent>
                                {slps.map((slp) => (
                                  <SelectItem key={slp._id} value={slp._id}>
                                    {slp.name} ({slp.email})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormField>
                        </div>
                      </div>

                      {/* Error Display */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                        >
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-red-500 text-sm">{error}</p>
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        className="w-full btn-premium text-white text-lg py-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/25"
                      >
                        Continue to Recording
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-6"
                >
                  {/*<div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span>HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Brain className="h-5 w-5 text-green-500" />
                    <span>98.5% Accuracy</span>
                  </div>*/}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    <span>AI-Powered</span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Recording Section */}
            {isUserDetailsSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Alerts */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 max-w-4xl mx-auto"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-red-500 text-sm">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 max-w-4xl mx-auto"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-green-500 text-sm">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Video Recording Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="glass border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-xl h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                            <Camera className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="font-display">Video Recording</CardTitle>
                            <p className="text-sm text-muted-foreground">Record your speech sample</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Video Preview */}
                        <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/10">
                          <video
                            ref={videoRef}
                            className="w-full h-96 object-cover"
                            playsInline
                            muted
                            controls={!!file}
                            onEnded={() => setIsPlaying(false)}
                          />

                          {/* Camera not ready overlay */}
                          {!isCameraReady && !file && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                              <div className="text-center">
                                <Loader className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                                <p className="text-white text-sm">Initializing camera...</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Recording Timer */}
                        {isRecording && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center justify-center gap-2 p-4 bg-red-500/10 rounded-xl border border-red-500/20"
                          >
                            <motion.div
                              className="w-3 h-3 bg-red-500 rounded-full"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            />
                            <span className="font-semibold text-red-500 text-lg">
                              Recording: {formatTime(recordingTime)}
                            </span>
                          </motion.div>
                        )}

                        {/* Recording Controls */}
                        <div className="grid grid-cols-2 gap-3">
                          {!isRecording ? (
                            <Button
                              onClick={startRecording}
                              disabled={!isCameraReady || isRecording || !!file}
                              className="col-span-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-6 rounded-xl"
                            >
                              <Mic className="w-5 h-5 mr-2" />
                              Start Recording
                            </Button>
                          ) : (
                            <Button
                              onClick={stopRecording}
                              className="col-span-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 rounded-xl"
                            >
                              <StopCircle className="w-5 h-5 mr-2" />
                              Stop Recording
                            </Button>
                          )}

                          {file && (
                            <>
                              <Button onClick={togglePlayPause} variant="outline" className="glass border-white/10 py-5">
                                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                {isPlaying ? "Pause" : "Play"}
                              </Button>
                              <Button onClick={resetRecording} variant="outline" className="glass border-white/10 py-5">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                              </Button>
                              <Button onClick={downloadRecording} variant="outline" className="col-span-2 glass border-green-500/20 text-green-500 hover:bg-green-500/10 py-5">
                                <Download className="w-4 h-4 mr-2" />
                                Download Recording
                              </Button>
                            </>
                          )}
                        </div>

                        {/* File Upload Divider */}
                        <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-4 text-xs uppercase text-muted-foreground bg-card/80 backdrop-blur-sm">
                              Or upload a file
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept="audio/*,video/*"
                            onChange={handleFileChange}
                            disabled={isRecording || !!file}
                            className="glass border-white/10 cursor-pointer"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Settings & Sentences Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Language & Grade Settings */}
                    <Card className="glass border-white/10 dark:border-white/5 shadow-xl backdrop-blur-xl">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
                            <Globe className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="font-display">Settings</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField icon={Globe} label="Language">
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="glass border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="hindi">Hindi</SelectItem>
                              <SelectItem value="marathi">Marathi</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>
                        <FormField icon={GraduationCap} label="Grade Level">
                          <Select value={gradeLevel} onValueChange={setGradeLevel}>
                            <SelectTrigger className="glass border-white/10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Class_1_3">Class 1-3</SelectItem>
                              <SelectItem value="Class_4_6">Class 4-6</SelectItem>
                              <SelectItem value="Class_7_9">Class 7-9</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormField>
                      </CardContent>
                    </Card>

                    {/* Sentences Card */}
                    <Card className="glass border-white/10 dark:border-white/5 shadow-xl backdrop-blur-xl">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                            <FileAudio className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="font-display">Reading Passage</CardTitle>
                            <p className="text-sm text-muted-foreground">Read these sentences aloud</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ReadableText
                          gradeLevel={gradeLevel}
                          language={language}
                          sentences={sentences}
                        />
                      </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="space-y-3">
                      {file && !confirmed && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Button
                            onClick={() => setConfirmed(true)}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 rounded-xl text-lg font-semibold shadow-lg"
                          >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Confirm Recording
                          </Button>
                        </motion.div>
                      )}

                      <Button
                        onClick={handleSubmit}
                        disabled={!file || !confirmed || isAnalyzing}
                        className="w-full btn-premium text-white py-6 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/25"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5 mr-2" />
                            Start AI Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // SLP ANALYZE VIEW - TWO-PARTITION TABLE DESIGN
  // ==========================================

  // SLP-specific state (now backed by real API data)
  const [slpSearchTerm, setSlpSearchTerm] = useState("");
  const [slpSortBy, setSlpSortBy] = useState("date");
  const [slpSortOrder, setSlpSortOrder] = useState("desc");
  const [slpFilterSeverity, setSlpFilterSeverity] = useState("all");
  const [showReportModal, setShowReportModal] = useState(null);
  const [showSSI4Modal, setShowSSI4Modal] = useState(null);
  const [activeSlpTab, setActiveSlpTab] = useState("pending");
  const [slpTasks, setSlpTasks] = useState([]);
  const [assessedTaskIds, setAssessedTaskIds] = useState(new Set());
  const [slpDataLoading, setSlpDataLoading] = useState(true);

  // Fetch real SLP data from backend
  useEffect(() => {
    if (!isSLP || !currentUser) return;

    const fetchSlpData = async () => {
      setSlpDataLoading(true);
      try {
        const [tasksRes, assessedRes] = await Promise.all([
          fetch(`/api/tasks?slp_id=${currentUser.id}`),
          fetch(`/api/slp_assessed_tasks/${currentUser.id}`),
        ]);

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          if (tasksData.status === "success") {
            setSlpTasks(tasksData.tasks || []);
          }
        }

        if (assessedRes.ok) {
          const assessedData = await assessedRes.json();
          if (assessedData.status === "success") {
            setAssessedTaskIds(new Set(assessedData.assessed_task_ids || []));
          }
        }
      } catch (err) {
        console.error("Error fetching SLP data:", err);
      } finally {
        setSlpDataLoading(false);
      }
    };

    fetchSlpData();
  }, [isSLP, currentUser]);

  // Helper: format a task into the shape the table rows expect
  const formatTaskForTable = (task) => {
    const patient = task.patient || {};
    const results = task.results || {};
    return {
      id: task.task_id,
      patientName: patient.name || "Unknown",
      patientId: patient.email?.substring(0, 8) || task.user_id?.substring(0, 8) || "N/A",
      age: patient.age || null,
      gender: patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : "N/A",
      grade: patient.classGrade || "N/A",
      motherTongue: patient.motherTongue || "N/A",
      dob: patient.dateOfBirth || null,
      email: patient.email || "N/A",
      recordingDate: task.timestamp || new Date().toISOString(),
      language: task.language === "hi" ? "Hindi" : task.language === "mr" ? "Marathi" : "English",
      duration: results.duration ? `${Math.floor(results.duration / 60)}:${String(Math.floor(results.duration % 60)).padStart(2, "0")}` : "N/A",
      status: task.status || "pending",
      severity: results.severity || null,
      fluencyScore: results.fluency_score || null,
    };
  };

  // Derive pending and completed lists from real data
  const pendingAnalyses = slpTasks
    .filter(t => {
      if (t.status === "processing" || t.status === "pending") return true;
      if (t.status === "completed" && !assessedTaskIds.has(t.task_id)) return true;
      return false;
    })
    .map(formatTaskForTable);

  const completedAnalyses = slpTasks
    .filter(t => t.status === "completed" && assessedTaskIds.has(t.task_id))
    .map(formatTaskForTable);


  // Severity color helpers
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "very mild": return "text-blue-400 bg-blue-500/15 border-blue-500/30";
      case "mild": return "text-green-400 bg-green-500/15 border-green-500/30";
      case "moderate": return "text-amber-400 bg-amber-500/15 border-amber-500/30";
      case "severe": return "text-orange-400 bg-orange-500/15 border-orange-500/30";
      case "very severe": return "text-red-400 bg-red-500/15 border-red-500/30";
      default: return "text-muted-foreground bg-muted/15 border-muted/30";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };

  // Filter and sort helpers
  const filterAndSortData = (data) => {
    let filtered = data;

    // Search
    if (slpSearchTerm.trim()) {
      const term = slpSearchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.patientName.toLowerCase().includes(term) ||
        item.patientId.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term)
      );
    }

    // Severity filter (only for completed)
    if (slpFilterSeverity !== "all") {
      filtered = filtered.filter(item =>
        item.severity?.toLowerCase() === slpFilterSeverity.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      if (slpSortBy === "date") {
        cmp = new Date(b.recordingDate) - new Date(a.recordingDate);
      } else if (slpSortBy === "name") {
        cmp = a.patientName.localeCompare(b.patientName);
      } else if (slpSortBy === "score") {
        cmp = (b.fluencyScore || 0) - (a.fluencyScore || 0);
      } else if (slpSortBy === "severity") {
        const severityOrder = { "very mild": 1, "mild": 2, "moderate": 3, "severe": 4, "very severe": 5 };
        cmp = (severityOrder[a.severity?.toLowerCase()] || 0) - (severityOrder[b.severity?.toLowerCase()] || 0);
      }
      return slpSortOrder === "asc" ? cmp : -cmp;
    });

    return filtered;
  };

  if (isSLP) {
    const filteredPending = filterAndSortData(pendingAnalyses);
    const filteredCompleted = filterAndSortData(completedAnalyses);

    // Show loading state while data is being fetched
    if (slpDataLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Clean background */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 p-4 md:p-8"
        >
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary uppercase tracking-wider">SLP Workspace</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display">
                Patient <span className="gradient-text">Analyses</span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Review pending recordings and completed analysis reports
              </p>
            </motion.div>

            {/* Search Bar — Centered */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={slpSearchTerm}
                  onChange={(e) => setSlpSearchTerm(e.target.value)}
                  placeholder="Search patients by name, ID, or email..."
                  className="pl-12 pr-12 py-6 text-base rounded-2xl glass border-white/10 shadow-lg focus:border-primary/40 transition-all"
                />
                {slpSearchTerm && (
                  <button
                    onClick={() => setSlpSearchTerm("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Sort & Filter Controls */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center justify-between gap-3 mb-6"
            >
              <div className="flex items-center gap-3">
                {/* Sort By */}
                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4 text-muted-foreground" />
                  <Select value={slpSortBy} onValueChange={setSlpSortBy}>
                    <SelectTrigger className="w-36 h-9 text-xs glass border-white/10">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Patient Name</SelectItem>
                      <SelectItem value="score">Fluency Score</SelectItem>
                      <SelectItem value="severity">Severity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <Button
                  variant="outline"
                  size="sm"
                  className="glass border-white/10 h-9 px-3"
                  onClick={() => setSlpSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                >
                  {slpSortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                </Button>

                {/* Severity Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select value={slpFilterSeverity} onValueChange={setSlpFilterSeverity}>
                    <SelectTrigger className="w-36 h-9 text-xs glass border-white/10">
                      <SelectValue placeholder="All Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="very mild">Very Mild</SelectItem>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                      <SelectItem value="very severe">Very Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            </motion.div>

            {/* Tab Toggle */}
            <Tabs value={activeSlpTab} onValueChange={setActiveSlpTab} className="space-y-6">
              <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto bg-muted/30 rounded-xl p-1">
                <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-300 transition-all">
                  <Clock className="w-4 h-4 mr-2" />
                  Pending
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300 transition-all">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </TabsTrigger>
              </TabsList>

              {/* ========== PENDING ANALYSES TABLE ========== */}
              <TabsContent value="pending" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass border-white/10 shadow-xl backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/15">
                            <Clock className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-display">Pending Analysis</CardTitle>
                            <p className="text-sm text-muted-foreground">Recordings awaiting your review</p>
                          </div>
                        </div>

                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {filteredPending.length === 0 ? (
                        <div className="py-16 text-center">
                          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400/50" />
                          <p className="font-medium mb-1">All caught up!</p>
                          <p className="text-sm text-muted-foreground">No pending analyses to review</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              {/* Count banner row — spans the AI Report + SSI-4 columns */}
                              <tr className="border-b border-transparent">
                                <td colSpan={5} />
                                <td colSpan={2} className="px-6 pt-3 pb-1 text-center">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                                    <Clock className="w-3 h-3" />
                                    {filteredPending.length} recording{filteredPending.length !== 1 ? "s" : ""} pending
                                  </span>
                                </td>
                              </tr>
                              <tr className="border-b border-white/5">
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Recording Date</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Language</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Report</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">SSI-4</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredPending.map((item, index) => (
                                <motion.tr
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="hover:bg-white/[0.02] transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => navigate("/patient-info", {
                                        state: {
                                          patient: {
                                            name: item.patientName,
                                            age: item.age,
                                            gender: item.gender,
                                            dob: item.dob,
                                            grade: item.grade,
                                            email: item.email,
                                            motherTongue: item.motherTongue,
                                            patientId: item.patientId,
                                          }
                                        }
                                      })}
                                      className="flex items-center gap-3 group text-left"
                                    >
                                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                        {item.patientName.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                          {item.patientName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{item.patientId}</p>
                                      </div>
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {new Date(item.recordingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge variant="outline" className="text-xs border-white/10">{item.language}</Badge>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{item.duration}</td>
                                  <td className="px-6 py-4">
                                    <Badge className={item.status === "processing"
                                      ? "bg-blue-500/15 text-blue-400 border-blue-500/30 border"
                                      : "bg-amber-500/15 text-amber-400 border-amber-500/30 border"
                                    }>
                                      {item.status === "processing" ? (
                                        <><Loader className="w-3 h-3 mr-1 animate-spin" />Processing</>
                                      ) : (
                                        <><Clock className="w-3 h-3 mr-1" />Pending</>
                                      )}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="glass border-white/10 hover:border-primary/30 hover:text-primary transition-all text-xs"
                                      onClick={() => navigate("/results", { state: { taskId: item.id } })}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View Report
                                    </Button>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="glass border-white/10 hover:border-purple-400/30 hover:text-purple-400 transition-all text-xs"
                                      onClick={() => navigate("/results", { state: { taskId: item.id, activeTab: "slp-assessment" } })}
                                    >
                                      <Award className="w-3 h-3 mr-1" />
                                      SSI-4
                                    </Button>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* ========== COMPLETED ANALYSES TABLE ========== */}
              <TabsContent value="completed" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="glass border-white/10 shadow-xl backdrop-blur-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/15">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-display">Completed Analyses</CardTitle>
                            <p className="text-sm text-muted-foreground">Recordings you have reviewed</p>
                          </div>
                        </div>

                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {filteredCompleted.length === 0 ? (
                        <div className="py-16 text-center">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                          <p className="font-medium mb-1">No completed analyses found</p>
                          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              {/* Count banner row — spans the AI Report + SSI-4 columns */}
                              <tr className="border-b border-transparent">
                                <td colSpan={5} />
                                <td colSpan={2} className="px-6 pt-3 pb-1 text-center">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-300 text-xs font-semibold">
                                    <CheckCircle className="w-3 h-3" />
                                    {filteredCompleted.length} assessment{filteredCompleted.length !== 1 ? "s" : ""} completed
                                  </span>
                                </td>
                              </tr>
                              <tr className="border-b border-white/5">
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fluency</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Report</th>
                                <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">SSI-4</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredCompleted.map((item, index) => (
                                <motion.tr
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="hover:bg-white/[0.02] transition-colors"
                                >
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => navigate("/patient-info", {
                                        state: {
                                          patient: {
                                            name: item.patientName,
                                            age: item.age,
                                            gender: item.gender,
                                            dob: item.dob,
                                            grade: item.grade,
                                            email: item.email,
                                            motherTongue: item.motherTongue,
                                            patientId: item.patientId,
                                          }
                                        }
                                      })}
                                      className="flex items-center gap-3 group text-left"
                                    >
                                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                        {item.patientName.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                                          {item.patientName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{item.patientId}</p>
                                      </div>
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {new Date(item.recordingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`text-lg font-bold ${getScoreColor(item.fluencyScore)}`}>
                                      {item.fluencyScore}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">/ 100</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`${getSeverityColor(item.severity)} border text-xs`}>
                                      {item.severity}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{item.duration}</td>
                                  <td className="px-6 py-4 text-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="glass border-white/10 hover:border-primary/30 hover:text-primary transition-all text-xs"
                                      onClick={() => navigate("/results", { state: { taskId: item.id } })}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View Report
                                    </Button>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="glass border-white/10 hover:border-purple-400/30 hover:text-purple-400 transition-all text-xs"
                                      onClick={() => navigate("/results", { state: { taskId: item.id, activeTab: "slp-assessment" } })}
                                    >
                                      <Award className="w-3 h-3 mr-1" />
                                      SSI-4
                                    </Button>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* ========== AI REPORT MODAL ========== */}
        <AnimatePresence>
          {showReportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowReportModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-2xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader className="border-b border-white/5 sticky top-0 bg-card/95 backdrop-blur-xl z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Brain className="w-5 h-5 text-primary" />
                          AI Analysis Report
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {showReportModal.patientName} — {new Date(showReportModal.recordingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setShowReportModal(null)} className="hover:bg-white/10">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Score Summary */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <p className={`text-3xl font-bold ${getScoreColor(showReportModal.fluencyScore)}`}>{showReportModal.fluencyScore}</p>
                        <p className="text-xs text-muted-foreground mt-1">Fluency Score</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-muted/20 border border-white/5">
                        <p className="text-3xl font-bold">{showReportModal.report.totalWords}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Words</p>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-muted/20 border border-white/5">
                        <p className="text-3xl font-bold text-amber-400">{showReportModal.report.stutteredWords}</p>
                        <p className="text-xs text-muted-foreground mt-1">Stuttered Words</p>
                      </div>
                    </div>

                    {/* Disfluency Breakdown */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        Disfluency Breakdown
                      </h4>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(showReportModal.report.disfluencyTypes).map(([type, count]) => (
                          <div key={type} className="text-center p-3 rounded-lg bg-muted/10 border border-white/5">
                            <p className="text-lg font-bold">{count}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{type}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Transcription */}
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Transcription</h4>
                      <div className="p-4 rounded-xl bg-muted/10 border border-white/5">
                        <p className="text-sm leading-relaxed italic">"{showReportModal.report.transcription}"</p>
                      </div>
                    </div>

                    {/* Stuttering Events Table */}
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Stuttering Events</h4>
                      <div className="rounded-xl border border-white/5 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/10">
                              <th className="px-4 py-2 text-left text-xs text-muted-foreground">Time</th>
                              <th className="px-4 py-2 text-left text-xs text-muted-foreground">Type</th>
                              <th className="px-4 py-2 text-left text-xs text-muted-foreground">Word</th>
                              <th className="px-4 py-2 text-left text-xs text-muted-foreground">Severity</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {showReportModal.report.stutteringEvents.map((evt, i) => (
                              <tr key={i} className="hover:bg-white/[0.02]">
                                <td className="px-4 py-2 font-mono text-muted-foreground">{evt.time}</td>
                                <td className="px-4 py-2">{evt.type}</td>
                                <td className="px-4 py-2 font-medium">{evt.word}</td>
                                <td className="px-4 py-2">
                                  <Badge className={`${getSeverityColor(evt.severity)} border text-[10px]`}>{evt.severity}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Speech Rate */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-white/5">
                      <span className="text-sm text-muted-foreground">Speech Rate</span>
                      <span className="font-bold">{showReportModal.report.speechRate} <span className="text-xs text-muted-foreground font-normal">words/min</span></span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== SSI-4 MODAL ========== */}
        <AnimatePresence>
          {showSSI4Modal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowSSI4Modal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="glass border-white/10 shadow-2xl">
                  <CardHeader className="border-b border-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Award className="w-5 h-5 text-purple-400" />
                          SSI-4 Assessment
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {showSSI4Modal.patientName}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setShowSSI4Modal(null)} className="hover:bg-white/10">
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    {/* Severity Rating */}
                    <div className="text-center p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-primary/10 border border-purple-500/20">
                      <p className="text-4xl font-bold">{showSSI4Modal.ssi4.total}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Score (out of 56)</p>
                      <Badge className={`mt-3 ${getSeverityColor(showSSI4Modal.ssi4.severityRating)} border text-sm px-4 py-1`}>
                        {showSSI4Modal.ssi4.severityRating}
                      </Badge>
                    </div>

                    {/* Section Breakdown */}
                    <div className="space-y-4">
                      {[
                        { label: "Frequency", score: showSSI4Modal.ssi4.frequency, max: 18 },
                        { label: "Duration", score: showSSI4Modal.ssi4.duration, max: 18 },
                        { label: "Physical Concomitants", score: showSSI4Modal.ssi4.physical, max: 20 },
                      ].map((section) => (
                        <div key={section.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{section.label}</span>
                            <span className="font-medium">{section.score} / {section.max}</span>
                          </div>
                          <div className="h-2.5 bg-muted/30 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(section.score / section.max) * 100}%` }}
                              transition={{ duration: 0.6, delay: 0.2 }}
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-primary"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SSI-4 Scale */}
                    <Separator className="bg-white/10" />
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">SSI-4 Severity Scale</p>
                      <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                        {[
                          { label: "Very Mild", range: "0-17", active: showSSI4Modal.ssi4.total <= 17 },
                          { label: "Mild", range: "18-27", active: showSSI4Modal.ssi4.total >= 18 && showSSI4Modal.ssi4.total <= 27 },
                          { label: "Moderate", range: "28-35", active: showSSI4Modal.ssi4.total >= 28 && showSSI4Modal.ssi4.total <= 35 },
                          { label: "Severe", range: "36-45", active: showSSI4Modal.ssi4.total >= 36 && showSSI4Modal.ssi4.total <= 45 },
                          { label: "V. Severe", range: "46+", active: showSSI4Modal.ssi4.total >= 46 },
                        ].map((item) => (
                          <div key={item.label} className={`p-2 rounded-lg transition-all ${item.active ? "bg-primary/20 border border-primary/30 text-primary" : "bg-muted/10 text-muted-foreground"}`}>
                            <p className="font-medium">{item.label}</p>
                            <p className="opacity-60 mt-0.5">{item.range}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Not logged in
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      <div className="fixed inset-0 gradient-hero" />
      <ParticleBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10"
      >
        <Card className="glass border-white/10 shadow-2xl backdrop-blur-xl max-w-md">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-6">Please log in to access the analysis page</p>
            <Button onClick={() => navigate("/login")} className="btn-premium text-white px-8">
              Go to Login
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
