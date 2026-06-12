"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Pause, Volume2, VolumeX, Maximize2, SkipBack, SkipForward, Activity, Eye, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { FaceMesh } from "@mediapipe/face_mesh"
import * as drawingUtils from "@mediapipe/drawing_utils"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, taskId, stutterEvents = [] }) => {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [videoAnalysisEnabled, setVideoAnalysisEnabled] = useState(false)
  const [isFaceMeshLoading, setIsFaceMeshLoading] = useState(false)
  const canvasRef = useRef(null)
  const faceMeshRef = useRef(null)
  const [activeStutter, setActiveStutter] = useState(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => setCurrentTime(video.currentTime)
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("ended", handleEnded)

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("ended", handleEnded)
    }
  }, [isOpen])

  useEffect(() => {
    // Reset when modal opens
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0
      setCurrentTime(0)
      setIsPlaying(false)
    }

    // Initialize MediaPipe FaceMesh
    if (isOpen && !faceMeshRef.current) {
      setIsFaceMeshLoading(true)
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        },
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      faceMesh.onResults((results) => {
        setIsFaceMeshLoading(false)
        if (!canvasRef.current || !videoRef.current) return
        const canvasCtx = canvasRef.current.getContext("2d")
        const { width, height } = canvasRef.current
        
        canvasCtx.save()
        canvasCtx.clearRect(0, 0, width, height)

        if (results.multiFaceLandmarks && videoAnalysisEnabled) {
          for (const landmarks of results.multiFaceLandmarks) {
            // Draw indicators
            drawingUtils.drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_TESSELATION, {
              color: "#C0C0C060",
              lineWidth: 1,
            })
            drawingUtils.drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_RIGHT_EYE, { color: "#ef4444", lineWidth: 2 })
            drawingUtils.drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_LEFT_EYE, { color: "#10b981", lineWidth: 2 })
            drawingUtils.drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_FACE_OVAL, { color: "#ffffff40", lineWidth: 1 })
            drawingUtils.drawConnectors(canvasCtx, landmarks, FaceMesh.FACEMESH_LIPS, { color: "#ffffff80", lineWidth: 2})

            // Add "STUTTER DETECTED" overlay if active
            if (activeStutter) {
              const x = landmarks[10].x * width
              const y = landmarks[10].y * height
              
              canvasCtx.strokeStyle = "#ef4444"
              canvasCtx.lineWidth = 4
              canvasCtx.setLineDash([5, 5])
              canvasCtx.strokeRect(x - 60, y - 60, 120, 120)
              canvasCtx.setLineDash([])
              
              canvasCtx.fillStyle = "#ef4444"
              canvasCtx.font = "bold 24px Inter, sans-serif"
              canvasCtx.textAlign = "center"
              canvasCtx.fillText(activeStutter.type.toUpperCase(), x, y - 75)
              
              // Pulsing eye highlights if both detected
              if (activeStutter.source === "both") {
                canvasCtx.globalAlpha = 0.4 + Math.sin(Date.now() / 80) * 0.3
                canvasCtx.fillStyle = "#ef4444"
                canvasCtx.beginPath()
                canvasCtx.arc(x, y, 100, 0, Math.PI * 2)
                canvasCtx.fill()
              }
            }
          }
        }
        canvasCtx.restore()
      })

      faceMesh.initialize().then(() => {
        setIsFaceMeshLoading(false)
      })

      faceMeshRef.current = faceMesh
    }
  }, [isOpen, videoAnalysisEnabled, activeStutter])

  // Processing loop for MediaPipe
  useEffect(() => {
    let requestRef
    const processFrame = async () => {
      if (videoRef.current && isPlaying && videoAnalysisEnabled && faceMeshRef.current) {
        await faceMeshRef.current.send({ image: videoRef.current })
      }
      requestRef = requestAnimationFrame(processFrame)
    }

    if (isPlaying && videoAnalysisEnabled) {
      requestRef = requestAnimationFrame(processFrame)
    }

    return () => cancelAnimationFrame(requestRef)
  }, [isPlaying, videoAnalysisEnabled])

  // Monitor current time for stutter events
  useEffect(() => {
    const currentEvent = stutterEvents.find(
      (e) => currentTime >= e.start && currentTime <= (e.end || e.start + 1)
    )
    setActiveStutter(currentEvent || null)
  }, [currentTime, stutterEvents])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * duration
  }

  const jumpToTime = (time) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (video.requestFullscreen) {
      video.requestFullscreen()
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm p-4 pt-20"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className="relative w-full max-w-4xl bg-card rounded-2xl overflow-hidden shadow-2xl my-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-lg">Recording Playback</h3>
              <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                <Switch
                  id="video-analysis"
                  checked={videoAnalysisEnabled}
                  onCheckedChange={setVideoAnalysisEnabled}
                />
                <Label htmlFor="video-analysis" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                  <Activity className={`h-3 w-3 ${videoAnalysisEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  Video Analysis Mode
                  {isFaceMeshLoading && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                </Label>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Container */}
          <div className="relative bg-black aspect-video">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                />
              </div>
            )}
            <video
              ref={videoRef}
              src={videoUrl ? `${API_BASE_URL}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}` : ""}
              className="w-full h-full object-contain"
              playsInline
              crossOrigin="anonymous"
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              width={1280}
              height={720}
            />

            {/* activeStutter HUD */}
            {activeStutter && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg border border-red-400/50 flex items-center gap-3 z-10"
              >
                <div className="animate-pulse bg-white p-1 rounded-full">
                  <Zap className="h-4 w-4 text-red-600 fill-red-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Anomaly Detected</div>
                  <div className="text-sm font-black italic">{activeStutter.type.toUpperCase()}</div>
                </div>
              </motion.div>
            )}

            {/* Click to play/pause overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer group"
              onClick={togglePlay}
            >
              {!isPlaying && !isLoading && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-6 rounded-full bg-primary/80 backdrop-blur-sm"
                >
                  <Play className="h-12 w-12 text-white fill-white" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Stutter Events Timeline Markers */}
          {stutterEvents.length > 0 && duration > 0 && (
            <div className="relative h-2 bg-muted mx-4 mt-2 rounded-full overflow-visible">
              {stutterEvents.map((event, idx) => {
                const eventTime = event.start || 0
                const position = (eventTime / duration) * 100
                return (
                  <div
                    key={idx}
                    className={`absolute -top-1 w-3 h-4 rounded cursor-pointer transition-colors ${
                      event.source === "both" 
                        ? "bg-red-500 hover:bg-red-400 z-10 scale-110 shadow-[0_0_8px_rgba(239,68,68,0.5)]" 
                        : event.source === "video" 
                          ? "bg-emerald-500 hover:bg-emerald-400" 
                          : "bg-blue-500 hover:bg-blue-400"
                    }`}
                    style={{ left: `${position}%` }}
                    onClick={() => jumpToTime(eventTime)}
                    title={`${event.type}: ${event.word || ''} at ${formatTime(eventTime)} (${event.source || 'audio'})`}
                  />
                )
              })}
            </div>
          )}

          {/* Controls */}
          <div className="p-4 space-y-3">
            {/* Progress Bar */}
            <div
              className="h-2 bg-muted rounded-full overflow-hidden cursor-pointer group"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-primary rounded-full transition-all group-hover:bg-primary/80"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpToTime(Math.max(0, currentTime - 10))}
                  className="rounded-full"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="rounded-full h-10 w-10 p-0 bg-primary text-white hover:bg-primary/80"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => jumpToTime(Math.min(duration, currentTime + 10))}
                  className="rounded-full"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="rounded-full"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  className="rounded-full"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stutter Events List */}
          {stutterEvents.length > 0 && (
            <div className="border-t border-border p-4 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-medium mb-2">Stutter Events</h4>
              <div className="space-y-2">
                {stutterEvents.slice(0, 5).map((event, idx) => (
                  <button
                    key={idx}
                    onClick={() => jumpToTime(event.start)}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        {formatTime(event.start)}
                      </span>
                      <div className="flex items-center gap-2">
                        {event.source === "both" && <Activity className="h-3 w-3 text-red-500" />}
                        {event.source === "video" && <Eye className="h-3 w-3 text-emerald-500" />}
                        <span className="text-sm font-medium">{event.type}</span>
                      </div>
                      {event.word && (
                        <span className="text-sm text-muted-foreground">
                          "{event.word}"
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${event.severity === "Severe"
                          ? "bg-red-500/10 text-red-500"
                          : event.severity === "Moderate"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-emerald-500/10 text-emerald-500"
                        }`}
                    >
                      {event.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VideoPlayerModal
