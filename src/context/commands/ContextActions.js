import ContextDOM from "../helpers/ContextDOM.js";
import ContextTreeWalker from "../helpers/ContextTreeWalker.js";

export default class ContextActions {
	constructor () {
		this.DOM = new ContextDOM();
		this.treeWalker = new ContextTreeWalker();
		this.ctxMultiSelect = [];
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
	* gets details about the start and end
	* node boundaries
	*
	* @param {string} type
	* the format type
	*
	* @return {object}
	*/
	details (type) {
		//this.slice();
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
	* a scout node to gather information about the
	* start of the selection area
	*
	* @return {HTMLElement}
	*/
	scoutStart () {
		const ctxScoutStart = document.createElement("span");

		ctxScoutStart.dataset.role = "ctx-scout-start";

		return ctxScoutStart;
	}

	/**
	* a scout node to gather information about the
	* end of the selection area
	*
	* @return {HTMLElement}
	*/
	scoutEnd () {
		const ctxScoutEnd = document.createElement("span");

		ctxScoutEnd.dataset.role = "ctx-scout-end";

		return ctxScoutEnd;
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

		if (prevNode && prevNode.nodeName.match(/#text/) && !prevNode.textContent) {
			prevNode.remove();
		}

		if (nextNode && nextNode.nodeName.match(/#text/) && !nextNode.textContent) {
			nextNode.remove();
		}
	}
}
