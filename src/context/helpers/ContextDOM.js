export default class ContextDOM {
	/**
	* get a node of a particular tag
	*
	* @param {HTMLElement} start
	* the child node to start from
	*
	* @param {string} type
	* the node tag name to go back to via 
	* the node's ancestry
	*
	* @return {HTMLElement}
	*/
	nodeRoot (start, type) {
		let parent = start;

		while (parent) {
			if (parent.parentNode.nodeName.toLowerCase() === "body") return parent;

			if (parent.nodeName.toLowerCase() === type) return parent;

			parent = parent.parentNode;
		}
	}

	/**
	* gets a line which should be a block element
	* before the body
	*
	* @param {HTMLElement} start
	* the child element of the line
	*
	* @return {HTMLElement}
	*/
	getLine (start) {
		let parent = start;

		while (parent) {
			if (parent.parentNode && parent.parentNode.localName === "body") return parent;

			parent = parent.parentNode;
		}
	}

	nodeTypesToString (nodeList) {
		const nodes = [ ...nodeList ].map(node => node.nodeName.toLowerCase());

		return nodes;
	}
}
