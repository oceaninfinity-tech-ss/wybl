import { widget_t } from "./widget";

/**
 * A purposely blank widget to fill space
 */
export class void_t extends widget_t {
    /**
     * Construct a void widget
     */
    constructor() {
        super("nothing", "void");
        this.content.innerText;
        const shadowRoot = this.content.attachShadow({ "mode": "closed" });
        const noDisplayStyling: CSSStyleSheet = new CSSStyleSheet();
        noDisplayStyling.replaceSync(":host{all:initial;display:none;}");
        shadowRoot.adoptedStyleSheets = [noDisplayStyling];
    };
    public configuration(_configuration: Object): void {
        return;
    }
    public render(): HTMLElement {
        return this.content;
    };
};
