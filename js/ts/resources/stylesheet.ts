/**
 * Asynchronously Load a stylesheet
 * @async
 * @param {string} url The location of the stylesheet
 * @returns {Promise<void>} Success of the loading of the stylesheet
 */
export function loadStylesheet(url: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const stylesheet: HTMLLinkElement = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.type = "text/css";
        stylesheet.href = url;
        stylesheet.onload = () => resolve();
        stylesheet.onerror = () => reject(`Failed to load stylesheet: ${url}`);
        document.head.appendChild(stylesheet);
    });
}