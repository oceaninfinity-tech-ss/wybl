/**
 * Interface for the multimedia resource
 */
export interface multimediaResource_t {
    /**
     * The URL to access the resource at
     */
    blobUrl: string;
    /**
     * The MIME type of the resource
     */
    mimeType: string;
}

/**
 * Collection of resources with associated promises
 * @internal
 */
var resources: { [key: string]: Promise<multimediaResource_t> } = {};

/**
 * Asynchronously load a resource
 * @async
 * @param {string} url The location of the resource
 * @returns {Promise<multimediaResource_t>} The loaded resource
 */
export function loadResource(url: string): Promise<multimediaResource_t> {
    if (url in resources) {
        return resources[url];
    }
    let blob: Promise<multimediaResource_t> = new Promise<multimediaResource_t>((resolve, reject) => {
        const failure = (): void => {
            reject(`Failed to load multimedia resource: ${url}`);
        }
        fetch(url).then(async (response) => {
            if (!response.ok) {
                failure();
            }
            const blob: Blob = await response.blob();
            const resource: multimediaResource_t = {
                blobUrl: URL.createObjectURL(blob),
                mimeType: blob.type
            }
            window.addEventListener("unload", () => {
                URL.revokeObjectURL(resource.blobUrl);
            });
            resolve(resource);
        }).catch(() => failure());
    });
    resources[url] = blob;
    return blob;
}
