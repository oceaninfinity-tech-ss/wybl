import { textual_t } from "./textual";

/**
 * A textual widget used to show text
 */
export class text_t extends textual_t {
    constructor() {
        super("span", "text");
    };
    public configuration(configuration: Object): void {
        super.setConfiguration(configuration, "left");
    }
};
