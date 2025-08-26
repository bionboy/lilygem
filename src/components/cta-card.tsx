import { Button } from "@/components/ui/button";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import Link from "next/link";

interface CTACardProps {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
}

export function CTACard({ title, description, buttonText, buttonHref }: CTACardProps) {
  return (
    <LiquidGlassCard className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 drop-shadow-sm">
        {title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6 drop-shadow-sm">{description}</p>
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-blue-500 to-fuchsia-600 hover:from-blue-600 hover:to-fuchsia-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        <Link href={buttonHref}>{buttonText}</Link>
      </Button>
    </LiquidGlassCard>
  );
}
