import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import "~/styles/globals.css";
import "@uploadthing/react/styles.css";

const MyApp: AppType<{ session: Session }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  // Create our router
  const router = useRouter();

  return (
    <SessionProvider session={{ ...session, expires: "" }}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
