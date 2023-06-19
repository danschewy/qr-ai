import Replicate from "replicate";

const model =
  "anotherjesse/multi-control:76d8414a702e66c84fe2e6e9c8cbdc12e53f950f255aae9ffa5caa7873b12de0";

export const stylePrompts = [
  {
    name: "Abstract",
    prompt: "A painting of an abstract landscape",
  },
  {
    name: "Cubism",
    prompt: "A painting of a cubist landscape",
  },
  {
    name: "Japanese Castle",
    prompt: "A painting of a Japanese castle",
  },
];

export const replicate = process.env.REPLICATE_API_TOKEN
  ? new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    })
  : undefined;

export const createGeneration = async () => {
  console.log("generating");
  debugger;
  return await replicate?.run(model, {
    input: {
      prompt: stylePrompts[2]?.prompt,
    },
  });
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
