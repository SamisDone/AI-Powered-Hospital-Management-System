import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "elevated";
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = "default",
  hover = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl transition-all duration-300",
        variant === "default" && "glass-card",
        variant === "subtle" && "glass-subtle rounded-2xl border border-border/30",
        variant === "elevated" && "glass-card shadow-lg",
        hover && "hover-lift cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface GlassCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardHeader({ children, className }: GlassCardHeaderProps) {
  return (
    <div className={cn("p-6 pb-0", className)}>
      {children}
    </div>
  );
}

interface GlassCardContentProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardContent({ children, className }: GlassCardContentProps) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}

interface GlassCardFooterProps {
  children: ReactNode;
  className?: string;
}

export function GlassCardFooter({ children, className }: GlassCardFooterProps) {
  return (
    <div className={cn("p-6 pt-0", className)}>
      {children}
    </div>
  );
}
