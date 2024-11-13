export const override = <T,>(origin: T, overload: Partial<T>) =>
  Object.assign(
    Object.assign(
      Object.create(Object.getPrototypeOf(origin)),
      origin
    ),
    overload
  )
