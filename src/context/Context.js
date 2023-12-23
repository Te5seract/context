import ContextEditor from "./editor/ContextEditor.js";
import ContextWrapper from "./editor/ContextWrapper.js";
import ContextHooks from "./helpers/ContextHooks.js";

// styles
import ContextStyles from "./styles/ContextStyles.js";

export default class Context {
    constructor (nodeName, editorContext) {
        // prefixes
        this.dataPrefix = "ctx-";
        this.cssPrefix = "_ctx-";
        this.nodeName = nodeName;
        this.editorContext = editorContext;

        // hooks
        this.hooks = new ContextHooks();

        // instances
		const styles = new ContextStyles(this.name);

		this.hooks.set("style", [ styles ]);

        // editor components
        this.#editorComponents();

        styles.setCss();
    }

    #editorComponents () {
        const wrapper = new ContextWrapper({ 
            nodeName : this.nodeName,
            hooks : this.hooks,
            editorContext : this.editorContext
        });

        const editor = new ContextEditor({
            hooks : this.hooks
        });

        this.hooks.set("editor", { wrapper, editor });

        this.#set();
    }

    #set () {
        const { wrapper, editor } = this.hooks.get("editor");
    }

    editor (callback) {
        if (callback) { 
            const editor = this.hooks.get("editor");
            const html = callback(editor);

            html.replace(/\n| {2,}/g, "");
        }
    }

    init () {
        this.hooks.get("style", styles => {
            styles.setCss();
        });
    }
}
