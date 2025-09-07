import * as React from "react"
import { cn } from "../../lib/utils"
import { useRef } from "react"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  side?: "top" | "right" | "bottom" | "left"
  delayDuration?: number
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, content, className, side = "top", delayDuration = 700 }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const handleMouseEnter = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => setIsVisible(true), delayDuration)
    }

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsVisible(false)
    }

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <div
        ref={ref}
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        {isVisible && (
          <div
            className={cn(
              "absolute z-50 px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md shadow-lg whitespace-nowrap",
              "animate-in fade-in-0 zoom-in-95 duration-200",
              side === "top" && "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
              side === "bottom" && "top-full left-1/2 transform -translate-x-1/2 mt-2",
              side === "left" && "right-full top-1/2 transform -translate-y-1/2 mr-2",
              side === "right" && "left-full top-1/2 transform -translate-y-1/2 ml-2",
              className
            )}
          >
            {content}
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-2 h-2 bg-gray-900 transform rotate-45",
                side === "top" && "top-full left-1/2 -translate-x-1/2 -mt-1",
                side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 -mb-1",
                side === "left" && "left-full top-1/2 -translate-y-1/2 -ml-1",
                side === "right" && "right-full top-1/2 -translate-y-1/2 -mr-1"
              )}
            />
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

// For backward compatibility with Radix UI API
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>
const TooltipTrigger = ({ children, asChild = false, ...props }: any) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props)
  }
  return <div {...props}>{children}</div>
}
const TooltipContent = ({ children, ...props }: any) => <div {...props}>{children}</div>

export {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
}