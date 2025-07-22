import { auth, signOut } from "@/lib/auth";
import { Button } from "./ui/button";
import { User, LogOut } from "lucide-react";
import Link from "next/link";
import SignIn from "./sign-in";

export default async function Header() {
  const session = await auth();

  const handleSignOut = async () => {
    "use server";
    await signOut();
  };

  console.log(">>>>> HEADER >>>>> session: ", session);

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-semibold">
            <Link href="/">LilyGem</Link>
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {session?.user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="w-8 h-8 p-1 bg-gray-100 rounded-full" />
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
