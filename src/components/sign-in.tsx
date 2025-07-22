import { signIn } from "@/lib/auth";
import { Button } from "./ui/button";

export default function SignIn() {
  const handleSignIn = async () => {
    "use server";
    await signIn("google");
  };

  return (
    <form action={handleSignIn}>
      <Button type="submit">Signin with Google</Button>
    </form>
  );
}
