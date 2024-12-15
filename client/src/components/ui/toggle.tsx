import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { type VariantProps } from "class-variance-authority"
import styles from "./toggle.module.css"
import { cn } from "@/lib/utils"

const toggleVariants = {
  variants: {
    variant: {
      default: styles.default,
      outline: styles.outline,
    },
    size: {
      default: styles.default_size,
      sm: styles.sm,
      lg: styles.lg,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(
      styles.root,
      variant && toggleVariants.variants.variant[variant],
      size && toggleVariants.variants.size[size],
      className
    )}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
