import { Translation } from '@jsverse/transloco';

export type AppLanguageCode = 'en-US' | 'es-CO';

export type ConfigTranslation<T> = Record<string, T>;

export type TranslationKeys<T> = PathKeys<T> | (string & {});
export type TranslationPagesKeys<T, K extends keyof T> = PathKeys<T[K]> | (string & {});

export interface TranslationScopeConfig<T = Translation, U = string> {
  alias?: string;
  scope: U;
  translations: ConfigTranslation<T>;
}

type PathKeys<T> = T extends object
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
