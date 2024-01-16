import ContextActionExtension from "./ContextActionExtension.js";

/**
* @namespace Actions
*
* this class adds formatting methods to the 
* ContextActions class
*/
export default class ContextFormatActions extends ContextActionExtension {
    constructor (actions, details) {
        super();

        this.details = details;

        this.setMethods(actions);
    }

    /**
    * wraps a selection in the format
    *
    * @return {void}
    */
    wrap () {
        const { isMultiline } = this.details;
        const formats = [];

        this.getSelection(() => {
            const formatNode = document.createElement(this.format);
            const extract = this.range.extractContents();

            formatNode.appendChild(extract);

            this.exterminate(formatNode, this.format);

            this.ctxSelect.appendChild(formatNode);

            this.range.insertNode(this.ctxSelect);

            if (!isMultiline) {
                this.ctxSelect.before(this.ctxStart);
                this.ctxSelect.after(this.ctxEnd);
            }

            this.range.selectNodeContents(this.ctxSelect);

            const extractSelect = this.range.extractContents();

            this.ctxSelect.after(extractSelect);

            formats.push(formatNode);

            this.ctxSelect.remove();
        });
    }

    /**
    * unwraps a particular format from
    * the selection
    *
    * @return {void}
    */
    unwrap () {
        const {
            startNode,
            isMultiline
        } = this.details;

        if (isMultiline) {
            this.getSelection(line => {
                this.setSelection();

                this.exterminate(this.ctxSelect, this.format);

                this.clearSelection(line);
            });

            return;
        }

        this.getSelection(() => {
            this.setSelection();

            const containsFormat = this.ctxSelect.querySelector(this.format);

            if (containsFormat) {
                this.exterminate(this.ctxSelect, this.format);

                this.clearSelection();

                return;
            }

            // extractSurrounds(root)
            // get the overall surrounding format
            // clear the content before and after the selection
            const root = this.DOM.getRootFormat(this.ctxSelect)
            const rootNode = root.nodeName.toLowerCase();
            const [ before, after ] = this.extractSurrounds(root);

            // selectNode(startNode)
            // wrap the root format
            //this.selectNode(startNode)
            this.selectNode(root)

            // insert before and after content
            this.ctxStart.before(before);
            this.ctxEnd.after(after);

            // IMPORTANT NEXT TASK
            // here, there should be a test to see if the the content before
            // the selection has the same wrapper node as the content inside
            // the ctxSelect node, at the moment the before and after will
            // match the selection, meaning that there will be duplicate
            // siblings

            // take content out of select and remove select below...
            this.clearSelection();
        });
    }
}
