// t is an instance of i18n.t
// nested is where in the translations the instance should be set
// key is the key that is wanted from the nested point
// initialize setting nestedTranslate(t, nested) to a variable and call that variable as a funciton
// with the key that you want to use
export const nestedTranslate = (t, nested) => (key, ...rest) =>
  t(`${nested}.${key}`, ...rest);

export const namespaceTranslate = (t, nameSpace) => (key, ...rest) =>
  t(`${nameSpace}:${key}`, ...rest);
