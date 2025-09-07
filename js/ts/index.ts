// @ts-expect-error
import splashStyling from "./splash.scss";

import { gui_t } from "./gui";
import { structure_t } from "./structure";
import { container_t } from "./widgets/container";
import { layout_t } from "./widgets/layout";
import { text_t } from "./widgets/text";
import { tabs_t } from "./widgets/tabs";
import { void_t } from "./widgets/void";
import { widget_t } from "./widgets/widget";
import { loadStylesheet } from "./resources/stylesheet";

/**
 * @internal
 */
function main(): Promise<void> {
    // Splash screen
    const splashContainer: HTMLBodyElement = document.createElement("body");
    const splashShadowRoot: ShadowRoot = splashContainer.attachShadow({ "mode": "closed" });
    const noInheritedStyling: CSSStyleSheet = new CSSStyleSheet();
    noInheritedStyling.replaceSync("*{all:initial;display:block;}" + splashStyling);
    splashShadowRoot.adoptedStyleSheets = [noInheritedStyling];
    const splashContent: HTMLDivElement = document.createElement("div");
    const splashHeading: HTMLHeadingElement = document.createElement("h1");
    splashHeading.innerText = "SSS";
    const splashStatus: HTMLParagraphElement = document.createElement("p");
    splashStatus.innerText = "Loading layout...";
    const setError = (error: string): void => {
        splashStatus.innerText = error;
        document.title = "Error | SSS";
    };
    splashContent.appendChild(splashHeading);
    splashContent.appendChild(splashStatus);
    splashShadowRoot.appendChild(splashContent);
    document.body = splashContainer;
    return new Promise<void>(async (resolve, reject) => {
        // Load GUI
        let gui_data: (gui_t | null) = null;
        try {
            gui_data = new gui_t();
        } catch (error: any) {
            setError(error as string);
            reject();
        }
        // Configure widgets
        structure_t.declareWidget("null", (): widget_t => { return new void_t() });
        structure_t.declareWidget("layout", (): widget_t => { return new layout_t() });
        structure_t.declareWidget("container", (): widget_t => { return new container_t() });
        structure_t.declareWidget("tabs", (): widget_t => { return new tabs_t() });
        structure_t.declareWidget("text", (): widget_t => { return new text_t() });
        // Load layouts
        await Promise.all([structure_t.generate(gui_data!.structure), loadStylesheet(gui_data!.stylesheet)]).then((main: (void | widget_t)[]) => {
            if (main[0] instanceof widget_t) {
                const mainElement: HTMLElement = main[0].render();
                while (document.body.children.length > 0) {
                    document.body.removeChild(document.body.children[0]);
                }
                document.documentElement.replaceChild(document.createElement("body"), splashContainer);
                document.body.appendChild(mainElement);
                document.title = gui_data!.name.trim() + " | SSS";
                resolve();
            }
        }).catch((error) => {
            setError(error);
            reject();
        });
    });
}

main().catch(() => { });
