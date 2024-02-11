// helpers
import ContextDOM from "../helpers/ContextDOM.js";
import ContextTreeWalker from "../helpers/ContextTreeWalker.js";

// command helpers
//import ContextOptimize from "./ContextOptimize.js";

/**
* @namespace Actions
*
* this class is interfaced into via the 
* above imported actions, depending on
* what the user requests
*/
export default class ContextActions {
	constructor () {
		this.DOM = new ContextDOM();
		this.treeWalker = new ContextTreeWalker();
		this.ctxSelection = [];

		// dynamic
		this.ctxStart = this.createStart();
		this.ctxEnd = this.createEnd();
		this.ctxSelect = this.createSelect();
        this.ctxCaret = this.createCaret();
        this.details = {};
	}

    ///////////////////////////////////
    // -- private

	/**
	* creates a temporary node to contain and 
	* isolate any siginificant text changes
	*
	* @param {HTMLElement|string}
	*
	* @return {HTMLElement}
	*/
	#tmp (content) {
		const tmp = document.createElement("span");

		if (content instanceof HTMLElement || content.nodeName && content.nodeName.match(/#document-fragment/i)) { 
			tmp.appendChild(content);
		}
		else tmp.innerHTML = content;

		return tmp;
	}

    /**
    * gathers information about the selection and 
    * lists the details about it in an object
    *
    * @return {void}
     */
    #setDetails () {
        if (this.editor.querySelector(`[data-role="ctx-start"]`) && this.editor.querySelector(`[data-role="ctx-end"]`)) {
            const startLine = this.DOM.getLine(this.ctxStart);
            const endLine = this.DOM.getLine(this.ctxEnd);
            const startNode = this.DOM.nodeRoot(this.ctxStart, this.format);
            const endNode = this.DOM.nodeRoot(this.ctxEnd, this.format);
            let startFormat = startNode.nodeName.toLowerCase();
            let endFormat = endNode.nodeName.toLowerCase();
            const isMultiline = startLine !== endLine;

            this.details = {
                ...this.details,
                startLine,
                endLine,
                startFormat,
                endFormat,
                startNode,
                endNode,
                isMultiline
            };

            return;
        }

        let nextNode = this.ctxCaret.nextSibling;
        let prevNode = this.ctxCaret.previousSibling;

        if (nextNode && nextNode.nodeName.match(/#text/) && !nextNode.textContent) {
            nextNode.remove();

            nextNode = this.ctxCaret.nextSibling ? this.ctxCaret.nextSibling : null;
        }

        if (prevNode && prevNode.nodeName.match(/#text/) && !prevNode.textContent) {
            prevNode.remove();

            prevNode = this.ctxCaret.previousSibling ? this.ctxCaret.previousSibling : null;
        }

        const caretLine = this.DOM.getLine(this.ctxCaret);
        const caretNode = this.DOM.nodeRoot(this.ctxCaret, this.format);
        const caretFormat = caretNode.nodeName.toLowerCase();
        const caretPrev = prevNode;
        const caretNext = nextNode;
        const caretPrevFormat = caretPrev ? caretPrev.nodeName.toLowerCase() : null;
        const caretNextFormat = caretNext ? caretNext.nodeName.toLowerCase() : null;
        const caretParents = this.DOM.getFormats(this.ctxCaret);

        this.details = {
            ...this.details,
            caretLine,
            caretNode,
            caretFormat,
            caretPrev,
            caretNext,
            caretParents,
            caretPrevFormat,
            caretNextFormat
        };
    }

    #setCommandLogic (logic) {
        const methods = Object.getOwnPropertyNames(logic.prototype).filter(method => !method.match(/constructor/i));

        methods.forEach(method => {
            this[method] = logic.prototype[method];
        });
    }

    ///////////////////////////////////
    // -- public
	/**
	* sets the common requirements
	* for the selection to work
	*
	* @param {Object} range
	* the range object
	*
	* @param {HTMLElement} start
	* the ctx-start boundary node
	*
	* @param {HTMLElement} end
	* the ctx-end boundary node
	*
	* @return {void}
	*/
	set (range, format, editor) {
		this.range = range;
        this.format = format;
        this.editor = editor;

        this.details = {};
	}

    /**
    * sets the command library to use
    * for all formatting actions
    *
    * @return {void}
    */
    setCommandLib (commandLogic) {
        this.#setCommandLogic(commandLogic);
    }

    /**
    * gets the node the caret is currently
    * within
    *
    * @param {object} sel
    * the selection object
    *
    * @return {array}
    */
    getCaret (sel) {
        const { baseNode } = sel;

        return [ this.DOM.getParentsStr(baseNode), this.DOM.getParents(baseNode) ];
    }

	/**
	* creates the start boundary
	* <span data-role="ctx-start"></span>
	*
	* @return {HTMLElement}
	*/
	createStart () {
		const ctxStart = document.createElement("span");

		ctxStart.dataset.role = "ctx-start";

		return ctxStart;
	}

	/**
	* creates the end boundary
	* <span data-role="ctx-end"></span>
	*
	* @return {HTMLElement}
	*/
	createEnd () {
		const ctxEnd = document.createElement("span");

		ctxEnd.dataset.role = "ctx-end";

		return ctxEnd;
	}

	/**
	* creates the selection node
	* <span data-role="ctx-select"></span>
	*
	* @return {HTMLElement}
	*/
	createSelect () {
		const ctxSelect = document.createElement("span");

		ctxSelect.dataset.role = "ctx-select";

		return ctxSelect;
	}

    /**
    * creates the caret (cursor) to indicate
    * the cursor position
    *
    * @return {HTMLElement}
    */
    createCaret () {
        const ctxCaret = document.createElement("span");

        ctxCaret.dataset.role = "ctx-caret";

        return ctxCaret;
    }

	/**
	* places the start and end boundaries
	* of the slection creating a slice section
	* around the selection via the ctx-start 
	* and ctx-end boundaries
	*
	* @return {void}
	*/
	slice (commandLogic) {
		const { startOffset, startContainer } = this.range;

		this.range.collapse();
		this.range.insertNode(this.ctxEnd);

		this.range.setStart(startContainer, startOffset);
		this.range.insertNode(this.ctxStart);

		this.range.setStartAfter(this.ctxStart);
		this.range.setEndBefore(this.ctxEnd);

        const prevNode = this.ctxStart.previousSibling;
        const nextNode = this.ctxEnd.nextSibling;

        if (nextNode && nextNode.nodeName.match(/#text/g) && !nextNode.textContent) nextNode.remove();

        if (prevNode && prevNode.nodeName.match(/#text/g) && !prevNode.textContent) prevNode.remove();

        this.#setDetails();

        this.setDetails();
	}

    collapsedCaret () {
		const { startOffset, startContainer } = this.range;

        this.range.insertNode(this.ctxCaret);

        this.#setDetails();

        const { caretFormat } = this.details;

        const isFormatted = caretFormat === this.format;

        this.details = { ...this.details, isFormatted };

        //this.setDetails();
    }

    /**
    * sets action methods to the 
    * context actions class
    *
    * @param {object} instance
    * a class that contains action methods 
    *
    * @param {string} namespace
    * what the methods should be accessed under
    *
    * @return {void}
    */
    setActionMethods (instance, namespace) {
        if (namespace) {
            this[namespace] = {};

            const methods = Object.getOwnPropertyNames(instance.prototype).filter(method => !method.match(/constructor/));

            methods.forEach(method => {
                this[namespace][method] = instance.prototype[method].bind(this);
            });
        }
    }
}
