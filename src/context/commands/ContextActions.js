import ContextDOM from "../helpers/ContextDOM.js";
import ContextTreeWalker from "../helpers/ContextTreeWalker.js";

export default class ContextActions {
	constructor () {
		this.DOM = new ContextDOM();
		this.treeWalker = new ContextTreeWalker();
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
		const tmp = document.createElement("div");

		if (content instanceof HTMLElement || content.nodeName && content.nodeName.match(/#document-fragment/i)) { 
			tmp.appendChild(content);
		}
		else tmp.innerHTML = content;

		return tmp;
	}

	/**
	* gets details about the start and end
	* node boundaries
	*
	* @param {string} type
	* the format type
	*
	* @return {object}
	*/
	details (type) {
		this.slice();

		const startNode = this.DOM.nodeRoot(this.ctxStart, type);
		const endNode = this.DOM.nodeRoot(this.ctxEnd, type);
		const format = type;
		const cloned = this.range.cloneContents();
		const startFormat = startNode.nodeName.toLowerCase();
		const endFormat = endNode.nodeName.toLowerCase();

		// conditions
		const sameFormat = startNode.localName === type && endNode.localName === type;
		const containsFormat = cloned.querySelector(format) !== null;

		let sameNodes = startNode === endNode;

		if (startFormat === "p" && endFormat === "p") sameNodes = startFormat === "p" === endFormat === "p";

		const details = {
			startNode,
			endNode,
			sameNodes,
			sameFormat,
			containsFormat,
			format
		};

		return details;
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
	set (range, start, end, select) {
		this.range = range;
		this.ctxStart = start;
		this.ctxEnd = end;
		this.ctxSelect = select;
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
	* contains the selection range inside a
	* ctx-selection node
	*
	* @param {bool} contained
	* is the selection going to be contained
	* in a selection node: data-role="ctx-select"
	*
	* @return {void}
	*/
	contain (contained) {
		if (contained) {
			const selection = this.range.cloneContents();
			const selectedNodes = this.DOM.nodeTypesToString(selection.childNodes);

			if (selectedNodes.includes("p")) return;

			const content = this.range.extractContents();

			this.ctxSelect.appendChild(content);

			this.range.insertNode(this.ctxSelect);

			// clear any blank #text nodes
			this.#clearBlankText();

			this.ctxSelect.before(this.ctxStart);
			this.ctxSelect.after(this.ctxEnd);

			this.highlight();

			return;
		}

		if (!this.ctxSelect.textContent) return;

		this.range.selectNodeContents(this.ctxSelect);

		const extract = this.range.extractContents();

		this.ctxStart.after(extract);

		this.ctxSelect.remove();

		// clear any blank #text nodes
		this.#clearBlankText();
	}

	/**
	* removes blank text nodes wherever
	* a split may occur in the HTML
	*
	* @return {void}
	*/
	#clearBlankText () {
		const nextNode = this.ctxEnd.nextSibling;
		const prevNode = this.ctxStart.previousSibling;

		if (nextNode && nextNode.nodeName.match(/#text/) && !nextNode.textContent) {
			nextNode.remove();
		}

		if (prevNode && prevNode.nodeName.match(/#text/) && !prevNode.textContent) {
			prevNode.remove();
		}
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
	}

	/**
	* highlights the selection between the 
	* ctx-start and ctx-end boundaries
	*
	* @return {void}
	*/
	highlight () {
		this.range.setStartAfter(this.ctxStart);
		this.range.setEndBefore(this.ctxEnd);
	}

	/**
	* wraps the seletion in a specified format
	*
	* @param {string} type
	* the type of node to wrap the selection in
	*
	* @return {void}
	*/
	wrap (tag) {
		if (this.ctxSelect.textContent) {
			const formatNode = document.createElement(tag);

			this.range.selectNodeContents(this.ctxSelect);

			const extract = this.range.extractContents();

			formatNode.appendChild(extract);

			this.ctxSelect.appendChild(formatNode);

			return;
		}

		const startLine = this.DOM.getLine(this.ctxStart);
		const endLine = this.DOM.getLine(this.ctxEnd);

		// wrap multiline
		this.treeWalker.walkAtoB(startLine, endLine, ({ prev, current, next }) => {
			const formatNode = document.createElement(tag);

			if (!prev) {
				this.range.setStartAfter(this.ctxStart);
				this.range.setEnd(current, current.childNodes.length);

				const extract = this.range.extractContents();

				formatNode.appendChild(extract);

				this.ctxStart.after(formatNode);
			}

			else if (prev && next) {
				this.range.setStart(current, 0);
				this.range.setEnd(current, current.childNodes.length);

				const extract = this.range.extractContents();

				formatNode.appendChild(extract);

				current.appendChild(formatNode);
			}

			else if (prev && !next) {
				this.range.setStart(current, 0);
				this.range.setEndBefore(this.ctxEnd);

				const extract = this.range.extractContents();

				formatNode.appendChild(extract);

				this.ctxEnd.before(formatNode);
			}
		});
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

	/**
	* removes any tag that exists in the
	* selected content
	*
	* @param {string} tag
	* the tag to remove
	*
	* @return {void}
	*/
	exterminate (tag) {
		const nodeReg = this.#nodeReg(tag);

		if (this.ctxSelect.textContent) {
			const tmp = this.#tmp(this.ctxSelect.innerHTML);

			tmp.innerHTML = tmp.innerHTML.replace(nodeReg, "");

			this.ctxSelect.innerHTML = tmp.innerHTML;

			return;
		}

		const startLine = this.DOM.getLine(this.ctxStart);
		const endLine = this.DOM.getLine(this.ctxEnd);

		// wrap multiline
		this.treeWalker.walkAtoB(startLine, endLine, ({ prev, current, next }) => {
			const formatNode = document.createElement(tag);

			if (!prev) {
				this.range.setStartAfter(this.ctxStart);
				this.range.setEnd(current, current.childNodes.length);

				this.ctxSelect.appendChild(this.range.extractContents());
				this.ctxStart.after(this.ctxSelect);

				const tmp = this.#tmp(this.ctxSelect.innerHTML);

				tmp.innerHTML = tmp.innerHTML.replace(nodeReg, "");

				this.ctxSelect.innerHTML = tmp.innerHTML;

				this.range.selectNodeContents(this.ctxSelect);

				const extract = this.range.extractContents();

				this.ctxSelect.after(extract);
			}
			else if (prev && next) {
				this.range.setStart(current, 0);
				this.range.setEnd(current, current.childNodes.length);

				this.ctxSelect.appendChild(this.range.extractContents());
				current.appendChild(this.ctxSelect);

				const tmp = this.#tmp(this.ctxSelect.innerHTML);

				tmp.innerHTML = tmp.innerHTML.replace(nodeReg, "");

				this.ctxSelect.innerHTML = tmp.innerHTML;

				this.range.selectNodeContents(this.ctxSelect);

				const extract = this.range.extractContents();

				this.ctxSelect.after(extract);
			}
			else if (prev && !next) {
				this.range.setStart(current, 0);
				this.range.setEndBefore(this.ctxEnd);

				this.ctxSelect.appendChild(this.range.extractContents());
				this.ctxEnd.before(this.ctxSelect);

				const tmp = this.#tmp(this.ctxSelect.innerHTML);

				tmp.innerHTML = tmp.innerHTML.replace(nodeReg, "");

				this.ctxSelect.innerHTML = tmp.innerHTML;

				this.range.selectNodeContents(this.ctxSelect);

				const extract = this.range.extractContents();

				this.ctxSelect.after(extract);
			}
		});
	}
}
