// import * as Comlink from 'comlink';

// Comlink.transferHandlers.set('CUSTOM_ERROR', {
//   canHandle(value: unknown): value is Error {
//     return value instanceof Error;
//   },
//   serialize(error: FsPluginError): [any, Transferable[]] {
//     return [
//       {
//         stack: error.stack,
//         message: error.message,
//         code: error.code,
//       },
//       [],
//     ];
//   },
//   deserialize(value: any): FsPluginError {
//     return new FsPluginError();
//   },
// });
