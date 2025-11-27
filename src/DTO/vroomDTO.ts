import { StoryBoardToClient } from './vroomInterface';

export class ResponseFromStoryBoard {
  storyboards: {
    board_id: string;
    image_url: { url: string; type: string }[];
  }[];

  constructor(IStoryBoard: StoryBoardToClient[]) {
    this.storyboards = IStoryBoard.map((board) => {
      return {
        board_id: board.board_id,
        image_url: board.images.map((image) => {
          return { url: image.image_url, type: image.image_type };
        }),
      };
    });
  }
}
