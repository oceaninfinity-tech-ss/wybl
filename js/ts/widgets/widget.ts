let baseTypes: { [key: string]: string } = {};

/**
 * Define a base widget type to be used by widgets
 * @param {string} baseTypeName The name of a base type
 * @param {string} baseType The base HTML element type
 */
export function widgetDefineBaseType(baseTypeName: string, baseType: string): void {
    if (!(baseTypeName in baseTypes)) {
        baseTypes[baseTypeName] = baseType;
    } else {
        throw new Error(`A base widget type was not defined as it conflicts with another base type of "${baseTypeName}"`);
    }
}

/**
 * @abstract Base widget class
 */
export abstract class widget_t {
    /**
     * Main HTMLElement of the widget
     */
    protected content!: HTMLElement;
    /**
     * Construct a base widget
     * @param {string} baseType The base type to construct the widget from
     * @param {string} type The type of the widget
     */
    constructor(baseType: string, type: string) {
        if (!(baseType in baseTypes)) {
            throw new Error(`Unknown widget base type: ${baseType}`);
        }
        if (type.trim().length == 0) {
            throw new Error("Widget type is not defined");
        }
        this.content = document.createElement(baseTypes[baseType]);
        this.content.className = type;
    }
    /**
     * @abstract Configure a widget
     * @param {Object} configuration Contents of widget
     */
    public abstract configuration(configuration: Object): void;
    /**
     * @abstract Render a widget
     * @returns {HTMLElement}
     */
    public abstract render(): HTMLElement;
    /**
     * Whether a configuration has an entity
     * @param {Object} configuration Configuration to check against
     * @param {string} entity The entity to search for
     * @returns {boolean} Whether the configuration has an entity
     */
    protected configurationHas(configuration: Object, entity: string): boolean {
        try {
            const value: any = (configuration as any)[entity];
            return (value !== undefined);
        } catch {
            return false;
        }
    }
};
