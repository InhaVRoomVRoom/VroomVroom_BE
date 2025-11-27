import prisma from '../config/prisma.config';
import { images_image_type, Prisma, storyboard } from '@prisma/client';
import { UnknownPrismaError } from '../DTO/errorDTO';
import e from 'express';
import { StoryBoardToClient } from '../DTO/vroomInterface';

class VroomRepository {
  public static checkUserName = async (userName: string): Promise<number> => {
    const userCount = await prisma.user.count({
      where: {
        user_name: userName,
      },
    });

    return userCount;
  };

  public static getUserId = async (
    userName: string,
  ): Promise<string | null> => {
    const userId = await prisma.user
      .findUnique({
        where: {
          user_name: userName,
        },
        select: {
          user_id: true,
        },
      })
      .catch((err) => {
        throw new UnknownPrismaError(err.message);
      });

    if (!userId) {
      return null;
    }

    return userId.user_id;
  };

  public static createUser = async (userName: string): Promise<void> => {
    await prisma.user
      .create({
        data: {
          user_name: userName,
        },
      })
      .catch((err) => {
        throw new UnknownPrismaError(err.message);
      });
  };

  public static createStoryBoard = async (
    boardName: string,
    userId: string,
  ): Promise<storyboard> => {
    const newBoard = await prisma.storyboard
      .create({
        data: {
          board_name: boardName,
          user_id: userId,
        },
      })
      .catch((err) => {
        throw new UnknownPrismaError(err.message);
      });

    return newBoard;
  };

  public static getStoryBoard = async (
    userId: string,
  ): Promise<StoryBoardToClient[]> => {
    const storyboard = await prisma.storyboard.findMany({
      where: {
        user_id: userId,
      },
      select: {
        board_id: true,
        images: {
          select: {
            image_url: true,
            image_type: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return storyboard;
  };

  public static uploadImage = async (
    fileNames: string[],
    boardId: string,
    imageType: images_image_type,
  ): Promise<number> => {
    const result = await prisma
      .$transaction(async (tx) => {
        const count = await prisma.images
          .createMany({
            data: fileNames.map((fileName) => {
              return {
                image_url: fileName,
                board_id: boardId,
                image_type: imageType,
              };
            }),
          })
          .catch((err) => {
            throw new UnknownPrismaError(err.message);
          });

        return count.count;
      })
      .catch((err) => {
        throw new UnknownPrismaError(err.message);
      });

    return result;
  };

  public static getImageUrls = async (boardId: string): Promise<string[]> => {
    const imageUrls = await prisma.images
      .findMany({
        where: {
          board_id: boardId,
        },
        select: {
          image_url: true,
        },
      })
      .catch((err) => {
        throw new UnknownPrismaError(err.message);
      });

    return imageUrls.map((url) => {
      return url.image_url;
    });
  };
}

export default VroomRepository;
