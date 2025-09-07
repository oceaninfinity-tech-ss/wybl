import { structure_t } from "../structure";
import { widget_t } from "./widget";

/**
 * A container widget
 */
export class container_t extends widget_t {
    /**
     * @internal
     */
    protected object!: widget_t;
    /**
     * @internal
     */
    protected title!: string;
    constructor() {
        super("fieldset", "container");
    };
    public configuration(configuration: Object): void {
        if (this.configurationHas(configuration, "title")) {
            if ((typeof (configuration as any).title === "string" || typeof (configuration as any).title === "number")) {
                this.title = (configuration as any).title.toString();
            } else {
                throw new Error("A container needs a title to be either a string or a number");
            }
        } else {
            throw new Error("A container needs a title");
        }
        if (this.configurationHas(configuration, "object")) {
            this.object = structure_t.widget((configuration as any).object);
        } else {
            throw new Error("A container has no reference to an object");
        }
    }
    public render(): HTMLElement {
        const legend: HTMLLegendElement = document.createElement("legend");
        legend.textContent = this.title;
        this.content.appendChild(legend);
        this.content.appendChild(this.object.render());
        return this.content;
    }
};
