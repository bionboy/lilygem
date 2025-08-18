import { auth, signOut } from "@/lib/auth";
import { Button } from "./ui/button";
import { User, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SignIn from "./sign-in";
import ThemeToggle from "./theme-toggle";
import ThemePicker from "./theme-picker";

export default async function Header() {
  const session = await auth();

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
          <ThemeToggle />
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
    </header>
  );
}
