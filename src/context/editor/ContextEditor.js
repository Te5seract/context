import ContextElement from "../element/ContextElement.js";

export default class ContextEditor {
    constructor () {
        this.ctxEditor = new ContextElement("ctx-editor", function () {
            this.contentEditable = true;
        });
    }

    get () {
        return this.ctxEditor;
    }
}
