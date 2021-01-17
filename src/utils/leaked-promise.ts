export const createPromise = <S = void, F = void>() => {
  let resolve: (value: S) => void;
  let reject: (value: F) => void;
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
