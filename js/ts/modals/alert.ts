import { dialog } from "./dialog";

/**
 * Show an alert dialog
 * @param {string} message The message to show in the alert
 * @returns {Promise<boolean>} Whether the alert has been interacted with by a user
 */
export function alert(message: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        const content: HTMLParagraphElement = document.createElement("p");
        content.innerText = message;
        dialog(null, content, ["Close"]).then((_button: string) => {
            resolve(true)
        }).catch((_button: string) => {
            reject(false)
        });
    });
}
