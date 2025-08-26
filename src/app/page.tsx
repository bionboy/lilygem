import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
import { auth } from "@/lib/auth";
import { CTACard } from "@/components/cta-card";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screenn relative overflow-hidden">
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
            <div className="space-y-6">
              {session?.user ? (
                <CTACard
                  title={`Welcome back, ${session.user.name}! 👋`}
                  description="Ready to continue managing your finances?"
                  buttonText="Go to Dashboard"
                  buttonHref="/dashboard"
                />
              ) : (
                <CTACard
                  title="Get Started Today"
                  description="Sign in to start tracking your expenses and managing currency conversions"
                  buttonText="Sign In"
                  buttonHref="/login"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <GlassCard className="p-6" hoverEffect={true}>
            <CardHeader className="p-0">
              <div className="w-12 h-12 bg-blue-100/50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle className="text-xl drop-shadow-sm">Expense Tracking</CardTitle>
              <CardDescription className="drop-shadow-sm">
                Keep track of your daily expenses with ease
              </CardDescription>
            </CardHeader>
          </GlassCard>

          <GlassCard className="p-6" hoverEffect={true}>
            <CardHeader className="p-0">
              <div className="w-12 h-12 bg-purple-100/50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30">
                <span className="text-2xl">🌍</span>
              </div>
              <CardTitle className="text-xl drop-shadow-sm">Currency Conversion</CardTitle>
              <CardDescription className="drop-shadow-sm">
                Real-time exchange rates and currency conversion tools
              </CardDescription>
            </CardHeader>
          </GlassCard>

          <GlassCard className="p-6" hoverEffect={true}>
            <CardHeader className="p-0">
              <div className="w-12 h-12 bg-green-100/50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-green-200/30 dark:border-green-800/30">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-xl drop-shadow-sm">Analytics</CardTitle>
              <CardDescription className="drop-shadow-sm">
                Visual insights into your spending patterns
              </CardDescription>
            </CardHeader>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
