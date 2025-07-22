import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex justify-center items-center h-screen">
      {session?.user ? (
        <p>Hello {session?.user?.name}</p>
      ) : (
        <p>
          <span className="font-bold">Hey!</span> Go ahead and sign in
        </p>
      )}
    </div>
  );
}
