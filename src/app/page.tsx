import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex justify-center items-center h-screen">
      {session?.user ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to LilyGem!</h1>
          <p className="mb-4">Hello {session?.user?.name}</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to LilyGem!</h1>
          <p className="mb-4">
            <span className="font-bold">Hey!</span> Go ahead and sign in
          </p>
        </div>
      )}
    </div>
  );
}
