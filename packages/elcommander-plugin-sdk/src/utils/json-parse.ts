export const parseJSON = <T>(guard: (o: any) => o is T) => (str: string): T => {
  const parsed = JSON.parse(str);
  if (guard(parsed)) {
    return parsed;
  }
  throw new Error('Error parsing JSON');
};
