import ContextDOM from "../helpers/ContextDOM.js";
import ContextTreeWalker from "../helpers/ContextTreeWalker.js";

export default class ContextActions {
	constructor () {
		this.DOM = new ContextDOM();
		this.treeWalker = new ContextTreeWalker();
		this.ctxSelection = [];

		// dynamic
		this.ctxStart = this.start();
		this.ctxEnd = this.end();
		this.ctxSelect = this.select();
        this.details = {};
	}

	/**
	* returns a node regular expression for
	* the closing and opening tags of an HTML
	* element
	*
	* @param {string} type
	* the node tag type
	*
	* @return {string}
	*/
	#nodeReg (tag) {
		return new RegExp(`<${ tag }>|<\/${ tag }>`, "gi");
	}

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
	}

	/**
	* creates the start boundary
	* <span data-role="ctx-start"></span>
	*
	* @return {HTMLElement}
	*/
	start () {
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
	end () {
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
	select () {
		const ctxSelect = document.createElement("span");

		ctxSelect.dataset.role = "ctx-select";

		return ctxSelect;
	}

	/**
	* places the start and end boundaries
	* of the slection creating a slice section
	* around the selection via the ctx-start 
	* and ctx-end boundaries
	*
	* @return {void}
	*/
	slice (range) {
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
	}

    /**
    * gathers information about the selection and 
    * lists the details about it in an object
    *
    * @return {void}
     */
    #setDetails () {
        const startLine = this.DOM.getLine(this.ctxStart);
        const endLine = this.DOM.getLine(this.ctxEnd);
        const startNode = this.DOM.nodeRoot(this.ctxStart, this.format);
        const endNode = this.DOM.nodeRoot(this.ctxEnd, this.format);
        let startFormat = startNode.nodeName.toLowerCase();
        let endFormat = endNode.nodeName.toLowerCase();
        const isMultiline = startLine !== endLine;

        let startSiblingFormat;
        let endSiblingFormat;

        if (startFormat !== this.format && this.ctxStart.nextSibling && !this.ctxStart.nextSibling.nodeName.match(/#text/)) {
            const nextNode = this.ctxStart.nextSibling.querySelector(this.format);

            startFormat = nextNode ? nextNode.nodeName.toLowerCase() : this.ctxStart.nextSibling.nodeName.toLowerCase();
        }

        if (endFormat !== this.format && this.ctxEnd.previousSibling && !this.ctxEnd.previousSibling.nodeName.match(/#text/)) {
            const prevNode = this.ctxEnd.previousSibling.querySelector(this.format);

            endFormat = prevNode ? prevNode.nodeName.toLowerCase() : this.ctxEnd.previousSibling.nodeName.toLowerCase();
        }

        this.details = {
            startLine,
            endLine,
            startFormat,
            endFormat,
            startNode,
            endNode,
            isMultiline,
            startSiblingFormat,
            endSiblingFormat,
        };
    }

    /**
    * gets the selected fragments
    * of text for formatting
    *
    * @param {CallableFunction} callback
    * the callback fires once for each selection
    * fragment
    *
    * @param {int} steps
    * the number of steps to perform before 
    * stopping
    *
    * @return {void}
    */
    getSelection (callback, steps) {
        const { startLine, endLine, isMultiline } = this.details;
        let i = 0;

        if (isMultiline) {
            this.treeWalker.walkAtoB(startLine, endLine, ({ prev, current, next }) => {
                if (i === steps) return;

                // first
                if (!prev) {
                    this.range.setStartAfter(this.ctxStart);
                    this.range.setEnd(current, current.childNodes.length);
                }

                if (prev && next) {
                    this.range.setStart(current, 0);
                    this.range.setEnd(current, current.childNodes.length);
                }

                if (!next) {
                    this.range.setStart(current, 0);
                    this.range.setEndBefore(this.ctxEnd);
                }

                callback(current);

                i++;
            });

            return;
        }

        this.range.setStartAfter(this.ctxStart);
        this.range.setEndBefore(this.ctxEnd);

        callback();
    }

    /**
    * wraps a selection in the format
    *
    * @return {void}
    */
    wrap () {
        const { isMultiline } = this.details;
        const formats = [];

        this.getSelection(() => {
            const formatNode = document.createElement(this.format);
            const extract = this.range.extractContents();

            formatNode.appendChild(extract);

            this.exterminate(formatNode, this.format);

            this.ctxSelect.appendChild(formatNode);

            this.range.insertNode(this.ctxSelect);

            this.range.selectNodeContents(this.ctxSelect);

            const extractSelect = this.range.extractContents();

            this.ctxSelect.after(extractSelect);

            formats.push(formatNode);

            this.ctxSelect.remove();
        });

        //if (!isMultiline) {
            //formats[0].childNodes[0].before(this.ctxStart);
            //formats[formats.length - 1].appendChild(this.ctxEnd);
        //}
    }

    unwrap () {
        const {
            startNode,
            isMultiline
        } = this.details;

        if (isMultiline) {
            this.getSelection(line => {
                const extract = this.range.extractContents();

                this.ctxSelect.appendChild(extract);

                this.range.insertNode(this.ctxSelect);

                this.exterminate(this.ctxSelect, this.format);

                this.range.selectNodeContents(this.ctxSelect);

                const selectExtract = this.range.extractContents();

                if (line.querySelector(`[data-role="ctx-start"]`)) {
                    this.ctxSelect.before(this.ctxStart);
                }
                else if (line.querySelector(`[data-role="ctx-end"]`)) {
                    this.ctxSelect.after(this.ctxEnd);
                }

                this.ctxSelect.after(selectExtract);

                this.ctxSelect.remove();
            });

            return;
        }

        this.getSelection(() => {
            const extract = this.range.extractContents();

            this.ctxSelect.appendChild(extract);

            this.range.insertNode(this.ctxSelect);

            this.ctxSelect.before(this.ctxStart);
            this.ctxSelect.after(this.ctxEnd);

            const containsFormat = this.ctxSelect.querySelector(this.format);

            this.exterminate(this.ctxSelect, this.format);

            if (!containsFormat) {
                const root = this.DOM.getRootFormat(this.ctxSelect)

                this.range.setStartBefore(root);
                this.range.setEndBefore(this.ctxStart);

                const extractBefore = this.range.extractContents();

                this.range.setStartAfter(this.ctxEnd);
                this.range.setEndAfter(root);

                const extractAfter = this.range.extractContents();

                this.ctxSelect.appendChild(extract);
                this.ctxStart.after(this.ctxSelect);

                // wrap the root
                this.range.selectNodeContents(this.ctxSelect);

                const selExtract = this.range.extractContents();

                this.ctxSelect.after(selExtract);
                this.ctxSelect.remove();

                startNode.before(this.ctxStart);
                startNode.after(this.ctxEnd);
                this.highlight();

                const extractStart = this.range.extractContents();

                this.ctxSelect.appendChild(extractStart);

                this.ctxStart.after(this.ctxSelect);

                this.exterminate(this.ctxSelect, this.format);

                // insert before and after content
                this.ctxStart.before(extractBefore);
                this.ctxEnd.after(extractAfter);

                // take content out of select and remove select below...
                this.range.selectNodeContents(this.ctxSelect);

                const clearSelExtract = this.range.extractContents();

                this.ctxSelect.after(clearSelExtract);

                this.ctxSelect.remove();

                return;
            }

            this.range.selectNodeContents(this.ctxSelect);

            const clearSelExtract = this.range.extractContents();

            this.ctxSelect.after(clearSelExtract);

            this.ctxSelect.remove();
        });
    }

    /**
    * exterminates particular node types from 
    * the selection
    *
    * @param {HTMLElement} node
    * the node to exterminate other nodes
    * from within
    *
    * @param {string} type
    * the type of node to remove from the
    * first param's child list
    *
    * @return {void}
    */
    exterminate (node, type) {
        node.innerHTML = node.innerHTML.replace(this.#nodeReg(type), "");
    }

    /**
    * highlights the boundaries between
    * the ctxStart and ctxEnd
    *
    * @return {void}
    */
    highlight () {
        this.range.setStartAfter(this.ctxStart);
        this.range.setEndBefore(this.ctxEnd);
    }

    /**
    * removes the start and end boundaries
    *
    * @return {void}
    */
    deselect () {
        this.ctxStart.remove();
        this.ctxEnd.remove();
    }
}
