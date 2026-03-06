import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

/**
 * Loader personalizado para cargar las traducciones globales.
 */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private _http = inject(HttpClient);

  /**
   * Carga las traducciones desde archivos JSON.
   * @returns {Promise<Translation>} Un observable con las traducciones.
   */
  getTranslation = (): Promise<Translation> => Promise.resolve({});
}
