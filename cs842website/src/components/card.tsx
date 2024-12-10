import React from "react"
import { cn } from "../../utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-black text-card-foreground shadow-sm p-8",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export default Card