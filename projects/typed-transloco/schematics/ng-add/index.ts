import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addRootProvider } from '@schematics/angular/utility';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { applyEdits, ModificationOptions, modify, parse } from 'jsonc-parser';
import { AddSchemaOptions } from './scheme';

export function ngAdd(options: AddSchemaOptions): Rule {
  return async (tree: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(tree);
    if (!options.project) {
      options.project =
        (workspace.extensions.defaultProject as string) || Array.from(workspace.projects.keys())[0];
    }

    const project = workspace.projects.get(options.project);

    if (!project) {
      _context.logger.error(`❌ El proyecto "${options.project}" no existe en el workspace.`);
      return;
    }

    const projectRoot = project.sourceRoot || 'src';

    return chain([
      setupGlobalConfig(options.project, projectRoot),
      createI18nFiles(projectRoot),
      updateTsConfigRule(projectRoot),
    ]);
  };
}

// --- 1. CONFIGURACIÓN DEL PROVIDER ---
function setupGlobalConfig(project: string, root: string): Rule {
  return (tree: Tree) => {
    const appConfigPath = `${root}/app/app.config.ts`;
    if (!tree.exists(appConfigPath)) return tree;

    const content = tree.read(appConfigPath)!.toString();
    if (content.includes('provideTransloco')) return tree;

    return addRootProvider(
      project,
      ({ code, external }) => code`
      ${external('provideTransloco', '@jsverse/transloco')}({
        config: {
          availableLangs: ['en-US', 'es-CO'],
          defaultLang: 'en-US',
          prodMode: !${external('isDevMode', '@angular/core')}(),
          reRenderOnLangChange: true
        },
        loader: ${external('TranslocoHttpLoader', '@barcidev/typed-transloco')}
      })
    `,
    );
  };
}

// --- 2. CREACIÓN DE ARCHIVOS (MODO STANDALONE) ---
function createI18nFiles(root: string): Rule {
  return (tree: Tree) => {
    const i18nPath = `${root}/app/i18n`;

    const files = [
      {
        path: `${i18nPath}/app-typed-transloco.directive.ts`,
        content: `import { Directive } from '@angular/core';
import { TypedTranslocoDirective, TypedViewContext } from '@barcidev/typed-transloco';
import { AppI18nType } from './app.i18n';

@Directive({
  selector: '[typedTransloco]',
  standalone: true,
})
export class AppTypedTranslocoDirective<
  T extends keyof AppI18nType = keyof AppI18nType,
> extends TypedTranslocoDirective<T> {
  static override ngTemplateContextGuard<T extends keyof AppI18nType>(
    dir: TypedTranslocoDirective<T>,
    ctx: any,
  ): ctx is TypedViewContext<T extends keyof AppI18nType ? AppI18nType[T] : AppI18nType> {
    return true;
  }
}`,
      },
      {
        path: `${i18nPath}/app-typed-transloco.pipe.ts`,
        content: `import { Pipe } from '@angular/core';
import { TypedTranslocoPipe } from '@barcidev/typed-transloco';
import { AppI18nType } from './app.i18n';

@Pipe({
  name: 'typedTransloco',
  standalone: true,
  pure: false,
})
export class AppTypedTranslocoPipe extends TypedTranslocoPipe<AppI18nType> {}`,
      },
      {
        path: `${i18nPath}/app.i18n.ts`,
        content: `export const appI18n = {};
export type AppI18nType = typeof appI18n;
export type AppLanguageCode = 'en-US' | 'es-CO';`,
      },
    ];

    files.forEach((f) => {
      if (!tree.exists(f.path)) {
        tree.create(f.path, f.content);
      } else {
        tree.overwrite(f.path, f.content);
      }
    });
  };
}

// --- 3. ACTUALIZACIÓN SEGURA DE TSCONFIG ---
function updateTsConfigRule(root: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const tsConfigPath = tree.exists('/tsconfig.app.json')
      ? '/tsconfig.app.json'
      : '/tsconfig.json';

    const buffer = tree.read(tsConfigPath);
    if (!buffer) return;

    let content = buffer.toString();
    const modificationOptions: ModificationOptions = {
      formattingOptions: { insertSpaces: true, tabSize: 2 },
    };

    // 1. Asegurar que baseUrl existe (Si no existe, lo creamos primero)
    const tsconfig = parse(content);
    if (!tsconfig.compilerOptions?.baseUrl) {
      const baseUrlEdits = modify(
        content,
        ['compilerOptions', 'baseUrl'],
        './',
        modificationOptions,
      );
      content = applyEdits(content, baseUrlEdits); // <--- Aplicamos inmediatamente al string
    }

    // 2. Recalcular la lógica de i18nPath basada en el contenido actualizado
    const updatedTsconfig = parse(content);
    const baseUrl = updatedTsconfig.compilerOptions?.baseUrl || './';
    let i18nPath = `${root}/app/i18n/*`;

    if (baseUrl !== './' && baseUrl !== '.') {
      const normalizedBase = baseUrl.replace(/^\.\/|\/$/g, '');
      if (i18nPath.startsWith(normalizedBase)) {
        i18nPath = i18nPath.replace(normalizedBase, '').replace(/^\//, '');
      }
    }

    // 3. Modificar los Paths
    const alias = '@i18n/*';
    const pathEdits = modify(
      content,
      ['compilerOptions', 'paths', alias],
      [i18nPath],
      modificationOptions,
    );

    // 4. Aplicar los cambios finales y guardar
    const finalContent = applyEdits(content, pathEdits);
    tree.overwrite(tsConfigPath, finalContent);

    context.logger.info(`✅ Alias @i18n configurado en ${tsConfigPath}`);
  };
}
