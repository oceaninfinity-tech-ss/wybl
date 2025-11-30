let dialogAbort: AbortController = new AbortController();

/**
 * Validate the actions are unique and are not empty
 * @param actions List of actions
 * @returns {boolean} Whether the actions are unique and are not empty
 * @internal
 */
function validateActions(actions: string[]): boolean {
    const validatedActions: Set<string> = new Set<string>();
    for (const action of actions) {
        // Check if the item is only whitespace or empty
        if (!action?.trim()) {
            throw new Error("A dialog action cannot be empty");
        }
        // Check for duplicates
        if (validatedActions.has(action)) {
            throw new Error("A dialog requires unique actions");
        }
        validatedActions.add(action);
    }
    return true;
}

/**
 * Show a dialog and get actionable result
 * @param {string | null} title The title of the dialog (if `null` not shown)
 * @param {HTMLElement} content The content to show within the dialog
 * @param {string[]} actions List of actions
 * @returns {Promise<string>} Action selected
 */
export function dialog(title: (string | null), content: HTMLElement, actions: string[]): Promise<string> {
    if (actions.length == 0) {
        throw new Error("A dialog requires actions");
    }
    validateActions(actions);
    dialogAbort.abort(); // Cause all other dialogs to reject
    dialogAbort = new AbortController();
    return new Promise<string>((resolve, reject) => {
        const dialogElement: HTMLDialogElement = document.createElement("dialog");
        dialogElement.setAttribute("closedby", "closerequest");
        dialogAbort.signal.addEventListener("abort", () => close());
        const close = (): void => {
            dialogElement.remove();
            reject();
        };
        dialogElement.addEventListener("close", () => close());
        if ((title || "").trim()) {
            const titleElement: HTMLHeadingElement = document.createElement("h2");
            titleElement.innerText = (title as string);
            dialogElement.appendChild(titleElement);
        }
        dialogElement.appendChild(content);
        const buttonsElement: HTMLDivElement = document.createElement("div");
        actions.forEach((action: string) => {
            const actionElement: HTMLButtonElement = document.createElement("button");
            actionElement.innerText = action;
            actionElement.addEventListener("click", () => {
                resolve(action);
                dialogElement.close();
            });
            buttonsElement.appendChild(actionElement);
        });
        dialogElement.appendChild(buttonsElement);
        document.body.appendChild(dialogElement);
        dialogElement.showModal();
        dialogElement.focus();
    });
}
