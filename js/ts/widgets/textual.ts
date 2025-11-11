import { widget_t } from "./widget";

type textualAlignment_t = ("left" | "right" | "center" | "justify");

/**
 * A textual widget used to show text
 */
export abstract class textual_t extends widget_t {
    public setConfiguration(configuration: Object, textualAlignmentDefault: textualAlignment_t): void {
        if (!this.configurationHas(configuration, "text")) {
            throw new Error(`A ${this.content.className} widget requires \`text\` to be shown`);
        }
        let shadowStyling: string = "text-align:";
        this.content.innerText = (configuration as any).text as string;
        if (this.configurationHas(configuration, "align")) {
            const textualAlignment: textualAlignment_t = (configuration as any).align;
            switch (textualAlignment) {
                case "left":
                case "right":
                case "center":
                case "justify":
                    shadowStyling += textualAlignment;
                    break;
                default:
                    throw new Error(`"${textualAlignment}" is not a valid alignment for a ${this.content.className} widget`);
            }
        } else {
            shadowStyling += textualAlignmentDefault;
        }
        shadowStyling += "!important;";
        if (this.configurationHas(configuration, "color")) {
            /**
             * Valid whether a color is valid
             * @param {string} color String to validate
             * @returns {boolean} Whether the color is valid
             */
            const isColor = (color: string): Boolean => {
                const style: CSSStyleDeclaration = new Option().style;
                style.color = color;
                return style.color !== "";
            }
            const color: string = (configuration as any).color;
            if (!isColor(color)) {
                throw new Error(`"${color}" is not a valid color for a ${this.content.className} widget`);
            }
            shadowStyling += `color:${color}!important;`;
        }
        this.content.innerText = (configuration as any).text as string;
        const textualShadowRoot: ShadowRoot = this.content.attachShadow({ mode: "closed" });
        const noInheritedStyling: CSSStyleSheet = new CSSStyleSheet();
        noInheritedStyling.replaceSync(`:host{${shadowStyling}}`);
        textualShadowRoot.adoptedStyleSheets = [noInheritedStyling];
        const slot = document.createElement("slot");
        textualShadowRoot.appendChild(slot);

    }
    public render(): Promise<HTMLElement> {
        return new Promise<HTMLElement>((resolve, _reject) => {
            resolve(this.content);
        });
    };
};
