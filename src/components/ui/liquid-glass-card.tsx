import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface LiquidGlassCardProps extends React.ComponentProps<typeof Card> {
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
    <div className="relative group">
      {/* Glass card with liquid effect */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500",
          gradientColors.from,
          gradientColors.via,
          gradientColors.to
        )}
      ></div>
      <Card
        className={cn(
          "relative bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br rounded-2xl",
            innerGradientColors.from,
            innerGradientColors.via,
            innerGradientColors.to
          )}
        ></div>
        <div className="relative z-10">{children}</div>
      </Card>
    </div>
  );
}

export { LiquidGlassCard };
