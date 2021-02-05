import { CustomError } from '../custom-error';
import { PLUGIN_ERROR_CODES } from './codes';

export class UserCancelError extends CustomError {
  code = PLUGIN_ERROR_CODES.USER_CANCEL;

  message = 'User cancelled action';
}
