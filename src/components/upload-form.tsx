/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import QRCode from "qrcode";
import { stylePrompts } from "~/utils/replicate";
import { UploadButton, uploadFiles } from "~/utils/uploadthing";
import { useSession } from "next-auth/react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const defaultSrc = "https://i.redd.it/g4ywfjkr4ct51.png";

export const UploadForm = () => {
  const { status } = useSession({ required: true });
  const { mutateAsync, isLoading } = api.generate.generate.useMutation();

  const { register, handleSubmit, watch, setValue } = useForm<{
    url: string;
    image0: string;
    style: string;
  }>({
    defaultValues: {
      style: stylePrompts[0]?.name,
    },
  });

  const [isUrl, setIsUrl] = useState(true);
  const [uv2, setUv2] = useState("");
  const [resultImages, setResultImages] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (status === "loading") return "Loading...";

  const urlValue = watch("url");
  const styleValue = watch("style");

  const saveAsPNG = () => {
    const canvas = canvasRef.current;

    if (canvas) {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "qr_code.png";
      link.href = dataURL;
      link.click();
    }
  };

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
  // console.log("out", QRCode.toBuffer(uv2));
  console.log(uv2);
  console.log("ok/");
  const onSubmit = async (data: {
    url: string;
    style: string;
    image0: string;
    // canvasRef: string;
  }) => {
    // Save the QR code
    try {
      console.log("got canv?");
      saveAsPNG();
      // Send to uploadthing
      console.log(canvasRef, "nowfiles");
      const files = [
        new File(["qr_code.png"], "qr_code.png", {
          type: "image/png",
        }),
      ];

      const res = await uploadFiles({
        files,
        endpoint: "imageUploader",
        // input: {'qr_code.png'}
        // input: {}, // will be typesafe to match the input set for `imageUploader` in your FileRouter
      });
      console.log("hopefully uploaded?", res);

      // Now send to replicate
    } catch (error) {
      alert(error);
      return null;
    }
    try {
      return await mutateAsync(data).then((res) => {
        // setResultImages(res.url as string[]);
        console.log("sent");
      });
    } catch (error) {
      alert(error);
      return null;
    }
  };
  const image0 = watch("image0");

  // Cropper
  const [image, setImage] = useState(defaultSrc);
  const [cropData, setCropData] = useState("");
  const [cropper, setCropper] = useState(null);

  const onChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

  const getCropData = () => {
    if (typeof cropper !== "undefined" && cropper !== null) {
      const croppedCanvas = cropper.getCroppedCanvas({
        fillColor: "#fff",
        imageSmoothingEnabled: false,
        imageSmoothingQuality: "high",
      });

      const resizedCanvas = document.createElement("canvas");
      const resizedContext = resizedCanvas.getContext("2d");

      // Set the desired fixed width and height
      const fixedWidth = 512;
      const fixedHeight = 512;

      resizedCanvas.width = fixedWidth;
      resizedCanvas.height = fixedHeight;

      // Draw the cropped image onto the resized canvas with fixed dimensions
      resizedContext.drawImage(
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

      setCropData(resizedCanvas.toDataURL());
    }
  };

  const useDefaultImage = () => {
    setImage(defaultSrc);
  };

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
                  <>
                    {/* <h2>Click Preview to see QR code</h2> */}
                    <canvas ref={canvasRef} className="m-2 h-64 w-64" />
                  </>
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
                    setValue("image0", res?.[0]?.fileUrl ?? "");
                  }}
                />
              </div>
            )}
            <h3>Select image for cropper</h3>
            <input type="file" onChange={onChange} />
            &nbsp; &nbsp;
            <div className="flex items-center justify-center rounded-lg bg-gray-400 p-2 font-semibold text-gray-300 hover:bg-gray-500">
              <button type="button" onClick={getCropData}>
                Crop Image
              </button>
            </div>
            <Cropper
              className="cropper"
              zoomTo={0.2}
              initialAspectRatio={1}
              aspectRatio={1}
              src={image}
              viewMode={0}
              minCropBoxHeight={10}
              minCropBoxWidth={10}
              background={false}
              responsive={true}
              autoCropArea={1}
              checkOrientation={false}
              onInitialized={(instance) => {
                setCropper(instance);
              }}
              guides={true}
            />
            <ImageUploadPage />
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
            {cropData ? (
              <img style={{ height: "512px" }} src={cropData} alt="cropped" />
            ) : (
              <h1>Cropped image will apear here!</h1>
            )}
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

const ImageUploadPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
  };

  return (
    <div>
      <h1>Image Upload</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {selectedImage && <img src={selectedImage} alt="Selected Image" />}
    </div>
  );
};
