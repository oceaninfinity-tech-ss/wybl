/**
 * Asynchronously Load a module
 * @async
 * @param {string} url The location of the module
 * @returns {Promise<void>} Success of the loading of the module
 */
export function loadModule(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const module: HTMLScriptElement = document.createElement("script");
        module.type = "module"
        module.src = url;
        module.async = true;
        module.onload = () => resolve();
        module.onerror = () => reject(`Failed to load module: ${url}`);
        document.head.appendChild(module);
    });
}
