import { PipeTransform } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslationKeys } from '../types/transloco.model';

/**
 * Pipe personalizada que extiende TranslocoPipe para proporcionar tipado a las claves de traducción.
 */
export class TypedTranslocoPipe<T> extends TranslocoPipe implements PipeTransform {
  /**
   * Sobrescribimos el método transform.
   * Al tipar 'key' como 'TranslationKeys', el compilador de Angular
   * @param {TranslationKeys<T>} key - La clave de traducción a resolver, tipada para seguridad.
   * @param {Record<string, unknown>} params - Parámetros para interpolación (opcional)
   * @returns {string} - La traducción resultante o la clave si no se encuentra.
   */
  override transform(
    key: null | (string & {}) | TranslationKeys<T> | undefined,
    params?: Record<string, unknown>,
  ): string {
    return super.transform(key as string, params);
  }
}
