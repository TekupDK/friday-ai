/**
 * AI Generation Progress Indicator
 *
 * Shows step-by-step progress during AI doc generation:
 * 1. Collecting data
 * 2. Analyzing with AI
 * 3. Generating document
 * 4. Saving to database
 */

import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface AIGenerationProgressProps {
  isGenerating: boolean;
  onComplete?: () => void;
}

type GenerationStep =
  | "idle"
  | "collecting"
  | "analyzing"
  | "generating"
  | "saving"
  | "complete";

const STEPS = [
  { key: "collecting", label: "Indsamler data", duration: 3000 },
  { key: "analyzing", label: "Analyserer med AI", duration: 15000 },
  { key: "generating", label: "Genererer dokument", duration: 5000 },
  { key: "saving", label: "Gemmer", duration: 2000 },
] as const;

export function AIGenerationProgress({
  isGenerating,
  onComplete,
}: AIGenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState<GenerationStep>("idle");
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep("idle");
      setProgress(0);
      setElapsedTime(0);
      return;
    }

    // Start generation
    setCurrentStep("collecting");
    setProgress(0);
    setElapsedTime(0);

    const startTime = Date.now();

    // Timer for elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 100);

    // Simulate progress through steps
    const steps: GenerationStep[] = [
      "collecting",
      "analyzing",
      "generating",
      "saving",
    ];
    let currentStepIndex = 0;

    const stepInterval = setInterval(() => {
      currentStepIndex++;

      if (currentStepIndex < steps.length) {
        setCurrentStep(steps[currentStepIndex]);
        setProgress((currentStepIndex / steps.length) * 100);
      } else {
        setCurrentStep("complete");
        setProgress(100);
        clearInterval(stepInterval);
        clearInterval(timeInterval);

        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    }, 5000); // Change step every 5 seconds

    return () => {
      clearInterval(stepInterval);
      clearInterval(timeInterval);
    };
  }, [isGenerating, onComplete]);

  if (!isGenerating && currentStep === "idle") {
    return null;
  }

  const currentStepInfo = STEPS.find(s => s.key === currentStep);
  const stepIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          {currentStep === "complete" ? (
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )}
          <div>
            <h3 className="font-semibold text-lg">
              {currentStep === "complete"
                ? "Færdig!"
                : "Genererer AI Dokumentation"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentStepInfo?.label || "Arbejder..."}
            </p>
          </div>
        </div>

        <Progress value={progress} className="mb-4" />

        <div className="space-y-2 mb-4">
          {STEPS.map((step, index) => {
            const isComplete = stepIndex > index || currentStep === "complete";
            const isCurrent = step.key === currentStep;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-2 text-sm ${
                  isComplete
                    ? "text-green-600"
                    : isCurrent
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : isCurrent ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2" />
                )}
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>OpenRouter FREE</span>
          </div>
          <span>{(elapsedTime / 1000).toFixed(1)}s</span>
        </div>

        {currentStep === "complete" && (
          <p className="text-sm text-center text-green-600 mt-4">
            ✨ Dokumentation genereret!
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function AIGenerationProgressInline({
  isGenerating,
}: {
  isGenerating: boolean;
}) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Genererer AI dokumentation{dots}</span>
    </div>
  );
}
