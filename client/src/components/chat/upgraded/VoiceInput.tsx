/**
 * VOICE INPUT - Full-featured
 * Voice recording med waveform visualization og transcription
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, MicOff, StopCircle, Send, Loader2 } from "lucide-react";

interface VoiceInputProps {
  onTranscript?: (text: string) => void;
  onAudioBlob?: (blob: Blob) => void;
  className?: string;
}

export function VoiceInput({
  onTranscript,
  onAudioBlob,
  className,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup audio analyzer for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start visualization
      visualizeAudio();

      mediaRecorder.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        onAudioBlob?.(audioBlob);

        // Simulate transcription (replace with real API)
        setIsProcessing(true);
        setTimeout(() => {
          const mockTranscript =
            "Dette er en test transkription af tale input.";
          onTranscript?.(mockTranscript);
          setIsProcessing(false);
        }, 1500);

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied:", error);
      alert("Kan ikke få adgang til mikrofon");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const animate = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255); // Normalize to 0-1

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isProcessing) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl border",
          "bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20",
          className
        )}
      >
        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
        <span className="text-sm font-medium">Transkriberer...</span>
      </div>
    );
  }

  if (!isRecording) {
    return (
      <Button
        onClick={startRecording}
        className={cn(
          "relative overflow-hidden",
          "bg-linear-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700",
          className
        )}
      >
        <Mic className="w-4 h-4 mr-2" />
        Start optagelse
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border-2 border-red-500",
        "bg-linear-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20",
        "animate-in fade-in zoom-in-95",
        className
      )}
    >
      {/* Pulsing Mic Icon */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
          <Mic className="w-6 h-6 text-white" />
        </div>
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
      </div>

      {/* Waveform Visualization */}
      <div className="flex-1 flex items-center gap-1">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-linear-to-t from-red-500 to-pink-600 rounded-full transition-all duration-100"
            style={{
              height: `${Math.max(4, audioLevel * 40 * (0.5 + Math.random() * 0.5))}px`,
              opacity: 0.5 + audioLevel * 0.5,
            }}
          />
        ))}
      </div>

      {/* Duration */}
      <div className="text-sm font-mono font-semibold text-red-700 dark:text-red-400 min-w-[48px]">
        {formatDuration(duration)}
      </div>

      {/* Stop Button */}
      <Button
        onClick={stopRecording}
        variant="outline"
        size="icon"
        className="border-red-500 hover:bg-red-100 dark:hover:bg-red-950/50"
      >
        <StopCircle className="w-5 h-5 text-red-600" />
      </Button>
    </div>
  );
}
