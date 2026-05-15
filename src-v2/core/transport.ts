export type Transport = {
  get(path: string): Promise<unknown>;
};
