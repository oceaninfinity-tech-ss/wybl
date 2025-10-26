import { structure_t } from "./structure"
import { container_t } from "./widgets/container"
import { layout_t } from "./widgets/layout";
import { tabs_t } from "./widgets/tabs";
import { text_t } from "./widgets/text";
import { void_t } from "./widgets/void";
import { widget_t } from "./widgets/widget";

/**
 * Register the core widgets
 * @internal
 */
export function registerCoreWidgets(): void {
    structure_t.declareWidget("null", (): widget_t => { return new void_t() });
    structure_t.declareWidget("layout", (): widget_t => { return new layout_t() });
    structure_t.declareWidget("container", (): widget_t => { return new container_t() });
    structure_t.declareWidget("tabs", (): widget_t => { return new tabs_t() });
    structure_t.declareWidget("text", (): widget_t => { return new text_t() });
}
