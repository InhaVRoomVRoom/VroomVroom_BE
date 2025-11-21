import { storyboard } from '@prisma/client';
import { DuplicateUserError, NotFoundError } from '../DTO/errorDTO';
import VroomRepository from '../Repository/vroom.Repository';
import upload from '../Middleware/upload';
import { ResponseFromStoryBoard } from '../DTO/vroomDTO';

class VroomService {
  VroomRepository: VroomRepository;

  constructor() {
    this.VroomRepository = new VroomRepository();
  }

  public static createUserService = async (userName: string) => {
    if (await this.verifyUser(userName)) {
      throw new DuplicateUserError(`${userName}는 이미 존재하는 유저입니다.`);
    }

    await VroomRepository.createUser(userName);
  };

  public static createStoryBoardService = async (
    boardName: string,
    userName: string,
  ): Promise<storyboard> => {
    const userId = await VroomRepository.getUserId(userName);

    if (!userId) {
      throw new NotFoundError(`${userName}는 존재하지 않는 유저입니다.`);
    }

    const newBoard = await VroomRepository.createStoryBoard(boardName, userId);

    return newBoard;
  };

  public static getStoryBoardService = async (
    userName: string,
  ): Promise<ResponseFromStoryBoard> => {
    const userId = await VroomRepository.getUserId(userName);

    if (userId === null) {
      throw new NotFoundError(`${userName}는 존재하지 않는 유저입니다.`);
    }

    const result = await VroomRepository.getStoryBoard(userId);

    return new ResponseFromStoryBoard(result);
  };

  public static uploadImageService = async (
    files: Express.Multer.File[],
    boardId: string,
  ) => {
    if (files.length == 0 || files === null) {
      throw new Error('파일이 없습니다.');
    }

    const image_urls = files.map((file) => {
      return file.path;
    });

    const count: number = await VroomRepository.uploadImage(
      image_urls,
      boardId,
    );

    if (count !== files.length) {
      throw new Error(
        `${files.length - count}개의 파일 업로드에 실패했습니다.`,
      );
    }
  };

  public static getImageUrls = async (boardId: string): Promise<string[]> => {
    const imageUrls: string[] = await VroomRepository.getImageUrls(boardId);

    return imageUrls;
  };

  private static verifyUser = async (userName: string): Promise<boolean> => {
    const name = await VroomRepository.checkUserName(userName);

    if (name) return true;

    return false;
  };
}

export default VroomService;
