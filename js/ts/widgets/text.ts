import { widget_t } from "./widget";

/**
 * A textual widget used to show text
 */
export class text_t extends widget_t {
    /**
     * Construct a text widget
     */
    constructor() {
        super("text", "text");
    };
    public configuration(configuration: Object): void {
        if (!this.configurationHas(configuration, "text")) {
            throw new Error("A text widget requires text to be shown");
        }
        this.content.innerText = (configuration as any).text as string;
    }
    public render(): HTMLElement {
        return this.content;
    };
};
