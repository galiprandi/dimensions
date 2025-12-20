import * as React from "react"
import { cn } from "@/lib/utils"

const NativeSelect = React.forwardRef<
  React.ElementRef<"select">,
  React.ComponentPropsWithoutRef<"select">
>(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        "h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
})
NativeSelect.displayName = "NativeSelect"

const NativeSelectOption = React.forwardRef<
  React.ElementRef<"option">,
  React.ComponentPropsWithoutRef<"option">
>(({ className, children, ...props }, ref) => {
  return (
    <option
      className={cn("", className)}
      ref={ref}
      {...props}
    >
      {children}
    </option>
  )
})
NativeSelectOption.displayName = "NativeSelectOption"

export { NativeSelect, NativeSelectOption }
