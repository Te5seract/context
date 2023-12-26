export default class ContextCommands {
	constructor (editor) {
		this.editor = editor;
	}

	exec (type, settings) {
		const sel = this.editor.getSelection();
		const range = sel.getRangeAt(0);
	}
}
