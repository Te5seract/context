export default class ContextOptimize {
    constructor (actions) {
        const { 
            details,
            ctxStart,
            ctxSelect,
            ctxEnd,
            range,

            // libs
            select,
            operation
        } = actions;

        this.details = details;

        // libs
        this.select = select;
        this.operation = operation;

        // context ref
        this.ctxStart = ctxStart;
        this.ctxEnd = ctxEnd;
        this.ctxSelect = ctxSelect;

        // range
        this.range = range;
    }

    ///////////////////////////////////
    // -- private
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
	nodeReg (tag) {
		return new RegExp(`<${ tag }>|<\/${ tag }>`, "gi");
	}

    /**
    * unnests nested formats and removes
    * empty nodes
    *
    * @return {void}
    */
    optimizeSelection () {
        if (this.ctxStart.previousSibling && !this.ctxStart.previousSibling.nodeName.toLowerCase() === this.format) this.remove(this.ctxStart.previousSibling, this.format);
        if (this.ctxEnd.nextSibling && !this.ctxEnd.nextSibling.nodeName.toLowerCase() === this.format) this.remove(this.ctxEnd.nextSibling, this.format);

        if (this.ctxStart.previousSibling && this.ctxStart.previousSibling.nodeName.match(/#text/) && !this.ctxStart.previousSibling.textContent) this.ctxStart.previousSibling.remove();
        if (this.ctxEnd.nextSibling && !this.ctxEnd.nextSibling.nodeName.match(/#text/) && !this.ctxEnd.nextSibling.textContent) this.ctxEnd.nextSibling.remove();
    }

    /**
    * merges nodes that are of the same type
    * and are siblings within a selection context
    *
    * @param {string} tag
    * the tag name
    *
    * @return {bool}
    */
    mergeBias (tag) {
        const { prev, next } = this.select.siblings();
        const { prevFormat, prevNode } = prev;
        const { nextFormat, nextNode } = next;

        if (nextFormat !== tag && prevFormat !== tag) return false;

        this.select.set();

        if (prevFormat === tag && nextFormat !== tag) {
            this.select.moveTo(prevNode, "append");

            return true;
        }
        else if (nextFormat === tag && prevFormat !== tag) {
            this.select.moveTo(nextNode, "before");

            return true;
        }
        else if (nextFormat === tag && prevFormat === tag) {
            this.select.moveTo(prevNode, "append");
            this.operation.moveContentsTo(nextNode, prevNode, "append");

            return true;
        }
    }

    insertBias () {
        const { caretPrev, caretNext, caretNextFormat, caretPrevFormat } = this.details;

        if (caretNextFormat === this.format) {
            this.range.selectNodeContents(caretNext);
            this.ctxCaret.remove();

            const extract = this.range.extractContents();

            caretNext.innerHTML = "&#xFEFF;";
            caretNext.appendChild(extract);

            this.editor.body.focus();
            
            return true;
        }
    }

    /**
    * removes particular node types from 
    * the selection
    *
    * @param {HTMLElement} node
    * the node to remove other nodes
    * from within
    *
    * @param {string} type
    * the type of node to remove from the
    * first param's child list
    *
    * @return {void}
    */
    remove (node, type) {
        node.innerHTML = node.innerHTML.replace(/<\w+><\/\w+>/g, "");
        node.innerHTML = node.innerHTML.replace(this.optimize.nodeReg(type), "");
    }
}
