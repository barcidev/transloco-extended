import { NestedKeys, Transalations, TranslationScopeConfig } from '../types/transloco.model';

export class TranslocoUtils {
  static createKeys<T extends object>(obj: T, prefix = ''): NestedKeys<T> {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        return [
          key,
          typeof value === 'object' ? TranslocoUtils.createKeys(value, fullKey) : fullKey,
        ];
      }),
    ) as NestedKeys<T>;
  }

  static createScopeConfig<T extends object, U extends string>(
    scope: U,
    translations: Transalations<T>,
  ): TranslationScopeConfig<T, U> {
    return {
      keys: this.createKeys(translations['en-US']),
      scope,
      translations,
    };
  }
}
