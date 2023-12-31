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
		this.slice();

		const startNode = this.DOM.nodeRoot(this.ctxStart, type);
		const endNode = this.DOM.nodeRoot(this.ctxEnd, type);
		const format = type ? type : "";
		const cloned = this.range.cloneContents();
		const startFormat = startNode.nodeName.toLowerCase();
		const endFormat = endNode.nodeName.toLowerCase();
		const selectedNodes = this.DOM.nodeTypesToString(cloned.childNodes);
		const allSelectedNodes = this.DOM.nodeTypesToString(cloned.querySelectorAll("*"));
		const clonedChildren = [ ...cloned.childNodes ];
		const selectionPattern = selectedNodes.length && selectedNodes.join(" ");
		const walkedNodes = [];

		let startFound = false;

		if (startNode.nodeName.toLowerCase() === "p") {
			this.treeWalker.walkAtoB(startNode.childNodes[0], endNode, ({ current }) => {
				walkedNodes.push(current);
			});
		}

		else if (selectionPattern.match(/(| )p(| ){1,}/g)) {
			clonedChildren.forEach(node => {
				this.treeWalker.walkAtoB(node.childNodes[0], null, ({ current }) => {
					walkedNodes.push(current);
				});
			});
		}

		else if (!startNode.nodeName.toLowerCase() !== "p") {
			this.treeWalker.walkAtoB(startNode, endNode, ({ current }) => {
				walkedNodes.push(current);
			});
		}

		const walked = this.DOM.nodeTypesToString(walkedNodes);
		const formatsOnly = walked.filter(walk => walk === format)
		const percentOfFormat = Math.ceil(( 100 * formatsOnly.length ) / walked.length);

		// bias
		let bias = "";
		let selectType = "";

		if (this.ctxStart.nextSibling) selectType = this.ctxStart.nextSibling.nodeName.toLowerCase();

		if (startFormat === format && endFormat === format) bias = "right,left";
		else if (startFormat === format && endFormat !== format) bias = "left";
		else if (endFormat === format && startFormat !== format) bias = "right";

		const nextNode = this.ctxEnd.nextSibling;
		const prevNode = this.ctxStart.previousSibling;
		const nextFormat = nextNode && nextNode.nodeName.toLowerCase();
		const prevFormat = prevNode && prevNode.nodeName.toLowerCase();

		if (!bias && nextFormat === format && prevFormat !== format) bias = "right";
		else if (!bias && nextFormat === format && prevFormat === format) bias = "right,left";
		else if (!bias && prevFormat === format && nextFormat !== format) bias = "left";

		// conditions
		const isMultiline = selectedNodes.includes("p");
		const isSameNode = startNode === endNode;
		const isSameFormat = startFormat === endFormat && startFormat === format && endFormat === format;
		const containsFormat = Math.ceil( ( 100 * formatsOnly.length ) / walked.length ) > 50;
		const formatDominance = percentOfFormat;

		const details = {
			startNode,
			endNode,
			prevNode,
			nextNode,
			format,
			cloned,
			startFormat,
			endFormat,
			selectedNodes,
			allSelectedNodes,
			selectionPattern,
			bias,
			selectType,
			nextFormat,
			prevFormat,

			// conditions
			isMultiline,
			isSameNode,
			isSameFormat,
			containsFormat,
			percentOfFormat
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

	/**
	* contains a multiline selection
	* provides values to the this.ctxMultiSelect 
	* array
	*
	* @return {void}
	 */
	#containMultiline (contained) {
		if (contained) {
			const start = this.DOM.getLine(this.ctxStart);
			const end = this.DOM.getLine(this.ctxEnd);

			this.treeWalker.walkAtoB(start, end, ({ prev, current, next }) => {
				const container = document.createElement("span");
				container.dataset.role = "ctx-multi-select";

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

				const extract = this.range.extractContents();

				container.appendChild(extract);

				this.range.insertNode(container);

				this.ctxMultiSelect.push(container);

				this.range.collapse();
			});

			return;
		}

		if (this.ctxMultiSelect.length) {
			this.ctxMultiSelect.forEach(select => {
				this.range.selectNodeContents(select);

				const extract = this.range.extractContents();

				select.after(extract);

				select.remove();
			});

			this.ctxMultiSelect = [];
		}
	}

	/**
	* contains the selection in either a 
	* ctx-select node or a ctx-multi-select
	* node
	*
	* @param {bool} [contained]
	* is the selection going to be contained 
	* in the ctx-select or ctx-multi-select
	* node
	*
	* if this param is not defined it will
	* assume there is a selection and will
	* unwrap it
	*
	* @return {void}
	*/
	contain (contained) {
		const { isMultiline } = this.details;

		if (contained) {
			// multiline selection
			if (isMultiline) {
				this.#containMultiline(contained);

				return;
			}

			// single line selection
			const extract = this.range.extractContents();

			this.ctxSelect.appendChild(extract);

			this.range.insertNode(this.ctxSelect);

			this.resetSlice();

			return;
		}

		if (isMultiline) {
			this.#containMultiline();

			return;
		}

		this.range.selectNodeContents(this.ctxSelect);

		const extract = this.range.extractContents();

		this.ctxSelect.after(extract);

		this.ctxSelect.remove();
	}

	/**
	* moves the select focus from one
	* node to another spcified in the
	* first param
	*
	* @param {HTMLElement} node
	* where to shift the ctxSelect
	* content to
	*
	* @return {void}
	*/
	moveFocus (node) {
		this.contain();

		this.range.selectNodeContents(node);

		this.contain(true);
	}

	/**
	* depending on the bias (left), this will store
	* the selected formatting from before
	* the ctx-start node to be merged with
	* the ctx-select version of it so there are 
	* no duplicate nodes, eg:
	*
	* <em>Example</em><em> Another example</em>
	* becomes:
	* <em>Example Another example</em>
	*
	* @return {void}
	*/
	saveBefore () {
		const { startNode, startFormat, bias, format } = this.details;

		if (!bias.match(/left/i)) return;

		if (startFormat === format) {
			this.exterminate(startNode, format);

			this.range.selectNodeContents(startNode);

			const extract = this.range.extractContents();

			this.beforeExtract = extract;

			startNode.remove();

			return;
		}

		const prevSib = this.ctxStart.previousSibling;

		if (prevSib.nodeName.toLowerCase() === format) {
			this.exterminate(prevSib, format);

			this.range.selectNodeContents(prevSib);

			const extract = this.range.extractContents();

			this.beforeExtract = extract;

			prevSib.remove();
		}
	}

	/**
	* depending on the bias (right), this will store
	* the selected formatting from after
	* the ctx-end node to be merged with
	* the ctx-select version of it so there are 
	* no duplicate nodes, eg:
	*
	* <em>Example</em><em> Another example</em>
	* becomes:
	* <em>Example Another example</em>
	*
	* @return {void}
	*/
	saveAfter () {
		const { endNode, endFormat, bias, format } = this.details;

		if (!bias.match(/right/i)) return;

		if (endFormat === format) {
			this.exterminate(endNode, format);

			this.range.setStart(endNode, 0);
			this.range.setEnd(endNode, endNode.childNodes.length);
			
			this.afterExtract = this.range.extractContents();

			endNode.remove();

			return;
		}

		const nextNode = this.ctxEnd.nextSibling;

		if (nextNode && nextNode.nodeName.toLowerCase() === format) {
			this.exterminate(nextNode, format);

			this.range.selectNodeContents(nextNode);

			const extract = this.range.extractContents();

			this.afterExtract = extract;

			nextNode.remove();
		}
	}

	/**
	* wrap the selected text in another
	* type of node
	*
	* @param {string} tag
	* the HTML tag type to wrap the 
	* selection in
	*
	* @return {void}
	*/
	wrap (tag) {
		if (!this.ctxMultiSelect.length) {
			const formatNode = document.createElement(tag);

			this.range.selectNodeContents(this.ctxSelect);

			const extract = this.range.extractContents();

			formatNode.appendChild(extract);

			this.ctxSelect.appendChild(formatNode);

			this.exterminate(formatNode, tag);

			this.highlight();

			this.saveAfter();
			this.saveBefore();

			this.#addSurroundingExtracts();

			return;
		} 

		this.ctxMultiSelect.forEach(select => {
			const formatNode = document.createElement(tag);

			this.range.selectNodeContents(select);

			const extract = this.range.extractContents();

			formatNode.appendChild(extract);

			this.ctxSelect.appendChild(formatNode);

			select.after(this.ctxSelect);

			this.exterminate(formatNode, tag);

			//this.highlight();

			//this.saveAfter();
			//this.saveBefore();

			//this.#addSurroundingExtracts();

			this.range.selectNodeContents(this.ctxSelect);

			this.ctxSelect.after(this.range.extractContents());

			this.ctxSelect.remove();

			this.highlight();

			////////

			//this.range.selectNodeContents(select);

			//const extract = this.range.extractContents();

			//formatNode.appendChild(extract);

			//this.exterminate(formatNode, tag);

			//select.appendChild(formatNode);
		});
	}

	exterminate (node, tag) {
		node.innerHTML = node.innerHTML.replace(this.#nodeReg(tag), "");
	}

	/**
	* filters out specified formatting
	* from the range selection
	*
	* @param {DocumentFragment} extract
	* range selection
	*
	* @param {string} tag
	* the HTML tag type to filter out
	*
	* @return {DocumentFragment}
	*/
	filterExtract (extract, tag) {
		const tmp = this.#tmp(extract);

		tmp.innerHTML = tmp.innerHTML.replace(this.#nodeReg(tag), "");

		this.range.selectNodeContents(tmp);
		
		const tmpExtract = this.range.extractContents();

		//tmp.remove();

		return tmpExtract;
	}

	/**
	* places the afterExtract after the ctxEnd
	* node and the beforeExtract before the 
	* ctxStart node
	*
	* @return {void}
	*/
	#addSurroundingExtracts () {
		const selChild = this.ctxSelect.childNodes[0];

		this.moveFocus(selChild);

		if (this.afterExtract) {
			this.ctxEnd.after(this.afterExtract);
		}

		if (this.beforeExtract) {
			this.ctxStart.before(this.beforeExtract);
		}
	}

	/**
	* resets the slice boundaries to
	* make absolutely sure that it 
	* surrounds the selection
	*
	* @return {void}
	*/
	resetSlice () {
		this.ctxSelect.before(this.ctxStart);
		this.ctxSelect.after(this.ctxEnd);
	}

	/**
	* highlights between the ctx-start
	* and ctx-end boundaries
	*
	* @return {void}
	*/
	highlight () {
		this.range.setStartAfter(this.ctxStart);
		this.range.setEndBefore(this.ctxEnd);
	}

	/**
	* removes the ctx-start and ctx-end
	* boundaries
	*
	* @return {void}
	*/
	deselect () {
		this.ctxStart.remove();
		this.ctxEnd.remove();
	}
}
