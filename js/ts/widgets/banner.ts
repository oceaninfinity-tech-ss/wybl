import { textual_t, textualAlignment_t } from "./textual";

const textualAlignmentDefault: textualAlignment_t = "center";

/**
 * A banner widget used to show text
 */
export class banner_t extends textual_t {
    constructor() {
        super("h2", "banner");
    };
    public configuration(configuration: Object): void {
        super.configuration(configuration);
        if (!this.configurationHas(configuration, "align")) {
            this.content.style.setProperty("--alignment", textualAlignmentDefault);
        }
    }
};
