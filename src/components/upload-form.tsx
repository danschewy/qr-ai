/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import QRCode from "qrcode";
import { stylePrompts } from "~/utils/replicate";
import { UploadButton } from "~/utils/uploadthing";
import { useSession } from "next-auth/react";

export const UploadForm = () => {
  const { status } = useSession({ required: true });
  const { mutateAsync, isLoading } = api.generate.generate.useMutation();

  const { register, handleSubmit, watch, setValue } = useForm<{
    url: string;
    image: string;
    style: string;
  }>({
    defaultValues: {
      style: stylePrompts[0]?.name,
    },
  });

  const [isUrl, setIsUrl] = useState(true);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (status === "loading") return "Loading...";

  const urlValue = watch("url");
  const styleValue = watch("style");

  const getQR = () =>
    QRCode.toCanvas(
      canvasRef.current,
      urlValue,
      {
        width: 512,
      },
      (error) => {
        if (error) {
          if (!canvasRef.current) return;
          const { width, height } = canvasRef.current;
          canvasRef.current.getContext("2d")?.clearRect(0, 0, width, height);
        }
      }
    );
  const onSubmit = async (data: {
    url: string;
    style: string;
    image: string;
  }) => {
    try {
      return await mutateAsync(data).then((res) => {
        setResultImages(res.url);
      });
    } catch (error) {
      alert(error);
      return null;
    }
  };
  const image = watch("image");

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-16 sm:flex-row">
      {isLoading ? (
        <span className="text-white">
          Generating please be patient sometimes it takes a while...
        </span>
      ) : !resultImages.length ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full w-full flex-col items-start justify-start sm:flex-row sm:justify-evenly sm:gap-16"
        >
          <div
            data-testid="tabs"
            className="flex w-full flex-col sm:w-auto sm:grow"
          >
            <div className="flex flex-row items-center justify-center gap-8 text-white">
              <button type="button" onClick={() => setIsUrl(true)}>
                <div
                  className={`flex h-10 w-20 items-center justify-center rounded-lg font-semibold  hover:bg-blue-300 ${
                    isUrl
                      ? "bg-blue-400 text-white"
                      : "bg-blue-200 text-gray-500"
                  }`}
                >
                  URL
                </div>
              </button>
              <span className="text-center">or</span>
              <button type="button" onClick={() => setIsUrl(false)}>
                <div
                  className={`flex h-10 w-20 items-center justify-center rounded-lg font-semibold hover:bg-blue-300 ${
                    !isUrl
                      ? "bg-blue-400 text-white"
                      : "bg-blue-200 text-gray-500"
                  }`}
                >
                  Upload
                </div>
              </button>
            </div>
            {isUrl ? (
              <div className="mt-8 flex w-full flex-col items-center justify-center">
                <div className="flex w-full flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter your URL"
                    className="h-10 w-full rounded-md p-2"
                    {...register("url")}
                  />
                  <button onClick={getQR} type="button">
                    <div className="flex items-center justify-center rounded-lg bg-gray-400 p-2 font-semibold text-gray-300 hover:bg-gray-500">
                      Preview
                    </div>
                  </button>
                </div>
                {urlValue ? (
                  <canvas ref={canvasRef} className="m-2 h-64 w-64" />
                ) : (
                  <div className=" p-4 text-center text-amber-500">
                    Enter a url above
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center gap-6">
                <img src={image} width={256} height={256} alt="qr" />
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    setValue("url", "");
                    setValue("image", res?.[0]?.fileUrl ?? "");
                  }}
                />
              </div>
            )}
            <button
              className="my-6 sm:my-0"
              type="submit"
              onClick={() => setIsUrl(false)}
            >
              <div
                className={`mt-8 flex h-10 w-full items-center justify-center rounded-lg hover:bg-green-300 ${"bg-green-600 text-white"}`}
              >
                Submit
              </div>
            </button>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-white">Choose a style</h3>
            <div className="flex flex-wrap gap-8 p-3 sm:flex-row">
              {stylePrompts.map((style, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setValue("style", style.name)}
                  className={`flex h-36 w-36 items-end text-center font-semibold text-white ${
                    style.name === styleValue
                      ? "shadow-[0_10px_20px_rgba(240,_46,_170,_0.7)]"
                      : ""
                  }`}
                  style={{
                    backgroundImage: `url(${style.image})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                  }}
                >
                  <div className="grid h-12 w-full items-center bg-white/30 p-2 backdrop-blur-md">
                    {style.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap gap-4">
          {resultImages.map((url, index) => (
            <img src={url} alt="image" key={index} />
          ))}
        </div>
      )}
    </div>
  );
};
