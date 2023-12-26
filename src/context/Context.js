// components
import ContextComponent from "./components/ContextComponent.js";
import ContextWrapper from "./components/ContextWrapper.js";
import ContextEditor from "./components/ContextEditor.js";
import ContextToolbar from "./components/ContextToolbar.js";
import ContextFormats from "./components/ContextFormats.js";

export default class Context {
    constructor (selector) {
        // prefixes
        this.dataPrefix = "ctx-";
        this.cssPrefix = "_ctx-";

		// static
		this.selector = selector;
		this.boundNode = !( selector instanceof HTMLElement ) ? document.querySelector(selector) : selector;

		// dynamic
		this.layoutMarkup = `
			<ContextWrapper>
				<ContextToolbar>
					<ContextFormats editor="ContextEditor">
						{bold}{italic}{strike}
					</ContextFormats>
				</ContextToolbar>

				<ContextEditor></ContextEditor>
			</ContextWrapper>
		`;

		// components
		this.components = new ContextComponent();
		this.components.setMarkup(this.layoutMarkup);
		this.components.globalProps({
			boundNode : this.boundNode,
			dataPrefix : this.dataPrefix,
			cssPrefix : this.cssPrefix
		});

		this.components.register(ContextWrapper, "section");
		this.components.register(ContextEditor, "iframe");
		this.components.register(ContextToolbar, "div");
		this.components.register(ContextFormats, "div");

		this.components.get("ContextFormats", formats => {
			formats.register = set => {
				set("bold", "strong", "B");
				set("italic", "em", "I");
				set("strike", "s", "S");
			}
		});
    }

	layout (layout) {
		this.layoutMarkup = layout;
	}

	init () {

		this.components.set(this.boundNode);
	}
}
