import { loadStylesheet } from "./resources/stylesheet";
import { structure_t, widgetIdentifier_t } from "./structure";
import { widget_t } from "./widgets/widget";

export { loadStylesheet };

/**
 * Declare a widget type that applies to a factory that can be created from a structure
 * @param {string} type The widget type to construct
 * @param {function(): widget_t} widget Widget factory function to create a widget of `type`
 */
export function structureDeclareWidget(type: string, widget: () => widget_t): void {
    structure_t.declareWidget(type, widget);
}
/**
 * Get a widget
 * @param {widgetIdentifier_t} identifier Reference to a widget
 * @returns {widget_t} Widget
 */
export function structureWidget(identifier: widgetIdentifier_t): widget_t {
    return structure_t.widget(identifier);
}
/**
 * Check whether a widget exists
 * @param {widgetIdentifier_t} identifier Reference to a widget
 * @returns {boolean} Whether a widget exist
 */
export function structureWidgetExists(identifier: widgetIdentifier_t): boolean {
    return structure_t.widgetExists(identifier);
}
/**
 * Exports functions to window
 * @internal
 */
export function exportToWindow(): void {
    /* webpack preserve */
    (window as any).structureDeclareWidget = structureDeclareWidget;
    /* webpack preserve */
    (window as any).structureWidget = structureWidget;
    /* webpack preserve */
    (window as any).structureWidgetExists = structureWidgetExists;
    /* webpack preserve */
    (window as any).widget_t = widget_t;
    /* webpack preserve */
    (window as any).loadStylesheet = loadStylesheet;
};