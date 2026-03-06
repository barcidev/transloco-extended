import { provideTranslocoScope } from '@jsverse/transloco';
import { TranslationScopeConfig } from './transloco.model';

export const provideTranslocoScopeWrapper = (config: TranslationScopeConfig) =>
  provideTranslocoScope({
    alias: config.alias,
    loader: Object.fromEntries(
      Object.entries(config.translations).map(([lang, translation]) => [
        lang,
        () => Promise.resolve(translation),
      ]),
    ),
    scope: config.scope,
  });
