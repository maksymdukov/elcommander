export type ExtractArray<T> = T extends Array<infer S> ? S : never;

export type ExtractPromiseArray<Input> = Input extends Promise<infer T>
  ? ExtractArray<T>
  : never;
