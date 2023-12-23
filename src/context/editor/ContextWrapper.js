import ContextElement from "../element/ContextElement.js";

export default class ContextWrapper {
    constructor ({ nodeName, editorContext, hooks }) {
        // static
        this.nodeName = nodeName;
        this.editorContext = editorContext;
        this.hooks = hooks;

        const ctx = this;

        // wrapper node
        this.ctxWrapper = new ContextElement(nodeName, function () {
            ctx.element = this;

            const styles = document.createElement("style");

            styles.innerHTML = `
                ${ ctx.nodeName } {
                    display: block;
                }
            `;

            this.appendChild(styles);

            const editor = document.createElement("ctx-editor");

            this.appendChild(editor);
        });
    }
}
