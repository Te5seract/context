import ContexEditor from "./editor/ContextEditor.js";
import ContextHooks from "./helpers/ContextHooks.js";

export default class Context {
    constructor (selected, options) {
        // prefixes
        this.dataPrefix = "ctx-";
        this.cssPrefix = "_ctx-";

        // instances
        this.hooks = new ContextHooks();

        // static
        this.selected = selected;
        this.options = options;

        this.selectedNode = this.selected instanceof HTMLElement ? 
            this.selected : 
            document.querySelector(this.selected);

        // instances
        this.editor = new ContexEditor({
            hooks : this.hooks,
            dataPrefix : this.dataPrefix,
            cssPrefix : this.cssPrefix,
            selectedNode : this.selectedNode,
            options
        });
    }

    init () {
        this.editor.set();
    }
}
