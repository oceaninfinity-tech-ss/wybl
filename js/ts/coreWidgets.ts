import { structure_t } from "./structure"
import { audio_t } from "./widgets/audio";
import { banner_t } from "./widgets/banner";
import { container_t } from "./widgets/container"
import { image_t } from "./widgets/image";
import { layout_t } from "./widgets/layout";
import { tabs_t } from "./widgets/tabs";
import { text_t } from "./widgets/text";
import { video_t } from "./widgets/video";
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
    structure_t.declareWidget("banner", (): widget_t => { return new banner_t() });
    structure_t.declareWidget("text", (): widget_t => { return new text_t() });
    structure_t.declareWidget("image", (): widget_t => { return new image_t() });
    structure_t.declareWidget("video", (): widget_t => { return new video_t() });
    structure_t.declareWidget("audio", (): widget_t => { return new audio_t() });
}
