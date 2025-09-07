import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface AccordionProps {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  className?: string
  children: React.ReactNode
  defaultValue?: string | string[]
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ type = "single", value, onValueChange, className, children, defaultValue }, ref) => {
    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      defaultValue || (type === "single" ? "" : [])
    )

    const controlledValue = value !== undefined ? value : internalValue
    const controlledOnValueChange = onValueChange || setInternalValue

    return (
      <div ref={ref} className={cn("space-y-1", className)}>
        {children}
      </div>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps {
  value: string
  className?: string
  children: React.ReactNode
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-b", className)}
      {...props}
    >
      {children}
    </div>
  )
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const handleClick = () => {
      setIsOpen(!isOpen)
      onClick?.()
    }

    return (
      <div className="flex">
        <button
          ref={ref}
          className={cn(
            "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
            className
          )}
          onClick={handleClick}
          data-state={isOpen ? "open" : "closed"}
          {...props}
        >
          {children}
          <ChevronDown className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
      </div>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps {
  className?: string
  children: React.ReactNode
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden text-sm transition-all",
          isOpen ? "animate-accordion-down" : "animate-accordion-up"
        )}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        <div className={cn("pb-4 pt-0", className)}>
          {isOpen && children}
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } 