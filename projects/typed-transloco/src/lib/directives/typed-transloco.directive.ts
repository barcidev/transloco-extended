/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Directive, Input, TemplateRef, Type } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { AppTranslations, TranslationKeys } from '../types/transloco.model';

export interface TypedViewContext<T> {
  $implicit: (key: TranslationKeys<T>, params?: Record<string, any>) => any;
  currentLang: string;
}

/**
 * Directiva personalizada que extiende la funcionalidad de TranslocoDirective para proporcionar tipado en las claves de traducción.
 * Permite usar claves de traducción tipadas en las plantillas Angular, mejorando la experiencia de desarrollo y reduciendo errores.
 */
@Directive({
  selector: '[typedTransloco]',
  standalone: true,
})
// @ts-ignore Se deshabilita el chequeo de tipos para esta clase ya que es un poco compleja la implementación
export class TypedTranslocoDirective<T extends keyof AppTranslations = keyof AppTranslations> extends TranslocoDirective {
  @Input('typedTranslocoLang') declare inlineLang: string | undefined;

  @Input('typedTranslocoRead') declare inlineRead: string | undefined;

  @Input('typedTranslocoScope') declare inlineScope: string | undefined;

  @Input('typedTranslocoLoadingTpl') declare inlineTpl:
    | string
    | TemplateRef<unknown>
    | Type<unknown>
    | undefined;

  @Input('typedTranslocoTransloco') declare key: string | undefined;

  @Input('typedTranslocoParams') override params: Record<string, any> = {};

  @Input({
    alias: 'typedTranslocoPrefix',
    required: true
  })
  declare prefix: T;

  static override ngTemplateContextGuard<T extends keyof AppTranslations>(
    dir: TypedTranslocoDirective<T>,
    ctx: any,
  ): ctx is TypedViewContext<T extends keyof AppTranslations ? AppTranslations[T] : AppTranslations> {
    return true;
  }
}
