import prisma from '../config/prisma.config';
import { Prisma, storyboard } from '@prisma/client';
import { UnknownPrismaError } from '../DTO/errorDTO';
import e from 'express';

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

  public static uploadImage = async (
    fileNames: string[],
    boardId: string,
  ): Promise<number> => {
    const result = await prisma
      .$transaction(async (tx) => {
        const count = await prisma.images
          .createMany({
            data: fileNames.map((fileName) => {
              return {
                image_url: fileName,
                board_id: boardId,
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
}

export default VroomRepository;
