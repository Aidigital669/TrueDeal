import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    // We will add providers like Google or Credentials here later
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
        // In a real app we'd fetch the role or attach it directly if using JWT
        // session.user.role = user.role; 
      }
      return session;
    },
  },
});
