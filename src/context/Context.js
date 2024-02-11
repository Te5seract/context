// components
import ContextComponent from "./components/ContextComponent.js";
import ContextWrapper from "./components/ContextWrapper.js";
import ContextEditor from "./components/ContextEditor.js";
import ContextToolbar from "./components/ContextToolbar.js";
import ContextFormats from "./components/ContextFormats.js";
import ContextStatus from "./components/ContextStatus.js";

export default class Context {
	/**
	* @param {string|HTMLElement} 
	* the node selector for the context
	* editor's position
	*
	* @param {string} [layout]
	* a custom editor layout specification
	*/
    constructor (selector, layout) {
        // prefixes
        this.dataPrefix = "ctx-";
        this.cssPrefix = "_ctx-";
		this.layoutMarkup = layout;

		// static
		this.selector = selector;
		this.boundNode = !( selector instanceof HTMLElement ) ? document.querySelector(selector) : selector;

		// dynamic
		this.#setup();
    }

	/**
	* sets up the editor layout and settings
	*
	* @return {void}
	*/
	#setup () {
		if (!this.layoutMarkup) {
			this.layoutMarkup = `
				<ContextWrapper>
					<ContextToolbar>
						<ContextFormats editor="ContextEditor"></ContextFormats>
					</ContextToolbar>

					<ContextEditor></ContextEditor>

                    <ContextStatus 
                        formats="ContextFormats"
                        editor="ContextEditor"
                        word-count="true"
                        lineage="true"
                    >
                    </ContextStatus>
				</ContextWrapper>
			`;
		}

		// components
		this.components = new ContextComponent();
		this.components.setMarkup(this.layoutMarkup);
		this.components.globalProps({
			boundNode : this.boundNode,
			dataPrefix : this.dataPrefix,
			cssPrefix : this.cssPrefix,
			debugmode : true
		});

		this.components.register(ContextWrapper, "section");
		this.components.register(ContextEditor, "iframe");
		this.components.register(ContextToolbar, "div");
		this.components.register(ContextFormats, "div");
        this.components.register(ContextStatus, "div");

		this.components.get("ContextFormats", formats => {
			formats.set = set => {
				set("bold", "strong", "B");
				set("italic", "em", "I");
				set("strike", "s", "S");
			}
		});
	}

	/**
	* initialises the editor
	*/
	init () {
		this.components.set(this.boundNode);
	}
}
