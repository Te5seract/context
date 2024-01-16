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

    getFormats (start, exclude) {
        const parentFormats = [];

        let parent = start;

        while (parent) {
            parent = parent.parentNode;

            if (parent.parentNode && parent.parentNode.nodeName.toLowerCase() === "body") break;

            if (exclude && parent.nodeName.toLowerCase() !== exclude) parentFormats.push(parent.nodeName.toLowerCase());
            else if (!exclude) parentFormats.push(parent.nodeName.toLowerCase());
        }

        return parentFormats;
    }

    getRootFormat (start) {
        let parent = start;

        while (parent) {
            parent = parent.parentNode;

            if (parent.parentNode && parent.parentNode.parentNode.nodeName.toLowerCase() === "body") return parent;
        }
    }

	nodeTypesToString (nodeList) {
		const nodes = [ ...nodeList ].map(node => node.nodeName.toLowerCase());

		return nodes;
	}

    /**
    * gets the ancestor nodes from a reference child
    * node as a string
    *
    * @param {HTMLElement} start
    * the node to start the ancestor lookup from
    *
    * @return {array}
    */
    getParentsStr (start) {
        let parent = start;
        const parents = [];

        while (parent) {
            if (parent && parent.nodeName.toLowerCase() === "body") break;

            if (!parent.nodeName.match(/#text/)) parents.push(parent.nodeName.toLowerCase());

            parent = parent.parentNode;
        }

        return parents;
    }

    /**
    * gets the ancestor nodes from a reference child
    * node as HTML Elements
    *
    * @param {HTMLElement} start
    * the node to start the ancestor lookup from
    *
    * @return {array}
    */
    getParents (start) {
        let parent = start;
        const parents = [];

        while (parent) {
            if (parent && parent.nodeName.toLowerCase() === "body") break;

            if (!parent.nodeName.match(/#text/)) parents.push(parent);

            parent = parent.parentNode;
        }

        return parents;
    }
}
