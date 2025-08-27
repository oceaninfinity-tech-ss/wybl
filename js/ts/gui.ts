interface gui_schema_t {
    name: string;
    structure: string;
    stylesheet: string;
}

declare var gui: gui_schema_t | undefined;

/**
 * @internal
 */
export class gui_t {
    public name!: string;
    public structure!: string;
    public stylesheet!: string;
    constructor() {
        if (typeof gui === "undefined") {
            throw new Error("No GUI configuration was declared");
        }
        this.name = gui.name;
        this.structure = gui.structure
        this.stylesheet = gui.stylesheet;
    }
}
