import ContextActions from "./ContextActions.js";

export default class ContextCommands extends ContextActions {
	constructor (editor) {
		super();

		this.editor = editor;
		this.ctxStart = super.start();
		this.ctxEnd = super.end();
	}

	exec (type, settings) {
		const sel = this.editor.getSelection();
		const { isCollapsed } = sel;

		//const range = sel.getRangeAt(0);

		if (!isCollapsed) {
			const range = sel.getRangeAt(0);

			super.set(range, this.ctxStart, this.ctxEnd);
			super.details();
			//super.slice();
			//super.contain();
			//super.highlight();
		}
	}

	#wrap () {}
}
