import { widget_t } from "./widget";

/**
 * A textual widget used to show text
 */
export class text_t extends widget_t {
    /**
     * Construct a text widget
     */
    constructor() {
        super("span", "text");
    };
    public configuration(configuration: Object): void {
        if (!this.configurationHas(configuration, "text")) {
            throw new Error("A text widget requires text to be shown");
        }
        this.content.innerText = (configuration as any).text as string;
    }
    public render(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((resolve, _reject) => {
            resolve(this.content);
        });
    };
};
