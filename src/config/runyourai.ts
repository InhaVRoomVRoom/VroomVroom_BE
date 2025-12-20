import axios from 'axios';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

// ===== 설정 =====
const COMFY = 'http://localhost:8188';
const API_FILE = '360_Panomara_translator_API.json'; // API format 파일명
const SAVE_DIR = path.join(process.cwd(), 'uploads/comfyUI'); // 저장 폴더 (사용자 환경에 맞게 수정)
const TIMEOUT_MS = 600 * 1000; // 10분

const POS_NODE_ID = '33';
const NEG_NODE_ID = '34';
const SUFFIX = '360, 360 view';
const NEG_DEFAULT =
  'text, watermark, deformed, glitch, noise, noisy, off-center';

// API 프롬프트 로드
function loadApiPrompt(fileName: string): any {
  const completePath = path.join(process.cwd(), 'src', 'config', fileName);
  const rawData = fs.readFileSync(completePath, 'utf-8');
  const data = JSON.parse(rawData);
  return data.prompt ? data.prompt : data;
}

// 작업 제출
async function submitPrompt(prompt: any): Promise<string> {
  const response = await axios.post(`${COMFY}/prompt`, {
    prompt,
    client_id: 'local-pc',
  });

  if (!response.data.prompt_id) {
    throw new Error(`Unexpected response: ${JSON.stringify(response.data)}`);
  }
  return response.data.prompt_id;
}

// 히스토리 가져오기
async function getHistory(promptId: string): Promise<any> {
  try {
    const response = await axios.get(`${COMFY}/history/${promptId}`);
    return response.data;
  } catch (error) {
    return {};
  }
}

// 이미지 메타데이터 찾기
function findFirstImageMeta(historyItem: any) {
  const outputs = historyItem.outputs || {};
  for (const nodeOutput of Object.values<any>(outputs)) {
    if (nodeOutput.images && nodeOutput.images.length > 0) {
      const img = nodeOutput.images[0];
      return {
        filename: img.filename,
        subfolder: img.subfolder || '',
        type: img.type || 'output',
      };
    }
  }
  return null;
}

// 이미지 다운로드
async function downloadImage(
  filename: string,
  subfolder: string,
  type: string,
): Promise<Buffer> {
  const response = await axios.get(`${COMFY}/view`, {
    params: { filename, subfolder, type },
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
}

async function comfyUI(userPrompt: string): Promise<string | null> {
  try {
    if (!fs.existsSync(SAVE_DIR)) {
      fs.mkdirSync(SAVE_DIR, { recursive: true });
    }

    userPrompt = userPrompt.trim();

    if (!userPrompt) {
      console.log('❌ 프롬프트가 비어있습니다.');
      return null;
    }

    // Suffix 추가
    if (!userPrompt.includes(SUFFIX)) {
      userPrompt = `${userPrompt.replace(/,$/, '')}, ${SUFFIX}`;
    }

    // API 설정 로드 및 주입
    const promptConfig = loadApiPrompt(API_FILE);

    if (!promptConfig[POS_NODE_ID] || !promptConfig[NEG_NODE_ID]) {
      console.log(
        '❌ POS/NEG 노드 ID가 API 파일과 다릅니다. (ID 33/34 확인 필요)',
      );
      return null;
    }

    promptConfig[POS_NODE_ID].inputs.text = userPrompt;
    promptConfig[NEG_NODE_ID].inputs.text = NEG_DEFAULT;

    // 작업 제출
    const promptId = await submitPrompt(promptConfig);
    console.log(`✅ 작업 제출 완료. prompt_id = ${promptId}`);

    const startTime = Date.now();
    let lastPrintTime = 0;

    // 완료 대기 루프
    while (true) {
      const elapsed = Date.now() - startTime;
      if (elapsed > TIMEOUT_MS) {
        console.log('❌ 타임아웃: 시간이 너무 오래 걸렸습니다.');
        break;
      }

      const history = await getHistory(promptId);
      const item = history[promptId];

      if (!item) {
        if (Date.now() - lastPrintTime > 3000) {
          console.log('⏳ 대기 중... (서버 처리 시작 전)');
          lastPrintTime = Date.now();
        }
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      const imgMeta = findFirstImageMeta(item);
      if (imgMeta) {
        console.log(`✅ 이미지 발견: ${imgMeta.filename}`);

        const imgBuffer = await downloadImage(
          imgMeta.filename,
          imgMeta.subfolder,
          imgMeta.type,
        );

        const timestamp = new Date()
          .toISOString()
          .replace(/[:.]/g, '-')
          .slice(0, 19);
        const ext = path.extname(imgMeta.filename) || '.png';
        const savePath = path.join(SAVE_DIR, `comfy_${timestamp}${ext}`);

        if (!fs.existsSync(SAVE_DIR)) {
          fs.mkdirSync(SAVE_DIR, { recursive: true });
        }

        fs.writeFileSync(savePath, imgBuffer);
        console.log(`🎉 내 PC 저장 완료: ${savePath}`);
        return savePath;
        break;
      }

      if (Date.now() - lastPrintTime > 3000) {
        console.log('⏳ 생성 중...');
        lastPrintTime = Date.now();
      }

      await new Promise((r) => setTimeout(r, 1000));
    }
  } catch (error: any) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    return null;
  }
}

export default comfyUI;
