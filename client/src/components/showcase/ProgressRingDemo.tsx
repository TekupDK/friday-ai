import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

function ProgressRing({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = "text-primary",
  label 
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(color, "transition-all duration-1000 ease-out")}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(progress)}%</span>
        {label && (
          <span className="text-xs text-muted-foreground mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}

export function ProgressRingDemo() {
  const [progress1, setProgress1] = useState(0);
  const [progress2, setProgress2] = useState(0);
  const [progress3, setProgress3] = useState(0);
  const [progress4, setProgress4] = useState(0);

  useEffect(() => {
    // Animate all progress rings with different speeds
    const intervals = [
      setInterval(() => setProgress1(p => Math.min(p + 1, 75)), 20),
      setInterval(() => setProgress2(p => Math.min(p + 1, 60)), 25),
      setInterval(() => setProgress3(p => Math.min(p + 1, 90)), 15),
      setInterval(() => setProgress4(p => Math.min(p + 1, 45)), 30),
    ];

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center">
            <ProgressRing 
              progress={progress1} 
              color="text-blue-500"
              label="Emails"
            />
            <p className="text-sm font-medium mt-4">Email Completion</p>
            <p className="text-xs text-muted-foreground">75% afsluttet</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center">
            <ProgressRing 
              progress={progress2} 
              color="text-green-500"
              label="Tasks"
            />
            <p className="text-sm font-medium mt-4">Task Progress</p>
            <p className="text-xs text-muted-foreground">60% gennemført</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center">
            <ProgressRing 
              progress={progress3} 
              color="text-purple-500"
              label="Leads"
            />
            <p className="text-sm font-medium mt-4">Lead Conversion</p>
            <p className="text-xs text-muted-foreground">90% success rate</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6 flex flex-col items-center">
            <ProgressRing 
              progress={progress4} 
              color="text-orange-500"
              label="Docs"
            />
            <p className="text-sm font-medium mt-4">Documentation</p>
            <p className="text-xs text-muted-foreground">45% complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Different sizes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Different Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around flex-wrap gap-6">
            <ProgressRing progress={85} size={80} color="text-red-500" />
            <ProgressRing progress={65} size={100} color="text-yellow-500" />
            <ProgressRing progress={95} size={140} strokeWidth={12} color="text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
