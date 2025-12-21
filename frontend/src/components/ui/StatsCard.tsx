import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  variant?: "default" | "primary" | "accent";
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = "default",
  className,
}: StatsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <GlassCard
      className={cn(
        "p-6",
        variant === "primary" && "border-primary/20 bg-primary/5",
        variant === "accent" && "border-accent/20 bg-accent/5",
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            {value}
          </motion.p>
          {typeof change !== "undefined" && (
            <div className="flex items-center gap-1.5">
              {isPositive && (
                <TrendingUp className="w-4 h-4 text-success" />
              )}
              {isNegative && (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              {!isPositive && !isNegative && (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-success",
                  isNegative && "text-destructive",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "p-3 rounded-xl",
            variant === "default" && "bg-primary/10",
            variant === "primary" && "bg-primary/20",
            variant === "accent" && "bg-accent/20"
          )}>
            {icon}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
