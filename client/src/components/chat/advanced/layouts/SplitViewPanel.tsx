import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { GripVertical, PanelLeft, PanelRight } from "lucide-react"

const splitViewVariants = cva(
  "flex overflow-hidden h-full w-full bg-background",
  {
    variants: {
      orientation: {
        horizontal: "flex-col",
        vertical: "flex-row"
      },
      initialSizes: {
        default: "",
        sidebar: "",
        equal: ""
      }
    },
    defaultVariants: {
      orientation: "horizontal"
    }
  }
)

interface SplitViewPanelProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof splitViewVariants> {
  minSize?: number
  maxSize?: number
  defaultSize?: number
  onResize?: (sizes: { first: number; second: number }) => void
  firstChild: React.ReactNode
  secondChild: React.ReactNode
  separatorClassName?: string
  firstClassName?: string
  secondClassName?: string
  showToggle?: boolean
  onPanelToggle?: (isFirstVisible: boolean) => void
}

export function SplitViewPanel({
  className,
  orientation = "horizontal",
  minSize = 20,
  maxSize = 80,
  defaultSize = 50,
  firstChild,
  secondChild,
  separatorClassName,
  firstClassName,
  secondClassName,
  showToggle = true,
  onResize,
  onPanelToggle,
  ...props
}: SplitViewPanelProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const firstRef = React.useRef<HTMLDivElement>(null)
  const separatorRef = React.useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [firstSize, setFirstSize] = React.useState(defaultSize)
  const [isFirstVisible, setIsFirstVisible] = React.useState(true)

  const startDragging = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.cursor = orientation === 'horizontal' ? 'row-resize' : 'col-resize'
    document.body.style.userSelect = 'none'
  }, [orientation])

  const stopDragging = React.useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging])

  const onMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    let newSize: number

    if (orientation === 'horizontal') {
      const y = e.clientY - containerRect.top
      newSize = (y / containerRect.height) * 100
    } else {
      const x = e.clientX - containerRect.left
      newSize = (x / containerRect.width) * 100
    }

    // Apply min/max constraints
    newSize = Math.max(minSize, Math.min(maxSize, newSize))
    
    setFirstSize(newSize)
    onResize?.({ first: newSize, second: 100 - newSize })
  }, [isDragging, minSize, maxSize, orientation, onResize])

  React.useEffect(() => {
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', stopDragging)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', stopDragging)
    }
  }, [onMouseMove, stopDragging])

  const togglePanel = () => {
    const newState = !isFirstVisible
    setIsFirstVisible(newState)
    onPanelToggle?.(newState)
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        splitViewVariants({ orientation, className }),
        'relative'
      )}
      {...props}
    >
      <div
        ref={firstRef}
        className={cn(
          'overflow-hidden transition-all',
          orientation === 'horizontal' ? 'h-full' : 'h-full',
          !isFirstVisible ? 'w-0 min-w-0' : '',
          firstClassName
        )}
        style={{
          [orientation === 'horizontal' ? 'height' : 'width']: 
            isFirstVisible ? `${firstSize}%` : '0%',
          flexShrink: 0,
        }}
      >
        {firstChild}
      </div>

      {showToggle && (
        <button
          onClick={togglePanel}
          className={cn(
            'absolute z-10 flex items-center justify-center',
            'bg-background border border-border rounded-full',
            'w-6 h-6 -translate-x-1/2 -translate-y-1/2',
            'hover:bg-accent hover:text-accent-foreground',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
            orientation === 'horizontal' 
              ? 'left-1/2 top-auto bottom-0 -translate-y-1/2' 
              : 'top-1/2 left-0 -translate-x-1/2',
            isFirstVisible ? '' : 'translate-x-0',
            separatorClassName
          )}
          aria-label={isFirstVisible ? 'Skjul panel' : 'Vis panel'}
        >
          {orientation === 'horizontal' ? (
            isFirstVisible ? <PanelLeft className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />
          ) : (
            isFirstVisible ? <PanelLeft className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />
          )}
        </button>
      )}

      <div
        ref={separatorRef}
        className={cn(
          'flex items-center justify-center',
          'bg-transparent hover:bg-accent/50',
          'transition-colors',
          'relative',
          orientation === 'horizontal' 
            ? 'h-1 w-full cursor-row-resize' 
            : 'w-1 h-full cursor-col-resize',
          isFirstVisible ? 'opacity-100' : 'opacity-0 pointer-events-none',
          separatorClassName
        )}
        onMouseDown={startDragging}
      >
        <div className={cn(
          'bg-border rounded-full',
          orientation === 'horizontal' ? 'h-1 w-16' : 'w-1 h-16'
        )} />
      </div>

      <div
        className={cn(
          'flex-1 overflow-hidden',
          orientation === 'horizontal' ? 'h-full' : 'h-full',
          secondClassName
        )}
      >
        {secondChild}
      </div>
    </div>
  )
}
