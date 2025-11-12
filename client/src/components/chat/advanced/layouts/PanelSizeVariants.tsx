import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Maximize,
  Minimize,
  Square,
  Monitor,
  Smartphone,
  Tablet,
  MonitorSpeaker,
  Settings,
  RotateCcw,
} from "lucide-react";

export type PanelSize = "compact" | "normal" | "expanded" | "fullscreen";
export type DeviceType = "mobile" | "tablet" | "desktop" | "auto";

export interface PanelSizeVariantsProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: PanelSize;
  deviceType?: DeviceType;
  onSizeChange?: (size: PanelSize) => void;
  onDeviceChange?: (device: DeviceType) => void;
  showDeviceSelector?: boolean;
  showSizeControls?: boolean;
  showReset?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const sizeConfigs = {
  compact: {
    label: "Kompakt",
    icon: Smartphone,
    className: "w-full max-w-sm mx-auto",
    description: "Optimal for små skærme",
  },
  normal: {
    label: "Normal",
    icon: Tablet,
    className: "w-full max-w-2xl mx-auto",
    description: "Standard layout",
  },
  expanded: {
    label: "Udvidet",
    icon: Monitor,
    className: "w-full max-w-6xl mx-auto",
    description: "Mere plads til indhold",
  },
  fullscreen: {
    label: "Fuld skærm",
    icon: MonitorSpeaker,
    className: "w-full h-screen max-w-none mx-0",
    description: "Maksimal plads",
  },
};

const deviceConfigs = {
  mobile: {
    label: "Mobil",
    icon: Smartphone,
    width: "375px",
    height: "667px",
  },
  tablet: {
    label: "Tablet",
    icon: Tablet,
    width: "768px",
    height: "1024px",
  },
  desktop: {
    label: "Desktop",
    icon: Monitor,
    width: "100%",
    height: "auto",
  },
  auto: {
    label: "Auto",
    icon: Settings,
    width: "auto",
    height: "auto",
  },
};

export function PanelSizeVariants({
  size = "normal",
  deviceType = "auto",
  onSizeChange,
  onDeviceChange,
  showDeviceSelector = true,
  showSizeControls = true,
  showReset = true,
  className,
  children,
  ...props
}: PanelSizeVariantsProps) {
  const [currentSize, setCurrentSize] = React.useState<PanelSize>(size);
  const [currentDevice, setCurrentDevice] =
    React.useState<DeviceType>(deviceType);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    setCurrentSize(size);
  }, [size]);

  React.useEffect(() => {
    setCurrentDevice(deviceType);
  }, [deviceType]);

  const handleSizeChange = (newSize: PanelSize) => {
    setCurrentSize(newSize);
    onSizeChange?.(newSize);

    if (newSize === "fullscreen") {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  };

  const handleDeviceChange = (newDevice: DeviceType) => {
    setCurrentDevice(newDevice);
    onDeviceChange?.(newDevice);
  };

  const handleReset = () => {
    setCurrentSize("normal");
    setCurrentDevice("auto");
    setIsFullscreen(false);
    onSizeChange?.("normal");
    onDeviceChange?.("auto");
  };

  const getContainerClassName = () => {
    const sizeConfig = sizeConfigs[currentSize];
    let classes = sizeConfig.className;

    if (currentDevice !== "auto") {
      const deviceConfig = deviceConfigs[currentDevice];
      if (currentDevice === "mobile" || currentDevice === "tablet") {
        classes = `mx-auto border border-border rounded-lg shadow-lg overflow-hidden`;
      }
    }

    if (isFullscreen) {
      classes = "fixed inset-0 z-50 bg-background p-4 overflow-auto";
    }

    return classes;
  };

  const getDeviceStyle = () => {
    if (currentDevice === "auto") return {};

    const deviceConfig = deviceConfigs[currentDevice];
    return {
      width: deviceConfig.width,
      height: deviceConfig.height,
      maxWidth:
        currentDevice === "mobile"
          ? "375px"
          : currentDevice === "tablet"
            ? "768px"
            : "none",
    };
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center gap-4">
          {showSizeControls && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Størrelse:</span>
              <div className="flex gap-1">
                {(Object.keys(sizeConfigs) as PanelSize[]).map(sizeKey => {
                  const config = sizeConfigs[sizeKey];
                  const Icon = config.icon;
                  return (
                    <Button
                      key={sizeKey}
                      variant={currentSize === sizeKey ? "default" : "outline"}
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => handleSizeChange(sizeKey)}
                      title={config.description}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {showDeviceSelector && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Enhed:</span>
              <div className="flex gap-1">
                {(Object.keys(deviceConfigs) as DeviceType[]).map(deviceKey => {
                  const config = deviceConfigs[deviceKey];
                  const Icon = config.icon;
                  return (
                    <Button
                      key={deviceKey}
                      variant={
                        currentDevice === deviceKey ? "default" : "outline"
                      }
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => handleDeviceChange(deviceKey)}
                      title={config.label}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {sizeConfigs[currentSize].label}
            {currentDevice !== "auto" &&
              ` • ${deviceConfigs[currentDevice].label}`}
          </Badge>

          {showReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 px-3"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}

          {isFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsFullscreen(false);
                setCurrentSize("normal");
                onSizeChange?.("normal");
              }}
              className="h-8 px-3"
            >
              <Minimize className="w-3 h-3 mr-1" />
              Exit Fullscreen
            </Button>
          )}
        </div>
      </div>

      {/* Content Container */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          getContainerClassName()
        )}
        style={getDeviceStyle()}
      >
        {children || (
          <div className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">
                {sizeConfigs[currentSize].label} Layout
              </h3>
              <p className="text-sm text-muted-foreground">
                {sizeConfigs[currentSize].description}
                {currentDevice !== "auto" &&
                  ` • Simulerer ${deviceConfigs[currentDevice].label.toLowerCase()}`}
              </p>
            </div>

            <div className="grid gap-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <h4 className="font-medium mb-2">Eksempel indhold</h4>
                <p className="text-sm text-muted-foreground">
                  Dette er hvordan komponenterne ser ud i{" "}
                  {sizeConfigs[currentSize].label.toLowerCase()} størrelse. Du
                  kan justere layoutet ved hjælp af kontrollerne ovenfor.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-accent/50 border border-border rounded-lg">
                  <h5 className="font-medium mb-1">Kolonne 1</h5>
                  <p className="text-sm">Indhold i første kolonne</p>
                </div>
                <div className="p-4 bg-accent/50 border border-border rounded-lg">
                  <h5 className="font-medium mb-1">Kolonne 2</h5>
                  <p className="text-sm">Indhold i anden kolonne</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Higher-order component for easy integration
export function withPanelSizeVariants<P extends object>(
  Component: React.ComponentType<P>,
  defaultSize: PanelSize = "normal",
  defaultDevice: DeviceType = "auto"
) {
  return React.forwardRef<any, P & PanelSizeVariantsProps>((props, ref) => {
    const {
      size,
      deviceType,
      onSizeChange,
      onDeviceChange,
      showDeviceSelector,
      showSizeControls,
      showReset,
      className,
      ...componentProps
    } = props;

    return (
      <PanelSizeVariants
        size={size || defaultSize}
        deviceType={deviceType || defaultDevice}
        onSizeChange={onSizeChange}
        onDeviceChange={onDeviceChange}
        showDeviceSelector={showDeviceSelector}
        showSizeControls={showSizeControls}
        showReset={showReset}
        className={className}
      >
        <Component {...(componentProps as P)} ref={ref} />
      </PanelSizeVariants>
    );
  });
}
