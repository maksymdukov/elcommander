export const createPromise = <S = void, E = void>() => {
  let resolve: (value: S) => void;
  let reject: (value: E) => void;
  // eslint-disable-next-line promise/param-names
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise: promise as Promise<S>,
    resolve: resolve!,
    reject: reject!,
  };
};
