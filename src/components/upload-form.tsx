/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import QRCode, { toBuffer } from "qrcode";
import { stylePrompts } from "~/utils/replicate";
import { UploadButton, useUploadThing } from "~/utils/uploadthing";
import { useSession } from "next-auth/react";

export const UploadForm = () => {
  const { status } = useSession({ required: true });
  const { mutateAsync } = api.generate.generate.useMutation();

  const { register, handleSubmit, watch, setValue } = useForm<{
    url: string;
    image: string;
    style: string;
  }>();

  const [isUrl, setIsUrl] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLImageElement>(null);

  if (status === "loading") return "Loading...";

  const styleNames = stylePrompts.map((prompt) => prompt.name);

  const urlValue = watch("url");

  const getQR = () =>
    QRCode.toCanvas(
      canvasRef.current,
      urlValue,
      {
        width: 255,
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
    alert();
    try {
      return mutateAsync(data);
    } catch (error) {
      alert(error);
      return null;
    }
  };
  const image = watch("image");
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-16 sm:flex-row">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-full w-full flex-col items-start justify-start sm:flex-row sm:justify-evenly"
      >
        <div data-testid="tabs" className="flex flex-col">
          <div className="flex flex-row gap-16 text-white">
            <button type="button" onClick={() => setIsUrl(true)}>
              <div
                className={`flex h-10 w-20 items-center justify-center rounded-lg  hover:bg-blue-300 ${
                  isUrl ? "bg-blue-400 text-white" : "bg-blue-200 text-gray-500"
                }`}
              >
                URL
              </div>
            </button>
            <button type="button" onClick={() => setIsUrl(false)}>
              <div
                className={`flex h-10 w-20 items-center justify-center rounded-lg hover:bg-blue-300 ${
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
            <div className="mt-8">
              <input
                type="text"
                placeholder="Enter your URL"
                className="h-10 w-96 p-1"
                {...register("url")}
              />
              <canvas ref={canvasRef} className="m-2" />
              <button onClick={getQR} type="button">
                <div className="flex items-center justify-center rounded-lg bg-gray-400 p-2 text-gray-700">
                  Preview QR
                </div>
              </button>
            </div>
          ) : (
            <div className="mt-8 flex grow flex-col items-center justify-center gap-6">
              {image && <img src={image} alt="qr" width={255} height={255} />}
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  setValue("url", "");
                  setValue("image", res?.[0]?.fileUrl ?? "");
                }}
              />
            </div>
          )}
        </div>
        <div>
          <h3>Choose a style</h3>
          <div className="flex sm:flex-row">
            {styleNames.map((styleName) => (
              <label key={styleName}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://placekitten.com/100/100`}
                  alt={styleName}
                  width="100"
                  height="100"
                />
                <input
                  type="radio"
                  value={styleName}
                  {...register("style", {
                    value: "candy",
                  })}
                  defaultChecked={styleName === "candy"}
                />
                {styleName}
              </label>
            ))}
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};
