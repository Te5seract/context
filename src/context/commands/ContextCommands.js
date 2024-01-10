import ContextActions from "./ContextActions.js";

export default class ContextCommands extends ContextActions {
	constructor (editor) {
		super();

		this.editor = editor;
		this.settings = {};
	}

	setMode (settings) {
		this.settings = {...this.settings, ...settings };
	}

	trueFalse (value) {
		return ( value || !value );
	}

	exec (format, settings) {
		const sel = this.editor.getSelection();
		const { isCollapsed } = sel;

		if (!isCollapsed) {
			const range = sel.getRangeAt(0);

			super.set(
				range, 
                format,
				this.editor
			);

			super.slice();

			const { 
                startFormat, 
                endFormat,
                //startSiblingFormat,
                //endSiblingFormat
            } = this.details;

            if (startFormat !== format || endFormat !== format) {
				this.#wrap();
			} 
            else if (startFormat === format && endFormat === format) {
				this.#unwrap();
			}
		}
	}

	#unwrap () {
		if (this.settings.debug) console.log("unwrap");

        super.unwrap();
        super.highlight();
        super.deselect();
	}

	#wrap () {
        const { format } = this.details;

		if (this.settings.debug) console.log("wrap");

        super.wrap();
        super.highlight();
        super.deselect();
    }
}
