import { CustomError } from '../custom-error';
import { PLUGIN_ERROR_CODES } from './codes';
import { Serializable } from '../decorators/serializable';

@Serializable
export class UserCancelError extends CustomError {
  code = PLUGIN_ERROR_CODES.USER_CANCEL;

  message = 'User cancelled action';
}
