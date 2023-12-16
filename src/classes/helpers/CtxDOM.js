export default class CtxDOM {
    constructor ({ editor, format }) {
        this.editor = editor;
        this.format = format;
    }

    /**
    * gets the end node of the boundary
    *
    * @return {HTMLElement}
    */
    start () {
        const start = this.editor.querySelector(`[data-role="ctx-start"]`);

        return start || null;
    }

    /**
    * gets the start node of the boundary
    *
    * @return {HTMLElement}
    */
    end () {
        const end = this.editor.querySelector(`[data-role="ctx-end"]`);

        return end || null;
    }

    /**
    * gets the start and end boundaries
    * from the editor's selection
    *
    * @return {array}
    */
    getSplitBoundaries () {
        if (!this.start() && !this.end()) return;

        return [ this.start(), this.end() ];
    }

    /**
    * get the main format nodes for
    * the boundary positions
    *
    * @return {array}
    */
    formatRoot () {
        return [ this.#formatRoot(this.start()), this.#formatRoot(this.end()) ];
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
