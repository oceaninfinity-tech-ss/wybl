import { structure_t } from "../structure";
import { widget_t } from "./widget";

/**
 * Widgets that are stored children of a layout
 * @internal
 */
type subWidget_t = widget_t;

type tabsPosition_t = ("top" | "right" | "bottom" | "left");

/**
 * A layout widget
 */
export class tabs_t extends widget_t {
    /**
     * @internal
     */
    protected tabs!: { [key: string]: subWidget_t };
    protected position!: tabsPosition_t;
    constructor() {
        super("div", "tabs");
        this.tabs = {};
        this.position = "top";
    };
    public configuration(configuration: Object): void {
        if (!this.configurationHas(configuration, "items") ||
            !Array.isArray((configuration as any).items)) {
            throw new Error("Tabs needs items");
        }
        ((configuration as any).items as Object[]).forEach((item: any) => {
            if (!this.configurationHas(item, "name")) {
                throw new Error("A tab name is expected");
            }
            if (!(typeof item.name === "string" || typeof item.name === "number")) {
                throw new Error("A tab name needs to be either a string or a number");
            }
            const tabName: string = item.name.toString();
            if (tabName in this.tabs) {
                throw new Error(`Another tab exists with the name of "${tabName}" within a tab widget`);
            }
            if (!this.configurationHas(item, "object")) {
                throw new Error(`Tab "${tabName}" has no reference to an object`);
            }
            this.tabs[tabName] = structure_t.widget(item.object);
        });
        if (Object.keys(this.tabs).length == 0) {
            throw new Error("Tabs needs items");
        }
        if (this.configurationHas(configuration, "position")) {
            do {
                if (typeof (configuration as any).position === "string") {
                    const position: tabsPosition_t = (configuration as any).position;
                    switch (position) {
                        case "top":
                            this.position = "top";
                            break;
                        case "right":
                            this.position = "right";
                            break;
                        case "bottom":
                            this.position = "bottom";
                            break;
                        case "left":
                            this.position = "left";
                            break;
                        default:
                            throw new Error(`The defined position "${position}" for a collection of tabs is not allowed`);
                    }
                    break;
                }
                throw new Error(`The position for a collection of tabs must be a string`);
            } while (false);
        }
    }
    public render(): HTMLElement {
        this.content.style.setProperty("--position", this.position);
        const tabButtonContainer: HTMLDivElement = document.createElement("div");
        let tabButtons: HTMLButtonElement[] = [];
        const tabView: HTMLDivElement = document.createElement("div");
        let firstTab: boolean = true;
        Object.keys(this.tabs).forEach((tab: string) => {
            const tabButton: HTMLButtonElement = document.createElement("button");
            tabButton.innerText = tab;
            tabButtons.push(tabButton);
            tabButtonContainer.appendChild(tabButton);
            try {
                const tabObject: HTMLElement = this.tabs[tab].render();
                tabButton.addEventListener("click", () => {
                    if (tabView.firstElementChild != tabObject) {
                        tabView.replaceChildren(tabObject);
                    }
                    tabButtons.forEach((button: HTMLButtonElement) => {
                        if (button != tabButton) {
                            button.removeAttribute("active");
                        }
                    });
                    tabButton.setAttribute("active", "");
                });
                if (firstTab) {
                    tabButton.click();
                    firstTab = false;
                }
            } catch (error) {
                if (error instanceof RangeError) {
                    throw new Error("Failed to render tabs (it is possible that a child item may be recursive)");
                }
                throw error;
            }
        });
        this.content.appendChild(tabButtonContainer);
        this.content.appendChild(tabView);
        return this.content;
    };
};
