import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { useRef } from "react";
import QRCode from "qrcode";
import { stylePrompts } from "~/utils/replicate";

export const UploadForm: React.FC = () => {
  const { mutateAsync } = api.generate.generate.useMutation({
    onSuccess: (data) => {
      alert(data);
    },
  });

  const { register, handleSubmit, watch } = useForm<{
    url: string;
    style: string;
  }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLImageElement>(null);
  // With promises

  const styleNames = stylePrompts.map((prompt) => prompt.name);

  const urlValue = watch("url");

  const getQR = () =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    QRCode.toCanvas(canvasRef.current, urlValue, (error) => {
      if (error) {
        if (!canvasRef.current) return;
        const { width, height } = canvasRef.current;
        canvasRef.current.getContext("2d")?.clearRect(0, 0, width, height);
      }
    });

  return (
    <div>
      <h1>Upload Form</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit((data) => mutateAsync(data));
        }}
      >
        <div>
          <input
            type="text"
            placeholder="Enter your URL"
            {...register("url")}
          />
          <canvas ref={canvasRef} />
          <button className="bg-red-400" onClick={getQR}>
            Preview QR
          </button>
        </div>
        <h3>Choose a style</h3>
        <div className="flex sm:flex-row">
          {styleNames.map((styleName) => (
            <label key={styleName}>
              <img
                src={`https://placekitten.com/100/100`}
                alt={styleName}
                width="100"
                height="100"
              />
              <input
                type="radio"
                value={styleName}
                {...register("style")}
                defaultChecked={styleName === "candy"}
              />
              {styleName}
            </label>
          ))}
        </div>
        <button type="submit">Submit</button>
      </form>
      Result
      <img
        ref={resultRef}
        src={`https://placekitten.com/100/100`}
        alt="result"
        width="100"
        height="100"
      />
    </div>
  );
};
