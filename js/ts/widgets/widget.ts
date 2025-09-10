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
        try {
            this.content = document.createElement(baseType);
        } catch {
            throw new Error(`Unknown widget base type: ${baseType}`);
        }
        if (type.trim().length == 0) {
            throw new Error("Widget type is not defined");
        }
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
    public abstract render(): Promise<HTMLElement>;
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
