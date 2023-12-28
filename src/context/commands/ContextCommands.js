import ContextActions from "./ContextActions.js";

export default class ContextCommands extends ContextActions {
	constructor (editor) {
		super();

		this.editor = editor;
		this.ctxStart = super.start();
		this.ctxEnd = super.end();
		this.ctxSelect = super.select();
		this.settings = {};
	}

	setMode (settings) {
		this.settings = {...this.settings, ...settings };
	}

	exec (type, settings) {
		const sel = this.editor.getSelection();
		const { isCollapsed } = sel;

		if (!isCollapsed) {
			const range = sel.getRangeAt(0);

			super.set(
				range, 
				this.ctxStart, 
				this.ctxEnd, 
				this.ctxSelect,
				this.editor
			);

			this.details = super.details(type);

			const { sameNodes, sameFormat, containsFormat } = this.details;

			if (!sameFormat && !containsFormat && sameNodes) {
				this.#wrap();
			}
			else if (!sameFormat && containsFormat && sameNodes) {
				this.#unwrap();
			}
			else if (sameFormat && !sameNodes && containsFormat) {
				this.#bridge();
			}
			else if (sameFormat || !containsFormat || sameNodes) {
				this.#break();
			}
		}
	}

	#bridge () {
		const { format } = this.details;

		if (this.settings.debug) console.log("bridge");

		super.contain(true);
		super.exterminate(format);
		super.wrap(format);
	}

	#break () {
		const { format } = this.details;

		if (this.settings.debug) console.log("break");

		super.contain(true);
	}

	#unwrap () {
		const { format } = this.details;

		if (this.settings.debug) console.log("unwrap");

		super.contain(true);
		super.exterminate(format);
		super.contain();
		super.highlight();
		super.deselect();
	}

	#wrap () {
		const { format } = this.details;

		if (this.settings.debug) console.log("wrap");

		super.contain(true);
		super.exterminate(format);
		super.wrap(format);
		super.contain();
		super.highlight();
		super.deselect();
	}
}
