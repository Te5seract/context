import CtxEditor from "./CtxEditor.js";
import CtxFormatTools from "./CtxFormatTools.js";
import CtxFormatActions from "./actions/CtxFormatActions.js";


export default class Context {
    constructor (selected) {
        this.prefix = "ctx-";
        this.selected = selected;
        this.selectedNode = this.selected instanceof HTMLElement ? 
            this.selected : 
            document.querySelector(this.selected);

        // dynamic
        this.fragment = {};

        // initiate the editor
        this.#setEditor();
    }

    /**
    * sets up the editor
     */
    #setEditor () {
        this.editor = new CtxEditor(this.selectedNode, this.prefix);
        this.editor.build();

        this.tools = new CtxFormatTools(this.editor);

        this.tools.set("bold", "strong", "B");
        this.tools.set("italic", "em", "I");
        this.tools.set("strike", "s", "S");
    }

    start () {
        this.tools.init();

        const formatActions = new CtxFormatActions(this.tools.tools, this.editor);
    }
}
