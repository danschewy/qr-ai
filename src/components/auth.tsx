import { signIn } from "next-auth/react";
import ReactCompareImage from "react-compare-image";
import homeQRImage1 from "public/home-qr-image-1.png";
import homeQRImage2 from "public/home-qr-image-2.png";

export const AuthShowcase: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-2xl text-white">
      <ReactCompareImage
        leftImage={homeQRImage1.src}
        leftImageAlt="qr code"
        rightImage={homeQRImage2.src}
        rightImageAlt="qr code art generated"
      />
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
