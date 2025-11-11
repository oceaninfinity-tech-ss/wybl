import { textual_t } from "./textual";

/**
 * A banner widget used to show text
 */
export class banner_t extends textual_t {
    constructor() {
        super("h2", "banner");
    };
    public configuration(configuration: Object): void {
        super.setConfiguration(configuration, "center");
    }
};
