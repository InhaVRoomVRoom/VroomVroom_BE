import {
  Controller,
  Tags,
  Get,
  Route,
  SuccessResponse,
  Post,
  Request,
  Response,
  Query,
  Body,
  UploadedFile,
  UploadedFiles,
  FormField,
  Middlewares,
} from 'tsoa';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {
  ITsoaErrorResponse,
  ITsoaSuccessResponse,
  TsoaSuccessResponse,
} from '../config/tsoaResponse';
import VroomService from '../Service/vroom.Service';
import { storyboard } from '@prisma/client';
import upload from '../Middleware/upload';
import { UploadFailError } from '../DTO/errorDTO';
import { ResponseFromStoryBoard } from '../DTO/vroomDTO';

@Tags('Vroom API')
@Route('/api')
export class VroomController extends Controller {
  VroomService: VroomService;
  constructor() {
    super();

    this.VroomService = new VroomService();
  }

  @Get('test')
  @SuccessResponse('200', 'Success')
  public async test(): Promise<{ message: string }> {
    this.setStatus(200); // 명시적으로 상태 코드 설정
    return { message: 'Hello World!' };
  }

  /**
   * 유저 생성 api
   * @param body.name 유저 이름
   * @sumamry 유저 생성 API
   * @description 유저 이름을 입력하면 새 유저를 생성합니다. 이미 존재하는 경우 에러를 반환합니다.
   * @returns 성공 메시지
   */
  @Post('/user/new')
  @SuccessResponse(201, '유저 생성 성공')
  @Response<ITsoaErrorResponse>('500', 'Internal Server Error', {
    resultType: 'FAIL',
    error: {
      errorCode: 'ERR-0',
      reason: 'Unknown server error.',
      data: null,
    },
    success: null,
  })
  @Response<ITsoaErrorResponse>('409', 'Duplicate User Error', {
    resultType: 'FAIL',
    error: {
      errorCode: 'DUPLICATE_USER',
      reason: '이미 존재하는 유저입니다.',
      data: null,
    },
    success: null,
  })
  public async createUserController(
    @Body() body: { name: string },
  ): Promise<ITsoaSuccessResponse<string>> {
    const userName: string = body.name || 'noname';

    await VroomService.createUserService(userName);

    this.setStatus(201);
    return new TsoaSuccessResponse<string>('유저 생성 성공');
  }

  /**
   * 스토리보드 생성 api
   * @param body.user_name 유저 이름
   * @param body.title 스토리보드 이름
   * @summary 스토리 보드 생성 API
   * @description 스토리 보드를 새로 생성합니다.
   * @return 스토리보드 정보
   */
  @Post('/storyboard/new')
  @SuccessResponse(201, '스토리보드 생성 성공')
  @Response<ITsoaErrorResponse>('500', 'Internal Server Error', {
    resultType: 'FAIL',
    error: {
      errorCode: 'ERR-0',
      reason: 'Unknown server error.',
      data: null,
    },
    success: null,
  })
  @Response<ITsoaErrorResponse>('409', 'Duplicate User Error', {
    resultType: 'FAIL',
    error: {
      errorCode: 'DUPLICATE_USER',
      reason: '이미 존재하는 유저입니다.',
      data: null,
    },
    success: null,
  })
  @Response<ITsoaErrorResponse>('400', 'NOT FOUND ERROR', {
    resultType: 'FAIL',
    error: {
      errorCode: 'NOT_FOUND',
      reason: '존재하지 않는 유저입니다.',
      data: null,
    },
    success: null,
  })
  public async createStoryBoardController(
    @Body() body: { user_name: string; title: string },
  ): Promise<ITsoaSuccessResponse<storyboard>> {
    const userName: string = body.user_name || 'noname';
    const boardName: string = body.title || 'noname';

    const newBoard = await VroomService.createStoryBoardService(
      boardName,
      userName,
    );

    this.setStatus(201);
    return new TsoaSuccessResponse<storyboard>(newBoard);
  }

  /**
   * 스토리 반환 API
   * @param username 스토리보드를 소유한 유저 이름
   * @summary 유저 스토리보드 조회
   * @description 유저의 스토리보드 목록을 반환합니다.
   * @returns 스토리보드 정보와 이미지 정보
   */
  @Get('/storyboard')
  @SuccessResponse(200, '스토리보드 조회 성공')
  public async getStoryBoardController(
    @Query() username: string,
  ): Promise<ITsoaSuccessResponse<ResponseFromStoryBoard>> {
    const userName: string = username || 'noname';

    const result = await VroomService.getStoryBoardService(userName);

    this.setStatus(200);
    return new TsoaSuccessResponse<ResponseFromStoryBoard>(result);
  }

  /**
   * 스토리보드 이미지 업로드 API
   * @param body.boardId 이미지가 해당되는 보드 imageData
   * @sumamry 스토리보드 이미지 업로드 API
   * @description 스토리보드에 스크린샷을 첨부합니다. 여러 개의 스크린샷도 가능합니다.
   * @returns 이미지 url리스트
   */
  @Post('/upload/image')
  @SuccessResponse(201, '이미지 업로드 성공')
  public async uploadImageController(
    @Request() req: ExpressRequest,
  ): Promise<ITsoaSuccessResponse<string[]>> {
    console.log(req.body);
    const result = await this.handleFile(req).catch((err) => {
      throw new UploadFailError(err.message);
    });
    console.log(result);

    await VroomService.uploadImageService(result, req.body.boardId);

    const imageUrls = await VroomService.getImageUrls(req.body.boardId);

    this.setStatus(201);
    return new TsoaSuccessResponse<string[]>(imageUrls);
  }

  /**
   * 나노바나나 변환 API
   * @param body.image_url 변환할 원본 사진 url
   * @param body.prompt 변환하고 싶은 프롬프트 입력
   * @param body.boardId 변환 사진을 추가할 보드의 ID 입력
   * @summary 나노바나나 이미지 변환 API
   * @description 나노바나나로 스토리보드에 있는 사진을 원하는 프롬프트로 변환합니다. 최대한 자세할수록 좋습니다.
   * @returns
   */
  @Post('/upload/ai')
  @SuccessResponse(201, 'AI 이미지 업로드 성공')
  public async uploadAiImageController(
    @Body() body: { image_url: string; boardId: string; prompt: string },
  ): Promise<ITsoaSuccessResponse<any>> {
    const result = await VroomService.geminiImageService(
      body.image_url,
      body.prompt,
      body.boardId,
    ).catch((err) => {
      console.log(err);
    });

    this.setStatus(201);

    return new TsoaSuccessResponse<any>(result);
  }

  /**
   *
   * @param request
   * @returns
   */
  @Post('/upload/image/ai')
  @SuccessResponse(201, 'AI 이미지 변환 성공')
  public async uploadImageToAiController(
    @Request() req: ExpressRequest,
  ): Promise<ITsoaSuccessResponse<string>> {
    console.log(req.body);
    const result = await this.handleFile(req).catch((err) => {
      throw new UploadFailError(err.message);
    });
    console.log(result);

    const imageUrl: string = await VroomService.uploadSingleImageService(
      result,
      req.body.boardId,
    );

    const aiUrl = await VroomService.geminiImageService(
      imageUrl,
      req.body.prompt,
      req.body.boardId || 'e2d06c7b-9503-4fd1-b316-a759d49e526d',
    );

    this.setStatus(201);
    return new TsoaSuccessResponse<string>(aiUrl);
  }

  private handleFile = (request: ExpressRequest): Promise<any> => {
    const multerArray = upload.array('images');
    return new Promise((resolve, reject) => {
      multerArray(request, null as any, async (error) => {
        if (error) {
          reject(error);
        }
        resolve(request.files);
      });
    });
  };
}
