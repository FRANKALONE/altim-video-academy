import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // MOCK AUTHENTICATION FOR DEMO
                if (
                    credentials?.email === "psola@altim.es" &&
                    credentials?.password === "Altim2025!"
                ) {
                    return {
                        id: "1",
                        name: "Pablo Sola",
                        email: "psola@altim.es",
                        role: "ADMIN"
                    };
                }
                return null;
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.id = (user as any).id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    debug: true, // Enable debug messages in console
    secret: "super-secret-key-altim-2025", // Hardcoded for dev stability
});

export { handler as GET, handler as POST };
