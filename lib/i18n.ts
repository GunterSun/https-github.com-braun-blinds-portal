export const SUPPORTED_LOCALES=["en","zh-CN"] as const;
export type Locale=(typeof SUPPORTED_LOCALES)[number];
export function isLocale(value:unknown):value is Locale{return typeof value==="string"&&SUPPORTED_LOCALES.includes(value as Locale)}
export function translate<T extends Record<string,unknown>>(resource:T,key:string):string{let value:unknown=resource;for(const part of key.split("."))value=typeof value==="object"&&value!==null?(value as Record<string,unknown>)[part]:undefined;if(typeof value!=="string")throw new Error(`Missing translation key: ${key}`);return value}
export function localeTag(locale:Locale){return locale==="zh-CN"?"zh-CN":"en-US"}
