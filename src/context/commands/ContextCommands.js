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

	exec (format, settings) {
		const sel = this.editor.getSelection();
        const range = sel.getRangeAt(0);
		const { isCollapsed } = sel;

        super.set(
            range, 
            format,
            this.editor,
            settings
        );

		if (!isCollapsed) {
			super.slice();

			const { 
                startFormat, 
                endFormat,
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

        this.unwrap();
        this.highlight();
        this.deselect();
	}

	#wrap () {
		if (this.settings.debug) console.log("wrap");

        this.wrap();
        this.highlight();
        this.deselect();
    }
}
