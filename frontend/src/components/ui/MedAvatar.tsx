import { cn } from "@/lib/utils";

interface MedAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "busy" | "offline";
  className?: string;
}

export function MedAvatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  status,
  className,
}: MedAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
  };

  const statusClasses = {
    online: "status-online",
    busy: "status-busy",
    offline: "status-offline",
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={cn(
            "rounded-full object-cover ring-2 ring-background",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold ring-2 ring-background",
            sizeClasses[size]
          )}
        >
          {fallback?.slice(0, 2).toUpperCase() || "?"}
        </div>
      )}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 ring-2 ring-background",
            statusClasses[status],
            size === "sm" && "w-2 h-2",
            size === "md" && "w-2.5 h-2.5",
            size === "lg" && "w-3 h-3",
            size === "xl" && "w-4 h-4"
          )}
        />
      )}
    </div>
  );
}
