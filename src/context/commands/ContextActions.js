import ContextDOM from "../helpers/ContextDOM.js";

export default class ContextActions {
	constructor () {
		this.DOM = new ContextDOM();
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
	set (range, start, end) {
		this.range = range;
		this.ctxStart = start;
		this.ctxEnd = end;
		this.selectionActive = false;
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
	* contains the selection range inside a
	* ctx-selection node
	*/
	contain () {
		// if the container is already set, remove it
		// and select the content between range 
		// boundaries again
		if (this.container) {
			this.range.selectNodeContents(this.container);

			const extraction = this.range.extractContents();

			this.container.after(extraction);

			this.container.remove();

			this.range.setStartAfter(this.ctxStart);
			this.range.setEndBefore(this.ctxEnd);
		}

		// contain the selection
		this.container = document.createElement("span");

		const content = this.range.extractContents();

		this.container.dataset.role = "ctx-selection";

		this.container.appendChild(content);

		this.ctxStart.after(this.container);
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

	details () {
		const details = {};

		this.slice();
	}
}
