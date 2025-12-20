import * as React from "react"

import { cn } from "@/lib/utils"

type ProgressProps = React.ComponentPropsWithoutRef<"div"> & {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value = 0, ...props }, ref) => {
  const clamped = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0
  return (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(${clamped - 100}%)` }}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        role="progressbar"
      />
    </div>
  )
})

Progress.displayName = "Progress"

export { Progress }
