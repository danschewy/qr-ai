import Replicate from "replicate";
import qrImageCastle from "~/assets/japanese-castle.png";
import qrImageGreekBath from "~/assets/greek-bath.png";
import qrImageTemple from "~/assets/temple-qr.png";
import qrImageBambooInk from "~/assets/bamboo-ink-qr.png";

const model =
  "anotherjesse/multi-control:76d8414a702e66c84fe2e6e9c8cbdc12e53f950f255aae9ffa5caa7873b12de0";

export const stylePrompts = [
  {
    name: "Bamboo Ink",
    image: qrImageBambooInk.src,
    prompt: "bamboo ink wash painting style",
  },
  {
    name: "Temple",
    image: qrImageTemple.src,
    prompt:
      "temple in ruines, forest, stairs, columns, cinematic, detailed, atmospheric, epic, concept art, Matte painting, background, mist, photo-realistic, concept art, volumetric light, cinematic epic + rule of thirds octane render, 8k, corona render, movie concept art, octane render, cinematic, trending on artstation, movie concept art, cinematic composition , ultra-detailed, realistic , hyper-realistic , volumetric lighting, 8k -ar 1:1 -test -uplight",
  },
  {
    image: qrImageCastle.src,
    name: "Japanese Castle",
    prompt: "Japanese castle in Winter",
  },
  {
    image: qrImageGreekBath.src,
    name: "Greek Baths",
    prompt:
      "Sky view of highly aesthetic, ancient greek thermal baths in beautiful nature",
  },
];

export const replicate = new Replicate({
  auth: "r8_21OwUiCSDLs7cEtGZOugzZJbSOGWjv60mdLtJ",
});

export const createGeneration = async (style: string, image: string) => {
  return await replicate
    ?.run(model, {
      input: {
        prompt: stylePrompts.find((p) => p.name === style)?.prompt,
        negative_prompt: "ugly, disfigured, low quality, blurry",
        normal_image: image,
        qr_image: image,
        num_outputs: 3,
      },
    })
    .catch((e) => console.error("repliicc", e));
};
/**
   * {
  "type": "array",
  "items": {
    "type": "string",
    "format": "uri"
  },
  "title": "Output"
}
   */
