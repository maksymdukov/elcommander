import { CustomErrorCtor, registerErrorCtor } from '../errors';

export const Serializable = (ctor: CustomErrorCtor) => {
  registerErrorCtor(ctor);
};
