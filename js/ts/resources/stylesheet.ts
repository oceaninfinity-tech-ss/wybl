import { loadResource, multimediaResource_t } from "./resource";

/**
 * Asynchronously load a stylesheet
 * @async
 * @param {string} url The location of the stylesheet
 * @returns {Promise<void>} Success of the loading of the stylesheet
 */
export function loadStylesheet(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const failure = (): void => {
            reject(`Failed to load stylesheet: ${url}`);
        }
        loadResource(url).then((resource: multimediaResource_t) => {
            const stylesheet: HTMLLinkElement = document.createElement("link");
            stylesheet.rel = "stylesheet";
            stylesheet.type = resource.mimeType;
            stylesheet.href = resource.blobUrl;
            stylesheet.onload = () => resolve();
            stylesheet.onerror = () => failure();
            document.head.appendChild(stylesheet);
        }).catch(() => failure());
    });
}
