import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { GUEST_ACCOUNTS } from "@/app/lib/demoData";
import { findMockUser } from "@/app/lib/mockUsers";

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

const demoCredentialUsers = GUEST_ACCOUNTS.map((acct) => ({
  username: acct.username.toLowerCase(),
  email: `${acct.username.toLowerCase()}@demo.ecocard`,
  password: acct.password,
  name: acct.persona || acct.username,
}));

function matchDemoUser(identifier: string) {
  const normalized = identifier.trim().toLowerCase();
  return demoCredentialUsers.find(
    (user) => user.email === normalized || user.username === normalized,
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "EcoCard",
      credentials: {
        email: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.email ?? "";
        const password = credentials?.password ?? "";
        if (!identifier || !password) {
          throw new Error("Missing email or password");
        }

        const mockUser = findMockUser(identifier);
        const guestUser = matchDemoUser(identifier);
        const candidate = mockUser || guestUser;

        if (!candidate || candidate.password !== password) {
          throw new Error("Invalid credentials");
        }

        return {
          id: candidate.email,
          name: candidate.name,
          email: candidate.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, account }: { token: any; account?: any }) {
      // store access token
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      // make token accessible in client
      session.accessToken = token.accessToken;
      return session;
    },
  },
  debug: true, // Enable debug logging
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };