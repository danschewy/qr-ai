import Replicate from "replicate";

const model =
  "anotherjesse/multi-control:76d8414a702e66c84fe2e6e9c8cbdc12e53f950f255aae9ffa5caa7873b12de0";

export const stylePrompts = [
  {
    name: "Mechanical Girl",
    prompt:
      "qr code,1mechanical girl,ultra realistic details, portrait, global illumination, shadows, octane render, 8k, ultra sharp,intricate, ornaments detailed, cold colors, metal, egypician detail, highly intricate details, realistic light, trending on cgsociety, glowing eyes, facing camera, neon details, machanical limbs,blood vessels connected to tubes,mechanical vertebra attaching to back,mechanical cervial attaching to neck,sitting,wires and cables connecting to head",
  },
  {
    name: "Cubism",
    prompt: "A painting of a cubist landscape",
  },
  {
    name: "Japanese Castle",
    prompt: "Japanese castle in Winter",
  },
];

export const replicate = new Replicate({
  auth: "r8_21OwUiCSDLs7cEtGZOugzZJbSOGWjv60mdLtJ",
});

const image = "https://i.ibb.co/c3F6hZf/download-1.png";

export const createGeneration = async (style: string, image: string) => {
  return await replicate
    ?.run(model, {
      input: {
        prompt: "Japanese castle in Winter",
        negative_prompt: "ugly, disfigured, low quality, blurry",
        normal_image: image,
        qr_image: image,
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
