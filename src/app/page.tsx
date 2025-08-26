import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import ShaderBackground from "@/components/shader-background";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      {/* Hero Section */}
      <div className="relative">
        {/* Shaders */}
        <ShaderBackground className="opacity-90" speed={0.4} />

        <div className="relative z-10 container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-fuchsia-500 to-violet-600 bg-clip-text text-transparent mb-6 leading-tight drop-shadow-[0_4px_12px_rgba(147,51,234,0.35)]">
              LilyGem
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
              Your personal finance companion for tracking expenses and managing currency
              conversions
            </p>

            {/* CTA Section */}
            {session?.user ? (
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Welcome back, {session.user.name}! 👋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Ready to continue managing your finances?
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-fuchsia-600 hover:from-blue-600 hover:to-fuchsia-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Get Started Today
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Sign in to start tracking your expenses and managing currency conversions
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-fuchsia-600 hover:from-blue-600 hover:to-fuchsia-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <CardTitle className="text-xl">Expense Tracking</CardTitle>
              <CardDescription>Keep track of your daily expenses with ease</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <CardTitle className="text-xl">Currency Conversion</CardTitle>
              <CardDescription>
                Real-time exchange rates and currency conversion tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <CardTitle className="text-xl">Analytics</CardTitle>
              <CardDescription>Visual insights into your spending patterns</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
