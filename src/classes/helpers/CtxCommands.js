import CtxRange from "./CtxRange.js";

export default class CtxCommands extends CtxRange {
    constructor ({ range, format }) {
        super();
        // instances

        // static
        this.start = super.ctxStart();
        this.end = super.ctxEnd();
        this.range = range;
        this.format = format;

        // regex
        this.formatReg = new RegExp(`<${ format }>|<\/${ format }>`, "g");

        // selection
        this.selection = super.selection();
    }

    /**
    * highlights between the start and end boundaries
    *
    * return {void}
    */
    select () {
        this.range.setStartAfter(this.start);
        this.range.setEndBefore(this.end);
    }

    /**
    * slices at the selection boundaries
    * by placing in reference nodes, eg:
    *
    * <span data-role="ctx-start"></span>
    * {selection content}
    * <span data-role="ctx-start"></span>
    *
    * @return {void}
    */
    slice () {
        const { startContainer, startOffset } = this.range;

        const cloned = this.range.cloneContents();

        if (!cloned.childNodes.length) return;

        this.range.collapse();
        this.range.insertNode(this.end);

        this.range.setStart(startContainer, startOffset);
        this.range.insertNode(this.start);

        this.range.setStartAfter(this.start);
        this.range.setEndBefore(this.end);
    }

    /**
    * removes start and end boundaries
    */
    unslice () {
        this.start.remove();
        this.end.remove();
    }

    /**
    * takes the selection from the start and 
    * end boundaries and wraps them in a "selection"
    * node, eg: 
    * <span data-role="ctx-start"></span>
    * <span data-role="ctx-selection">The selected content</span>
    * <span data-role="ctx-end"></span>
    *
    * @return {void}
    */
    wrapSelection () {
        this.selection.appendChild(this.range.extractContents());

        this.selection.innerHTML = this.selection.innerHTML.replace(this.formatReg, "");

        this.range.insertNode(this.selection);

        this.start.remove();
        this.end.remove();

        this.selection.before(this.start);
        this.selection.after(this.end);
    }

    /**
    * Moves the selection out of the selection wrapper
    * and between the start and end boundaries, eg:
    * <span data-role="ctx-start"></span>
    * The selected content
    * <span data-role="ctx-end"></span>
    */
    unwrapSelection () {
        this.range.selectNodeContents(this.selection);

        const flattened = this.range.extractContents();

        this.selection.after(flattened);
        this.selection.remove();

        this.cleanStartBoundary();
        this.cleanEndBoundary();
    }

    /**
    * moves the selection after
    * a specified node
    *
    * @param {HTMLElement} node
    * an HTML node to place the selection after
    *
    * @return {void}
    */
    moveSelectionAfter (node) {
        node.after(this.start);

        this.start.after(this.selection);

        this.selection.after(this.end);
    }

    /**
    * if the start boundary has the same node
    * on either side, eg: 
    * <em>exam</em>
    *<span data-role="ctx-start"></span>
    * <em>ple</em>
    *
    * they should be merged together, the nextNode
    * node from the <span> should be moved into
    * the previous node of the <span>, eg:
    * <em>
    *     exam
    *     <span data-role="ctx-start"></span>
    *     ple
    * </em>
    *
    * @return {void}
    */
    cleanStartBoundary () {
        const nextNode = this.start.nextSibling;
        const prevNode = this.start.previousSibling;

        // no next or previous nodes
        if (!nextNode || !prevNode) return;

        const nextName = nextNode.nodeName;
        const prevName = prevNode.nodeName;

        // next and previous nodes from the boundary are not of the same type
        if (nextName.match(/#text/i) || prevName.match(/#text/i)) return;

        // next and previous nodes from the boundary are of the same type
        if (nextName === prevName) {
            // select and move content of next to prev 
            this.range.selectNodeContents(prevNode)

            // tmp node to place the next node selection
            const tmp = document.createElement("span");

            tmp.appendChild(this.range.extractContents());

            // append next node selection to previous node
            //nextNode.appendChild(tmp);
            nextNode.insertBefore(tmp, nextNode.childNodes[0]);

            prevNode.remove();

            tmp.after(this.start);

            // move content out of tmp node and remove tmp node
            this.range.selectNodeContents(tmp);

            const tmpContent = this.range.extractContents();

            tmp.after(tmpContent);

            tmp.remove();

            return;
        }
    }

    /**
    * if the end boundary has the same node
    * on either side, eg: 
    * <em>exam</em>
    * <span data-role="ctx-end"></span>
    * <em>ple</em>
    *
    * they should be merged together, the previous
    * node from the <span> should be moved into
    * the next node of the <span>, eg:
    * <em>
    *     exam
    *     <span data-role="ctx-end"></span>
    *     ple
    * </em>
    *
    * @return {void}
    */
    cleanEndBoundary () {
        const nextNode = this.end.nextSibling;
        const prevNode = this.end.previousSibling;

        // no next or previous nodes
        if (!nextNode || !prevNode) return;

        const nextName = nextNode.nodeName;
        const prevName = prevNode.nodeName;

        // next and previous nodes from the boundary are not of the same type
        if (nextName.match(/#text/i) || prevName.match(/#text/i)) return;

        // next and previous nodes from the boundary are of the same type
        if (nextName === prevName) {
            // select and move content of next to prev 
            this.range.selectNodeContents(nextNode)

            // tmp node to place the next node selection
            const tmp = document.createElement("span");

            tmp.appendChild(this.range.extractContents());

            // append next node selection to next node
            prevNode.insertBefore(tmp, nextNode.childNodes[0]);

            nextNode.remove();

            tmp.before(this.end);

            // move content out of tmp node and remove tmp node
            this.range.selectNodeContents(tmp);

            const tmpContent = this.range.extractContents();

            tmp.after(tmpContent);

            tmp.remove();

            return;
        }
    }
}
