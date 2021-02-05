import { UserCancelError } from '../error/fs-plugin';

export const runCancelableGenerator = async (
  generator: () => Generator<any>,
  cancel: Promise<void>
) => {
  let isCancelled = false;
  cancel
    // eslint-disable-next-line promise/always-return
    .then(() => {
      isCancelled = true;
    })
    .catch(console.log);

  const gen = generator();
  let resolved: any;
  let done: boolean | undefined = false;
  while (!done) {
    if (isCancelled) {
      throw new UserCancelError();
    }
    const result = gen.next(resolved);
    done = result.done;
    resolved = await result.value;
  }
  return resolved;
};
