import { signIn } from "next-auth/react";

export const AuthShowcase: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-2xl text-white">
      <p>Sign in to access your free trial</p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => void signIn()}
      >
        {"Sign in"}
      </button>
    </div>
  );
};
