import { loadResource, multimediaResource_t } from "./resource";

/**
 * Collection of modules with associated promises
 * @internal
 */
var modules: { [key: string]: Promise<void> } = {};
/**
 * Total amount of modules successfully loaded
 * @internal
 */
var modulesLoaded: number = 0;

/**
 * Asynchronously load a module
 * @async
 * @param {string} url The location of the module
 * @returns {Promise<void>} Success of the loading of the module
 */
export function loadModule(url: string): Promise<void> {
    if (url in modules) {
        return modules[url];
    }
    let module: Promise<void> = new Promise<void>((resolve, reject) => {
        const failure = (): void => {
            reject(`Failed to load module: ${url}`);
        }
        loadResource(url).then((resource: multimediaResource_t) => {
            const module: HTMLScriptElement = document.createElement("script");
            module.type = "module"
            module.src = resource.blobUrl;
            module.crossOrigin = "anonymous";
            module.async = true;
            module.onload = () => {
                modulesLoaded++;
                resolve();
            };
            module.onerror = () => failure();
            document.head.appendChild(module);
        });
    });
    modules[url] = module;
    return module;
}
/**
 * Checks whether any modules are yet to be successfully loaded
 * @returns {boolean} Whether modules are yet to be successfully loaded
 */
function loadingModules(): boolean {
    return (modulesLoaded != Object.keys(modules).length);
}
/**
 * Wait for all modules to load
 * @returns {Promise<void>} Success of loading all of the modules
 */
export function loadModules(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        const moduleLoadingError = (error: ErrorEvent) => {
            error.preventDefault();
            reject(`Module error: ${error.message}`);
        }
        window.addEventListener("error", moduleLoadingError);
        do {
            await Promise.all((Object as any).values(modules)).catch(error => reject(error));
        } while (loadingModules());
        window.removeEventListener("error", moduleLoadingError);
        resolve();
    });
}
