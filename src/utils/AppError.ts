import AppErrorCode from "../constants/appErrorCode";
import { HttpStatusCode } from "../constants/statusCode";


class AppError extends Error {
  constructor(
    public statusCode: HttpStatusCode,
    public message: string,
    public errorCode?: AppErrorCode
  ) {
    super(message);
  }
}

export default AppError;
