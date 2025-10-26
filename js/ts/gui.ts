interface gui_schema_t {
    modules: string[];
    name: string;
    structure: string;
    stylesheet: string;
}

declare var gui: gui_schema_t | undefined;

/**
 * @internal
 */
export class gui_t {
    public modules!: string[];
    public name!: string;
    public structure!: string;
    public stylesheet!: string;
    constructor() {
        if (typeof gui === "undefined") {
            throw new Error("No GUI configuration was declared");
        }
        this.modules = gui.modules;
        this.name = gui.name;
        this.structure = gui.structure
        this.stylesheet = gui.stylesheet;
    }
}
