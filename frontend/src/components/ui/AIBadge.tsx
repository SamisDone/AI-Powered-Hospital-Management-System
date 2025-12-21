import { motion } from "framer-motion";
import { Sparkles, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBadgeProps {
  variant?: "default" | "pulse" | "glow";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function AIBadge({
  variant = "default",
  size = "md",
  className,
  children,
}: AIBadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "ai-badge",
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        size === "lg" && "text-sm px-3 py-1.5",
        variant === "pulse" && "animate-pulse",
        variant === "glow" && "glow-primary",
        className
      )}
    >
      <Sparkles className={cn(
        size === "sm" && "w-2.5 h-2.5",
        size === "md" && "w-3 h-3",
        size === "lg" && "w-3.5 h-3.5"
      )} />
      {children || "AI Powered"}
    </motion.span>
  );
}

interface MatchScoreProps {
  score: number;
  className?: string;
}

export function MatchScore({ score, className }: MatchScoreProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn("match-score", className)}
    >
      <Brain className="w-4 h-4" />
      <span>{score}% Match</span>
    </motion.div>
  );
}

interface AIStatusIndicatorProps {
  status: "processing" | "ready" | "analyzing";
  className?: string;
}

export function AIStatusIndicator({ status, className }: AIStatusIndicatorProps) {
  const statusConfig = {
    processing: { color: "bg-warning", text: "Processing" },
    ready: { color: "bg-success", text: "Ready" },
    analyzing: { color: "bg-primary", text: "Analyzing" },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className={cn("w-2 h-2 rounded-full animate-pulse", config.color)} />
      <span className="text-muted-foreground">{config.text}</span>
    </div>
  );
}
