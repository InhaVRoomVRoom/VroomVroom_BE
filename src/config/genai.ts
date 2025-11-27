import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from '@google/genai';
import * as fs from 'node:fs';
import path from 'node:path';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const default_prompt =
  '이 이미지를 변환해줘.' + 'VR 컨트롤러를 안보이게 그림에서 삭제해줘.';

const googleAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const geminiImage = async (
  imageUrl: string,
  prompt: string,
): Promise<string> => {
  const imagePath = imageUrl;
  const imageName = path.basename(imagePath);
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');
  const mimeType = getMimeType(imageUrl);

  const promptInput = [
    { text: default_prompt + `${prompt}` },
    {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    },
  ];

  const response = await googleAI.models
    .generateContent({
      model: 'gemini-2.5-flash-image',
      contents: promptInput,
      config: {
        candidateCount: 1,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      },
    })
    .catch((err) => {
      console.log(err);
      throw new Error('gemini error');
    });

  //console.log(JSON.stringify(response, null, 2));
  //console.log(response.promptFeedback);

  const writeFilePath = `uploads/banana/banana_${imageName}`;
  for (const part of response!.candidates![0]!.content!.parts!) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data || '';
      const buffer = Buffer.from(imageData, 'base64');
      fs.writeFileSync(writeFilePath, buffer);
    }
  }

  return writeFilePath;
};

const getMimeType = (imageUrl: string) => {
  const ext = path.extname(imageUrl).toLowerCase();
  switch (ext) {
    case '.png':
      return 'image/png';
    case '.jpeg':
    case '.jpg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.heic':
      return 'image/heic';
    case '.heif':
      return 'image/heif';
    default:
      return 'image/jpeg'; // 기본값 설정
  }
};

export { geminiImage };
