import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";
// import jwt from "jsonwebtoken";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  callbacks: {
    // TODO(@bionboy, 25-08-26, https://github.com/bionboy/lilygem/issues/11): I need this for RLS to work apparently but I cant get it to work with the edge environment and I need to learn morea about RLS in general
    //   async session({ session, user }) {
    //     // Create a JWT token for Supabase RLS
    //     const signingSecret = process.env.SUPABASE_JWT_SECRET;
    //     if (signingSecret) {
    //       const payload = {
    //         aud: "authenticated",
    //         exp: Math.floor(new Date(session.expires).getTime() / 1000),
    //         sub: user.id,
    //         email: user.email,
    //         role: "authenticated",
    //       };
    //       session.supabaseAccessToken = jwt.sign(payload, signingSecret);
    //     }
    //     return session;
    //   },
  },
});
