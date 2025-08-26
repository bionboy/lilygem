import * as React from "react";
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
  gradientColors?: {
    from: string;
    via: string;
    to: string;
  };
  innerGradientColors?: {
    from: string;
    via: string;
    to: string;
  };
}

function LiquidGlassCard({
  children,
  className,
  gradientColors = {
    from: "from-white/10",
    via: "via-white/5",
    to: "to-transparent",
  },
  innerGradientColors = {
    from: "from-white/5",
    via: "via-transparent",
    to: "to-white/5",
  },
  ...props
}: LiquidGlassCardProps) {
  return (
    <div className={cn("relative group", className)} {...props}>
      {/* Glass card with liquid effect */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500",
          gradientColors.from,
          gradientColors.via,
          gradientColors.to
        )}
      ></div>
      <div className="relative bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br rounded-2xl",
            innerGradientColors.from,
            innerGradientColors.via,
            innerGradientColors.to
          )}
        ></div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

export { LiquidGlassCard };
