/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { Controller, useForm } from "react-hook-form";
import { type ChangeEvent, useRef, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import { stylePrompts } from "~/utils/replicate";
import { uploadFiles } from "~/utils/uploadthing";
import { useSession } from "next-auth/react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

function srcToFile(src: RequestInfo | URL, fileName: string, mimeType: string) {
  return fetch(src)
    .then(function (res) {
      return res.arrayBuffer();
    })
    .then(function (buf) {
      return new File([buf], fileName, { type: mimeType });
    });
}

export const UploadForm = () => {
  const { status } = useSession({ required: true });
  const {
    mutateAsync,
    isLoading: isGenerating,
    isIdle,
    isError,
    isSuccess,
  } = api.generate.generate.useMutation();
  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
    watch,
    setValue,
    control,
  } = useForm<{
    url: string;
    qr_image: string;
    style: string;
  }>({
    defaultValues: {
      style: stylePrompts[0]?.name,
      url: "",
    },
  });

  const [rawQRImage, setRawQRImage] = useState<string>("");
  const [isUrl, setIsUrl] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  if (status === "loading") return "Loading...";

  const urlValue = watch("url");
  const styleValue = watch("style");

  const getQR = (text?: string) => {
    canvasRef.current &&
      QRCode.toDataURL(
        canvasRef.current,
        text || urlValue,
        {
          width: 512,
        },
        (error, url) => {
          if (error) {
            console.log("error", error, "urlValue", urlValue);
            if (!canvasRef.current) return;
            const { width, height } = canvasRef.current;
            canvasRef.current.getContext("2d")?.clearRect(0, 0, width, height);
          } else {
            setUrlPreview(url);
          }
        }
      );
  };

  const onSubmit = async (data: {
    url: string;
    style: string;
    qr_image: string;
  }) => {
    const finalImage = isUrl ? urlPreview : getCropData();
    let uploadedImage;
    if (!finalImage) return;
    try {
      const fileName = crypto.randomUUID() + ".png";
      const files = [
        await srcToFile(new URL(finalImage), fileName, "image/png"),
      ];
      setIsLoading(true);
      const res = await uploadFiles({
        files,
        endpoint: "imageUploader",
      });
      uploadedImage = res[0]?.fileUrl;
    } catch (error) {
      console.error(error);
    }
    try {
      return await mutateAsync({
        url: data.url,
        style: data.style,
        image: uploadedImage,
      }).then((res) => {
        setResultImages(res.url as string[]);
        reset();
        setIsLoading(false);
      });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getCropData = (instance?: Cropper) => {
    if (typeof cropper !== "undefined" && cropper !== null) {
      const croppedCanvas = (cropper || instance).getCroppedCanvas({
        fillColor: "#fff",
        imageSmoothingEnabled: false,
        imageSmoothingQuality: "high",
      });
      if (croppedCanvas === null) return "";
      const resizedCanvas = document.createElement("canvas");
      const resizedContext = resizedCanvas.getContext("2d");

      // Set the desired fixed width and height
      const fixedWidth = 512;
      const fixedHeight = 512;

      resizedCanvas.width = fixedWidth;
      resizedCanvas.height = fixedHeight;

      // Draw the cropped image onto the resized canvas with fixed dimensions
      resizedContext?.drawImage(
        croppedCanvas,
        0,
        0,
        croppedCanvas.width,
        croppedCanvas.height,
        0,
        0,
        fixedWidth,
        fixedHeight
      );
      return resizedCanvas.toDataURL();
    }
    return "";
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-16 sm:flex-row">
      {isLoading || isGenerating || isIdle ? (
        <span className="text-white">
          Generating please be patient sometimes it takes a while...
        </span>
      ) : isError ? (
        <h1 className="font-4xl">Whoops error</h1>
      ) : !resultImages?.length ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-full w-full flex-col items-start justify-start sm:flex-row sm:justify-evenly sm:gap-16"
        >
          <div
            data-testid="tabs"
            className="flex w-full flex-col sm:max-w-md sm:grow"
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
            {errors.root?.message && (
              <div className="h-7 bg-orange-400">{errors.root?.message}</div>
            )}

            {isUrl ? (
              <div className="mt-8 flex w-full flex-col items-center justify-center">
                <div className="flex w-full flex-row gap-2">
                  <Controller
                    control={control}
                    name="url"
                    rules={{ required: true, minLength: 4 }}
                    render={({ field: { onChange } }) => (
                      <input
                        type="text"
                        placeholder="Enter your URL"
                        className="h-10 w-full rounded-md p-2"
                        onInput={(event: FormEvent<HTMLInputElement>) => {
                          onChange(event.currentTarget?.value);
                          getQR(event.currentTarget?.value || "");
                        }}
                        {...register("url", {
                          required: "This is required.",
                        })}
                      />
                    )}
                  />
                </div>
                <canvas ref={canvasRef} className="hidden" />
                {urlPreview ? (
                  <>
                    {/* <h2>Click Preview to see QR code</h2> */}
                    <img
                      src={urlPreview || ""}
                      className="mt-2"
                      alt="QR code"
                    />
                  </>
                ) : (
                  <div className=" p-4 text-center text-amber-500">
                    Enter a url above
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center gap-6">
                <Controller
                  name="qr_image"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <>
                      <input
                        title="Upload an image"
                        type="file"
                        accept="image/*"
                        className="h-full w-full cursor-pointer rounded-md bg-gray-400 bg-opacity-60"
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          setRawQRImage(
                            URL.createObjectURL(
                              event.target?.files?.item(0) as File
                            )
                          )
                        }
                      />
                      {rawQRImage ? (
                        <Cropper
                          className="cropper"
                          initialAspectRatio={1}
                          aspectRatio={1}
                          src={rawQRImage}
                          viewMode={0}
                          style={{ height: 300, width: 300 }}
                          minCropBoxHeight={10}
                          minCropBoxWidth={10}
                          background={false}
                          responsive={false}
                          autoCropArea={1}
                          checkOrientation={false}
                          onInitialized={(instance) => {
                            setCropper(instance);
                            onChange(getCropData(instance));
                          }}
                          guides={true}
                        />
                      ) : null}
                    </>
                  )}
                />
              </div>
            )}

            <button className="my-6 sm:my-0" type="submit">
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
