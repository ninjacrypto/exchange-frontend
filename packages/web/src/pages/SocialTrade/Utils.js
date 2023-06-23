import { map, camelCase } from 'lodash';

export const createOptions = (enumeration, t, translateGroup) => map(enumeration, (v, k) => {
    var translateKey = camelCase(v);
    return {
        value: k,
        label: t(translateGroup ? `${translateGroup}.${translateKey}` : translateKey)
    };
});

export const createCryptoPairOptions = (pairs) => map(pairs, (v) => {
    return {
        value: `${v.baseCurrency}/${v.quoteCurrency}`,
        label: `${v.baseCurrency}/${v.quoteCurrency}`,
        tag: v
    };
});

export const composePropertyName = (name, propertyGroup) => propertyGroup ? `${propertyGroup}.${name}` : name;