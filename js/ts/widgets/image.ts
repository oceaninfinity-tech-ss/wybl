import { loadResource, multimediaResource_t } from "../resources/resource";
import { widget_t } from "./widget";

/**
 * An image widget
 */
export class image_t extends widget_t {
    constructor() {
        super("img", "image");
    };
    /**
     * @internal
     */
    private source!: string;
    public configuration(configuration: Object): void {
        if (!this.configurationHas(configuration, "source")) {
            throw new Error("A image widget requires a source image");
        }
        this.source = (configuration as any).source as string;
    }
    public render(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((resolve, reject) => {
            loadResource(this.source).then((resource: multimediaResource_t) => {
                this.content.onload = () => resolve(this.content);
                this.content.onerror = () => reject(`An image resource of type "${resource.mimeType}" is not supported in this browser`);
                (this.content as HTMLImageElement).src = resource.blobUrl;
            }).catch((error) => reject(error));
        });
    };
};
