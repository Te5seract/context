export default class CtxRange {
    /**
    * beginning of range reference
    *
    * @return {HTMLElement}
    */
    ctxStart () {
        const start = document.createElement("span");

        start.dataset.role = "ctx-start";

        return start;    
    }

    /**
    * end of range reference
    *
    * @return {HTMLElement}
    */
    ctxEnd () {
        const end = document.createElement("span");

        end.dataset.role = "ctx-end";

        return end
    }

    /**
    * wraps selection in a selection span
    *
    * @return {HTMLElement}
    */
    selection (content) {
        const sel = document.createElement("span");

        if (content) sel.appendChild(content);

        sel.dataset.role = "ctx-selection";

        return sel;
    }

    /**
    * get the main format nodes for
    * the boundary positions
    *
    * @return {array}
    */
    formatRoot () {
        return [ this.#formatRoot(this.start), this.#formatRoot(this.end) ];
    }

    /**
    * get the main format node
    *
    * @param {HTMLElement} start
    * the start slice item (ctxStart())
    *
    * @return {array}
    */
    #formatRoot (start) {
        let parent = start;

        while (parent) {
            if (parent.parentNode.localName === "body") return parent;

            if (parent.localName === this.format) return parent;

            parent = parent.parentNode;
        }

        return start;
    }

    /**
    * gets the start and end boundaries
    * from the editor's selection
    *
    * @return {array}
    */
    getSplitBoundaries () {
        if (!this.start && !this.end) return;

        return [ this.start, this.end ];
    }

    /**
    * get the text root (any parent node before the <body>)
    *
    * @param {HTMLElement} start
    * the HTMLElement to start from
    *
    * @return {HTMLElement}
    */
    root (start) {
        let parent = start;

        while (parent) {
            if (parent.parentNode.localName === "body") return parent;

            parent = parent.parentNode;
        }

        return start;
    }
}
