import * as React from "react"
import * as RadixGauge from "@radix-ui/react-gauge"
import { cn } from "@/lib/utils"

const GaugeRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixGauge.Root>
>(({ className, ...props }, ref) => (
  <RadixGauge.Root
    ref={ref}
    className={cn(
      "relative h-[120px] w-[120px] rounded-full border-2 border-muted",
      className
    )}
    {...props}
  />
))
GaugeRoot.displayName = RadixGauge.Root.displayName

const GaugeLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixGauge.Label>
>(({ className, ...props }, ref) => (
  <RadixGauge.Label
    ref={ref}
    className={cn("absolute inset-0 flex items-center justify-center", className)}
    {...props}
  />
))
GaugeLabel.displayName = RadixGauge.Label.displayName

const GaugeValue = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixGauge.Value>
>(({ className, ...props }, ref) => (
  <RadixGauge.Value
    ref={ref}
    className={cn("absolute inset-0 flex items-center justify-center", className)}
    {...props}
  />
))
GaugeValue.displayName = RadixGauge.Value.displayName

const GaugeIndicator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof RadixGauge.Indicator>
>(({ className, ...props }, ref) => (
  <RadixGauge.Indicator
    ref={ref}
    className={cn(
      "absolute inset-0 rounded-full bg-primary transition-transform duration-700 ease-out",
      className
    )}
    {...props}
  />
))
GaugeIndicator.displayName = RadixGauge.Indicator.displayName

export {
  GaugeRoot as Gauge,
  GaugeLabel,
  GaugeValue,
  GaugeIndicator,
}
