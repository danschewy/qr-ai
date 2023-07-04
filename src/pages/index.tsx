/* eslint-disable @next/next/no-img-element */
import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { UploadForm } from "~/components/upload-form";
import { AuthShowcase } from "~/components/auth";
import StripePricing from "~/components/payment";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const { data: isSubscribed } = api.subscription.getIsSubscribed.useQuery({
    email: sessionData?.user?.email ?? "",
  });

  const view = <UploadForm />;
  return (
    <>
      <Head>
        <title>QR-AI</title>
        <meta name="description" content="Cool QR Codes" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="flex h-full flex-col gap-12 px-4 py-6 sm:p-6">
          <div className="flex flex-row justify-between">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
              QR <span className="text-[hsl(280,100%,70%)]">AI</span>
            </h1>
            <button
              className="flex flex-row items-center justify-center gap-4 rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData?.user?.image && (
                <img
                  className="rounded-full"
                  src={sessionData.user.image}
                  alt="user image"
                  width={36}
                />
              )}
              {sessionData ? "Sign out" : "Sign in"}
            </button>
          </div>
          <div className="flex h-full w-full grow flex-row items-center justify-center gap-2">
            {view}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
