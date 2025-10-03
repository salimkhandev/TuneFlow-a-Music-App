import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV !== "production",
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.picture = profile.picture;
        token.name = profile.name;  
        token.email = profile.email;
      }
      // console.log("[next-auth][jwt] token:", {
      //   name: token?.name,
      //   email: token?.email,
      //   hasPicture: Boolean(token?.picture),
      // });
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          name: token.name,
          email: token.email,
          image: token.picture,
        };
      }
      // console.log("[next-auth][session] session:", {
      //   isAuthenticated: Boolean(session?.user?.email),
      //   user: {
      //     name: session?.user?.name,
      //     email: session?.user?.email,
      //     hasImage: Boolean(session?.user?.image),
      //   },
      // });
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };


