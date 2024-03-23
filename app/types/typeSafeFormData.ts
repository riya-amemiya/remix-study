export type TypeSafeFormData<FormSchema> = FormData & {
  get: <K extends keyof FormSchema>(name: K) => FormSchema[K] | undefined;
  getAll: <K extends keyof FormSchema>(name: K) => FormSchema[K] | undefined;
  has: <K extends keyof FormSchema>(name: K) => boolean;
  entries: () => IterableIterator<
    [keyof FormSchema, FormSchema[keyof FormSchema]]
  >;
  keys: () => IterableIterator<keyof FormSchema>;
  values: () => IterableIterator<FormSchema[keyof FormSchema]>;
};
