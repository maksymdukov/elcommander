export interface CustomErrorCtor {
  new (...args: any[]): Error;
}

interface ErrorConstructors {
  [k: string]: CustomErrorCtor;
}

const errorConstructors: ErrorConstructors = {
  Error,
};

export const registerErrorCtor = (ctor: CustomErrorCtor) => {
  if (errorConstructors[ctor.name]) {
    throw new Error('Custom error name must be unique');
  }
  errorConstructors[ctor.name] = ctor;
};

export const getErrorCtor = (name: string) => errorConstructors[name];
