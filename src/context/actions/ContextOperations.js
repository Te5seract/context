export default class ContextOperations {
    constructor (actions) {
        const { 
            range,
            ctxStart,
            ctxEnd,
            select
        } = actions;

        this.range = range;

        // context ref
        this.ctxStart = ctxStart;
        this.ctxEnd = ctxEnd;

        // libs
        this.select = select;
    }

    /**
    * moves the contents of one node into 
    * another node
    *
    * @param {HTMLElement} node
    * the node to get the contents of
    *
    * @param {HTMLElement} target
    * where to move the node contents to
    *
    * @param {string} mode
    * @param {string} mode
    * the mode to move can be:
    * append or add or suffic or after
    * prepend or before or prefix or shift
    *
    * @return {void}
    */
    moveContentsTo (node, target, mode) {
        this.range.selectNodeContents(node);

        const extract = this.range.extractContents();

        if (mode.match(/append|add|suffix|after/i)) {
            target.appendChild(extract);
        }
        else if (mode.match(/prepend|before|prefix|shift/)) {
            target.childNodes[0].before(extract);
        }

        node.remove();
    }

    /**
    * extracts the content before and after
    * the ctxSelect node (excluding the 
    * start and end boundaries) and returns
    * an array with the before and after 
    * points of the selection
    *
    * @param {HTMLElement} node
    * an ancestor node that contains the 
    * selection nodes
    *
    * @return {array}
    */
    surrounds (node) {
        const nodeType = node.nodeName.toLowerCase();

        this.range.setStartBefore(node);
        this.range.setEndBefore(this.ctxStart);

        const extractBefore = this.range.extractContents();

        this.range.setStartAfter(this.ctxEnd);
        this.range.setEndAfter(node);

        const extractAfter = this.range.extractContents();

        this.select.boundaries();

        return [ extractBefore, extractAfter ];
    }

    /**
    * creates an HTML element
    *
    * @param {string} type
    * the node to create
    *
    * @param {object} attrs
    * an object (key value pairs) of 
    * attributes
    *
    * @param {HTMLELement} inner
    * the inner content of the node
    *
    * @return {HTMLElement}
    */
    createNode (type, attrs, inner) {
        const node = document.createElement(type);
        const attrKeys = attrs && Object.keys(attrs) ? Object.keys(attrs) : [];

        attrKeys.forEach(key => {
            if (key.match(/class|classname/i)) {
                node.classList.add(attrs[key]);
            }

            node.setAttribute(key, attrs[key]);
        });

        if (inner) {
            node.appendChild(inner);

            return node;
        }

        return node;
    }

    /**
    * a burner method to execute other class
    * methods from
    *
    * @return {self}
    */
    chain () {
        return this;
    }
}
