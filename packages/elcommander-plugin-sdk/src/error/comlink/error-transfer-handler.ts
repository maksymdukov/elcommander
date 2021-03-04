import * as Comlink from 'comlink';
import { getErrorCtor } from '../errors';

// eslint-disable-next-line @typescript-eslint/ban-types
const isObject = (val: unknown): val is object =>
  (typeof val === 'object' && val !== null) || typeof val === 'function';

interface ThrownValue {
  value: Error;
}

interface SerializedError {
  ctorName: string;
  message: string;
  name: string;
  stack: string;
  code: string;
}

Comlink.transferHandlers.set('throw', {
  canHandle: (value): value is ThrownValue =>
    // @ts-ignore
    isObject(value) && 'value' in value && value.value instanceof Error,
  serialize({ value }) {
    const serialized = {
      ctorName: value.constructor.name,
      message: value.message,
      name: value.name,
      stack: value.stack,
      code: value.code,
    };
    console.log('my serialized', serialized);
    return [serialized, []];
  },
  deserialize(serialized: SerializedError) {
    console.log('serialized.ctorName', serialized.ctorName);
    const Ctor = getErrorCtor(serialized.ctorName) || Error;
    throw Object.assign(new Ctor(serialized.message), serialized);
  },
});
