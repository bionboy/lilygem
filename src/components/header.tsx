import { auth, signOut } from "@/lib/auth";
import { Button } from "./ui/button";
import { User, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SignIn from "./sign-in";
import ThemePicker from "./theme-picker";

export default async function Header() {
  const session = await auth();

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <div className="relative group">
        {/* Glass card with liquid effect */}
        <div className="absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br rounded-2xl"></div>
          <div className="relative z-10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-semibold">
                <Link href="/">LilyGem</Link>
              </h1>
              {session?.user && (
                <nav className="ml-6">
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </nav>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <ThemePicker />
              {session?.user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-8 h-8 p-1 bg-muted rounded-full" />
                    )}
                    <span className="text-sm font-medium">
                      {session.user.name || session.user.email}
                    </span>
                  </div>
                  <form action={handleSignOut}>
                    <Button variant="outline" size="sm" type="submit">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </form>
                </div>
              ) : (
                <SignIn />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
