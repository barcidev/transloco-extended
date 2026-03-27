import { Translation } from '@jsverse/transloco';

export type AppLanguageCode = 'en-US' | 'es-CO';

export type ConfigTranslation<T> = Record<string, T>;

export type TranslationKeys<T> = PathKeys<T> | (string & {});
export type TranslationPagesKeys<T, K extends keyof T> = PathKeys<T[K]> | (string & {});

export interface TranslationScopeConfig<T = Translation, U = string> {
  alias?: string;
  keys: NestedKeys<T>;
  scope: U;
  translations: ConfigTranslation<T>;
}

export type PathKeys<T> = T extends object
  ? {
      [K in keyof T]: K extends number | string
        ?
            | `${K}`
            | (PathKeys<T[K]> extends infer P
                ? P extends number | string
                  ? `${K}.${P}`
                  : never
                : never)
        : never;
    }[keyof T]
  : never;

export type NestedKeys<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends string
    ? `${Prefix}${K & string}`
    : NestedKeys<T[K], `${Prefix}${K & string}.`>;
};

export type Transalations<T> = Record<AppLanguageCode, T extends object ? T : never>;
