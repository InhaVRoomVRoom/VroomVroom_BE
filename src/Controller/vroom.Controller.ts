import { Controller, Tags, Get, Route, SuccessResponse } from 'tsoa';

@Tags('Vroom User')
@Route('/api/user')
export class VroomController extends Controller {
  @Get('/test')
  @SuccessResponse('200', 'Success')
  public async test(): Promise<{ message: string }> {
    this.setStatus(200); // 명시적으로 상태 코드 설정
    return { message: 'Hello World!' };
  }
}
