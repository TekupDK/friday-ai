import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolExecutionBox } from "@/components/chat/ToolExecutionBox";

export function ToolExecutionPlayground() {
  const [progress, setProgress] = useState(40);
  const [status, setStatus] = useState<"running" | "completed" | "failed">(
    "running"
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-2">Progress</div>
            <Slider
              value={[progress]}
              max={100}
              step={1}
              onValueChange={([v]) => setProgress(v)}
            />
            <div className="text-xs mt-1">{progress}%</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Status</div>
            <Select onValueChange={v => setStatus(v as any)} value={status}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="running">running</SelectItem>
                <SelectItem value="completed">completed</SelectItem>
                <SelectItem value="failed">failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        <ToolExecutionBox
          emoji="🛠️"
          message="Henter data fra Billy API..."
          progress={progress}
          status={status}
        />
      </div>
    </div>
  );
}
