import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import { auth } from "@/lib/auth";
import ShaderBackground from "@/components/shader-background";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Shaders */}
      <ShaderBackground className="opacity-90" speed={0.4} />
      {/* Hero Section */}
      <div className="relative">
        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent mb-6 leading-tight drop-shadow-[0_4px_12px_rgba(147,51,234,0.35)]">
              LilyGem
            </h1>

            <p className="text-xl md:text-2xl text-secondary-foreground mb-8 max-w-2xl mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
              Your personal finance companion for tracking expenses and managing currency
              conversions
            </p>

            {/* CTA Section */}
            {session?.user ? (
              <div className="space-y-6">
                <LiquidGlassCard className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 drop-shadow-sm">
                    Welcome back, {session.user.name}! 👋
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 drop-shadow-sm">
                    Ready to continue managing your finances?
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-fuchsia-600 hover:from-blue-600 hover:to-fuchsia-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </LiquidGlassCard>
              </div>
            ) : (
              <div className="space-y-6">
                <LiquidGlassCard className="p-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2 drop-shadow-sm">
                    Get Started Today
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 drop-shadow-sm">
                    Sign in to start tracking your expenses and managing currency conversions
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-fuchsia-600 hover:from-blue-600 hover:to-fuchsia-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                </LiquidGlassCard>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <LiquidGlassCard
            className="p-6"
            gradientColors={{
              from: "from-blue-500/10",
              via: "via-purple-500/5",
              to: "to-transparent",
            }}
            innerGradientColors={{
              from: "from-blue-500/5",
              via: "via-transparent",
              to: "to-purple-500/5",
            }}
          >
            <CardHeader className="p-0">
              <div className="w-12 h-12 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle className="text-xl drop-shadow-sm">Expense Tracking</CardTitle>
              <CardDescription className="drop-shadow-sm text-gray-700 dark:text-gray-300">
                Keep track of your daily expenses with ease
              </CardDescription>
            </CardHeader>
          </LiquidGlassCard>

          <LiquidGlassCard
            className="p-6"
            gradientColors={{
              from: "from-purple-500/10",
              via: "via-pink-500/5",
              to: "to-transparent",
            }}
            innerGradientColors={{
              from: "from-purple-500/5",
              via: "via-transparent",
              to: "to-pink-500/5",
            }}
          >
            <CardHeader className="p-0">
              <div className="w-12 h-12 bg-purple-100/50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30">
                <span className="text-2xl">🌍</span>
              </div>
              <CardTitle className="text-xl drop-shadow-sm">Currency Conversion</CardTitle>
              <CardDescription className="drop-shadow-sm">
                Real-time exchange rates and currency conversion tools
              </CardDescription>
            </CardHeader>
          </LiquidGlassCard>

          <LiquidGlassCard
            className="p-6"
            gradientColors={{
              from: "from-green-500/10",
              via: "via-emerald-500/5",
              to: "to-transparent",
            }}
            innerGradientColors={{
              from: "from-green-500/5",
              via: "via-transparent",
              to: "to-emerald-500/5",
            }}
          >
            <CardHeader className="p-0">
              <div className="w-12 h-12 bg-green-100/50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-green-200/30 dark:border-green-800/30">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-xl drop-shadow-sm">Analytics</CardTitle>
              <CardDescription className="drop-shadow-sm">
                Visual insights into your spending patterns
              </CardDescription>
            </CardHeader>
          </LiquidGlassCard>
        </div>
      </div>
    </div>
  );
}
