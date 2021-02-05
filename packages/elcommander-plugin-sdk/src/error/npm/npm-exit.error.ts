import { CustomError } from '../custom-error';

export class NpmExitError extends CustomError {
  message: string;

  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.message = message;
    this.code = code;
  }
}
