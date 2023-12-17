export default class ContextEditor {
    constructor ({ hooks, options, dataPrefix, selectedNode }) {
        // static
        this.options = options;
        this.dataPrefix = dataPrefix;
        this.hooks = hooks;
        this.selectedNode = selectedNode;

        // main editor
        this.wrapper = document.createElement("div");
        // main editor
        this.editor = document.createElement("iframe");

        // kickoff
        this.#editor();
    }

    #editor () {
        const editor = this.editor;

        editor.dataset.role = `${ this.dataPrefix }main-editor`;
    }

    #wrapper () {
        const wrapper = this.wrapper;

        editor.dataset.node = `${ this.dataPrefix }editor-wrapper`;
    }

    set () {
        this.wrapper.append(this.editor);
        this.selectedNode.before(this.wrapper);

        this.editor.contentDocument.designMode = "on";
    }
}
