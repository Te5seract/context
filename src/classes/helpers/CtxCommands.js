import CtxRange from "./CtxRange.js";

export default class CtxCommands extends CtxRange {
    constructor ({ range, format }) {
        super();

        // static
        this.start = super.ctxStart();
        this.end = super.ctxEnd();
        this.range = range;
        this.format = format;

        // regex
        this.formatReg = new RegExp(`<${ format }>|<\/${ format }>`, "g");
        this.formatDuplicateReg = new RegExp(`<\/(\\w+)><(\\w+)>`, "g");

        // selection
        this.selection = super.selection();

        // dynamic
        this.storage = {};
    }

    /**
    * highlights between the start and end boundaries
    *
    * return {void}
    */
    select () {
        this.range.setStartAfter(this.start);
        this.range.setEndBefore(this.end);

        this.clearEmptyNodes()

        this.start.remove();
        this.end.remove();
    }

    /**
    * removes start and end points
    *
    * @return {void}
    */
    remove () {
        if (this.start) {
            this.start.remove();
        }

        if (this.end) {
            this.end.remove();
        }
    }

    /**
    * gets the node before the start node, 
    * and the node after the end node
    * eg:
    *
    * {HTMLElement} <- node before start
    * <span data-role="ctx-start"></span>
    * {selection content}
    * <span data-role="ctx-end"></span>
    * {HTMLElement} <- node after end
    *
    * @return {array}
    */
    getNodesBeforeSelection (node) {
        const start = node ? node : this.start;
        const end = node ? node : this.end;

        const prevNode = start.previousSibling && start.previousSibling.nodeName.match(/text/i) && start.previousSibling.textContent === "" ? start.previousElementSibling : start.previousSibling;
        const nextNode = end.nextSibling && end.nextSibling.nodeName.match(/text/i) && end.nextSibling.textContent === "" ? end.nextElementSibling : end.nextSibling;

        return [ prevNode, nextNode ];
    }

    /**
    * gets the node after the end node, eg:
    *
    * <span data-role="ctx-start"></span>
    * {HTMLElement} <- node after end
    *
    * @return {HTMLElement|null}
    */
    moveSelectionBlock (direction, node) {
        //const [ prev, next ] = this.getNodesBeforeSelection(node);

        if (direction.match(/back|backwards|previous|prev/i)) {
            node.appendChild(this.selection);
            this.selection.before(this.start);
            this.selection.after(this.end);

            const next = this.getNodesBeforeSelection(node)[1];

            // if two of the same nodes join after this move
            // eg: <strong>example {moved content}</strong>{moved content from here}<strong> other content</strong>
            // should become: <strong>example {moved content} other content</strong>
            if (next && next.nodeName === node.nodeName) {
                this.range.selectNodeContents(node);
                const selection = this.range.extractContents();

                next.childNodes[0].before(selection);
                node.remove();
            }
        }

        if (direction.match(/forward|forwards|next/i)) {
            node.childNodes[0].before(this.selection);
            this.selection.before(this.start);
            this.selection.after(this.end);

            const prev = this.getNodesBeforeSelection(node)[0];

            if (prev && prev.nodeName === node.nodeName) {
                this.range.selectNodeContents(node);
                const selection = this.range.extractContents();

                prev.append(selection);
                node.remove();
            }
        }
    }

    /**
    * clears empty nodes from the document
    * checks the siblings of the start and end nodes
    * for empty nodes
    *
    * @return {void}
    */
    clearEmptyNodes () {
        const stPrevNode = this.start.previousSibling;
        const stNextNode = this.start.nextSibling;
        const enPrevNode = this.end.previousSibling;
        const enNextNode = this.end.nextSibling;

        if (stPrevNode && stPrevNode.textContent === "") {
            stPrevNode.remove();
        }

        if (stNextNode && stNextNode.textContent === "") {
            stNextNode.remove();
        }

        if (enPrevNode && enPrevNode.textContent === "") {
            enPrevNode.remove();
        }

        if (enNextNode && enNextNode.textContent === "") {
            enNextNode.remove();
        }
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

        const formats = [];

        // get all node names from the selection
        [ ...this.selection.querySelectorAll("*") ].forEach(node => {
            if (!formats.includes(node.nodeName.toLowerCase())) {
                formats.push(node.nodeName.toLowerCase());
            }
        });

        // remove duplicate nodes, eg: 
        // <em>example</em><em> text</em>
        // becomes:
        // <em>example text</em>
        formats.forEach((node, i) => {
            const nodeReg = new RegExp(`<\/${ formats[i] }><${ formats[i] }>`, "g");
            const emptyReg = new RegExp(`<${ formats[i] }><\/${ formats[i] }>`, "g");

            this.selection.innerHTML = this.selection.innerHTML.replace(nodeReg, "");
            this.selection.innerHTML = this.selection.innerHTML.replace(emptyReg, "");
        });

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
    * wraps a selection fragment in a specified node
    *
    * @param {string} format
    * the node type to wrap the selection in
    *
    * @param {DocumentFragment} fragment
    * the document fragment to wrap
    *
    * @return {self}
    */
    wrap (format, fragment) {
        const formatted = document.createElement(format);

        formatted.appendChild(fragment);

        formatted.innerHTML = formatted.innerHTML.replace(this.formatReg, "");

        return formatted;
    }

    /**
    * extract content before selection, eg:
    * <em>
    *     {everything here is extracted} 
    *     <span data-role="ctx-start"></span>
    *         <span>
    *             <span data-role="ctx-selection">an exam</span>
    *         </span>
    *     <span data-role="ctx-end"></span>
    *     ple format
    * </em>
    *
    * @param {HTMLElement} node
    * the node to extract the before contents from
    *
    * @return {void}
    */
    extractBeforeSelection (node) {
        this.range.setStartBefore(node);
        this.range.setEndBefore(this.start);

        this.before = this.range.extractContents();
    }

    /**
    * extract content before selection, eg:
    * <em>
    *     This is 
    *     <span data-role="ctx-start"></span>
    *         <span>
    *             <span data-role="ctx-selection">an exam</span>
    *         </span>
    *     <span data-role="ctx-end"></span>
    *     {everything here is extracted} 
    * </em>
    *
    * @param {HTMLElement} node
    * the node to extract the before contents from
    *
    * @return {void}
    */
    extractAfterSelection (node) {
        this.range.setStartAfter(this.end);
        this.range.setEndAfter(node);

        this.after = this.range.extractContents();
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
