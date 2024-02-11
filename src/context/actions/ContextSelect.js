export default class ContextSelect {
    constructor (actions) {
        const { 
            details,
            ctxStart,
            ctxSelect,
            ctxEnd,
            range,
            DOM,
            treeWalker,
            optimize
        } = actions;

        this.details = details;

        // libs
        this.optimize = optimize;

        // context ref
        this.ctxStart = ctxStart;
        this.ctxEnd = ctxEnd;
        this.ctxSelect = ctxSelect;

        // range
        this.range = range;

        // helpers
        this.DOM = DOM;
        this.treeWalker = treeWalker;
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
    get (callback, steps) {
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

        return this.select;
    }

    /**
    * selects a specified node and wraps
    * it in the ctxSelect node with the 
    * ctxStart and ctxEnd boundaries
    *
    * @param {HTMLElement} node
    * the node to select
    *
    * @return {void}
    */
    node (node) {
        this.range.selectNodeContents(this.ctxSelect);

        const selExtract = this.range.extractContents();

        this.ctxSelect.after(selExtract);
        this.ctxSelect.remove();

        node.before(this.ctxStart);
        node.after(this.ctxEnd);
        this.select.highlight();

        const extractStart = this.range.extractContents();

        this.ctxSelect.appendChild(extractStart);

        this.ctxStart.after(this.ctxSelect);

        return this.select;
    }

    /**
    * highlights the boundaries between
    * the ctxStart and ctxEnd
    *
    * @return {void}
    */
    highlight (node) {
        if (!node) {
            this.range.setStartAfter(this.ctxStart);
            this.range.setEndBefore(this.ctxEnd);

            return this.select;
        }

        this.range.selectNodeContents(node);

        const extract = this.range.extractContents();

        this.ctxSelect.appendChild(extract);
        this.ctxSelect.before(this.ctxStart);
        this.ctxSelect.after(this.ctxEnd);

        this.select.highlight();

        return this.select;
    }

    /**
    * wraps the selection in the ctxSelect node
    *
    * @return {void}
    */
    set () {
        const extract = this.range.extractContents();

        this.ctxSelect.appendChild(extract);

        this.range.insertNode(this.ctxSelect);

        return this.select;
    }

    /**
    * sets the start and end boundaries
    * the selection must be in place 
    * before this method is used (setSelection())
    *
    * @return {void}
    */
    boundaries (active) {
        if (active) {
            this.ctxSelect.before(this.ctxStart);
            this.ctxSelect.after(this.ctxEnd);

            return this.select;
        }

        this.ctxStart.remove();
        this.ctxEnd.remove();

        return this.select;
    }

    /**
    * gets the before and after siblings and 
    * their format types of the selection 
    * boundaries
    *
    * the selection boundaries must be set
    *
    * @return {object}
    */
    siblings () {
        if (!this.cxtStart && !this.ctxEnd) throw new Error("CTX boundaries have not been set");

        let prevNode = this.ctxStart.previousSibling;
        let prevFormat = prevNode && !prevNode.nodeName.match(/#text/) ? prevNode.nodeName.toLowerCase() : null;
        let nextNode = this.ctxEnd.nextSibling;
        let nextFormat = nextNode && !nextNode.nodeName.match(/#text/) ? nextNode.nodeName.toLowerCase() : null;

        if (!nextFormat) { 
            const nextFormatNode = this.DOM.nodeRoot(this.ctxEnd, this.format); 
            nextFormat = nextFormatNode.nodeName.toLowerCase() === this.format ? nextFormatNode.nodeName.toLowerCase() : null;
            nextNode = nextFormat ?  nextFormatNode : nextNode;
        }

        if (!prevFormat) { 
            const prevFormatNode = this.DOM.nodeRoot(this.ctxStart, this.format); 
            prevFormat = prevFormatNode.nodeName.toLowerCase() === this.format ? prevFormatNode.nodeName.toLowerCase() : null;
            prevNode = prevFormat ? prevFormatNode : prevNode;
        }

        return { 
            prev : { 
                prevNode,
                prevFormat
            },
            next : {
                nextNode,
                nextFormat
            }
        };
    }

    /**
    * moves the selection to another node
    *
    * @param {HTMLElement} node
    * the node to move the selection to
    *
    * @param {string} mode
    * the mode to move can be:
    * append or add or suffic or after
    * prepend or before or prefix or shift
    *
    * @return {void}
    */
    moveTo (node, mode) {
        if (mode.match(/append|add|suffix|after/i)) {
            node.appendChild(this.ctxSelect);
        }
        else if (mode.match(/prepend|before|prefix|shift/)) {
            node.childNodes[0].before(this.ctxSelect);
        }

        this.select.boundaries(true);

        return this.select;
    }

    /**
    * clears the ctxSelect node, boundary nodes
    * have to be established for this method to be 
    * used effectively
    *
    * @param {HTMLElement} [fragment]
    * (optional) only used for multiline selections
    * a fragment expected to contain a start 
    * boundary or an end boundary, this is for
    * multiline selections
    *
    * @return {void}
    */
    clear (fragment) {
        if (!fragment) {
            this.range.selectNodeContents(this.ctxSelect);

            const clearSelExtract = this.range.extractContents();

            this.ctxSelect.after(clearSelExtract);

            this.ctxSelect.remove();

            return this.select;
        }

        this.range.selectNodeContents(this.ctxSelect);

        const selectExtract = this.range.extractContents();

        if (fragment.querySelector(`[data-role="ctx-start"]`)) {
            this.ctxSelect.before(this.ctxStart);
        }
        else if (fragment.querySelector(`[data-role="ctx-end"]`)) {
            this.ctxSelect.after(this.ctxEnd);
        }

        this.ctxSelect.after(selectExtract);

        this.ctxSelect.remove();

        return this.select;
    }

    /**
    * a burner method to execute other class
    * methods from
    *
    * @return {self}
    */
    chain () {
        return this.select;
    }
}
