import { dialog } from "./dialog";

/**
 * Show an confirmation dialog
 * @param {string} message The message to show in the confirmation
 * @returns {Promise<boolean>} Whether the confirmation dialog has been confirmed with by a user
 */
export function confirm(message: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const content: HTMLParagraphElement = document.createElement("p");
        content.innerText = message;
        const confirmText: string = "Confirm";
        dialog(null, content, ["Close", "Confirm"]).then((button: string) => {
            resolve(button == confirmText);
        }).catch((_button: string) => {
            reject(false)
        });
    });
}
