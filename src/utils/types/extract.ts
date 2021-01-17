export type ExtractPromiseArray<Input> = Input extends Promise<infer T>
  ? T extends Array<infer S>
    ? S
    : never
  : never;
