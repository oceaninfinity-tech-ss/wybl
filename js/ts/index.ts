// @ts-expect-error
import splashStyling from "./splash.scss";

import { gui_t } from "./gui";
import { structure_t } from "./structure";
import { widget_t } from "./widgets/widget";
import { loadStylesheet } from "./resources/stylesheet";
import { registerCoreWidgets } from "./widgets";

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
    registerCoreWidgets();
    return new Promise<void>(async (resolve, reject) => {
        // Load GUI
        let gui_data: (gui_t | null) = null;
        try {
            gui_data = new gui_t();
        } catch (error: any) {
            setError(error as string);
            reject();
        }
        // Load layouts
        await Promise.all([structure_t.generate(gui_data!.structure), loadStylesheet(gui_data!.stylesheet)]).then((main: (void | widget_t)[]) => {
            if (main[0] instanceof widget_t) {
                splashStatus.innerText = "Rending layout...";
                main[0].render().then((mainElement: HTMLElement) => {
                    while (document.body.children.length > 0) {
                        document.body.removeChild(document.body.children[0]);
                    }
                    document.documentElement.replaceChild(document.createElement("body"), splashContainer);
                    document.body.appendChild(mainElement);
                    document.title = gui_data!.name.trim() + " | SSS";
                    resolve();

                }).catch((error) => {
                    setError(error);
                    reject();
                });
            }
        }).catch((error) => {
            setError(error);
            reject();
        });
    });
}

main().catch(() => { });
