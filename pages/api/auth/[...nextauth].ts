import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn({ account, profile }) {
      const payload = {
        email: profile?.email,
        sub: profile?.sub,
        name: profile?.name,
      };

      try {
        const response = await (await fetch(
          "https://staging.api.coinfolks.id/api/v1/auth/login/google",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Coinfolks-App-Id": "1",
            },
            body: JSON.stringify(payload),
          },
        )).json();

        console.log("success logged in");
        console.log(response);
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
      }

      return true;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
};

export default NextAuth(authOptions);
