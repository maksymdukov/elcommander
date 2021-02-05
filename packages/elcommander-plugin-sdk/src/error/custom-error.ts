export abstract class CustomError extends Error {
  abstract code: string;

  abstract message: string;
}
