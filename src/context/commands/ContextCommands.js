import ContextActions from "./ContextActions.js";
import ContextOptimize from "../actions/ContextOptimize.js";
import ContextOperations from "../actions/ContextOperations.js";

// action methods
import ContextSelect from "../actions/ContextSelect.js";

// command libraries
//import ContextFormatActions from "../command-libraries/ContextFormatActions.js";
import ContextFormatActions from "../command-libraries/ContextFormatActions.js";

export default class ContextCommands extends ContextActions {
	constructor (editor, editorElem, useLib) {
		super();

		this.editor = editor;
        this.editorElem = editorElem;
		this.settings = {};
        this.useLib = useLib;

        this.setActionMethods(ContextSelect, "select");
        this.setActionMethods(ContextOptimize, "optimize");
        this.setActionMethods(ContextOperations, "operation");

        // command libraries
        this.commandLibs = {
            format : ContextFormatActions
        };

        this.setCommandLib(this.useLib ? this.commandLibs[this.useLib] : this.commandLibs.format);
	}

    /**
    * sets the mode of the editor, this happens
    * at the point of constructing the editor
    * markup the current modes are:
    *
    * debugmode (boolean)
    *
    * @return {void}
    */
	setMode (settings) {
		this.settings = {...this.settings, ...settings };
	}

    /**
    * runs toggle commands for the editor
    */
	exec (format) {
        //const sel = this.editorElem.contentWindow.getSelection();

        const sel = this.editor.getSelection();
        const range = sel.getRangeAt(0);
		const { isCollapsed } = sel;

        super.set(
            range, 
            format,
            this.editor
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

        if (isCollapsed) {
            this.collapsedCaret();

            const { isFormatted } = this.details;

            if (!isFormatted) {
                this.#insert();

                return;
            }

            this.#split();
        }
	}

    #split () {
        if (this.settings.debug) console.log("split");

        this.split();
    }

    #insert () {
        if (this.settings.debug) console.log("insert");

        this.insert();
    }

	#unwrap () {
		if (this.settings.debug) console.log("unwrap");

        this.unwrap();
        this.select.highlight();
        this.select.boundaries();
	}

	#wrap () {
		if (this.settings.debug) console.log("wrap");

        this.wrap();
        this.select.highlight();
        this.select.boundaries();
    }
}
