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

	trueFalse (value) {
		return ( value || !value );
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

			const { percentOfFormat, isSameFormat, containsFormat, isMultiline } = this.details;

			//if (!isSameFormat && this.trueFalse(containsFormat)) {
			if (percentOfFormat < 95) {
				this.#wrap();
			}
			//else if (isSameFormat && this.trueFalse(containsFormat)) {
			else if (percentOfFormat >= 95) {
				this.#unwrap();
			}
		}
	}

	#unwrap () {
		const { format } = this.details;

		if (this.settings.debug) console.log("unwrap");

		//super.contain(true);
		//super.highlight();
	}

	#wrap () {
		const { format } = this.details;

		if (this.settings.debug) console.log("wrap");

		super.contain(true);
		super.wrap(format);
		super.contain();
		super.highlight();
		super.deselect();
	}
}
