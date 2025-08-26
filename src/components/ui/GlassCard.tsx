import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface GlassCardProps extends React.ComponentProps<typeof Card> {
  hoverEffect?: boolean;
}

function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
  return (
    <div className="relative group">
      {/* Glass card with liquid effect */}
      <div
        className={cn(
          "absolute rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"
        )}
      ></div>
      <Card
        className={cn(
          "relative bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-xl",
          hoverEffect && "hover:shadow-2xl hover:-translate-y-1 transition-all duration-500",
          className
        )}
        {...props}
      >
        <div className={cn("absolute rounded-2xl")}></div>
        <div className="relative z-10">{children}</div>
      </Card>
    </div>
  );
}

export { GlassCard };
