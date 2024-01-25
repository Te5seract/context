import ContextActionExtension from "./ContextActionExtension.js";
import ContextDOM from "../helpers/ContextDOM.js";

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
    * gathers information about the selection and 
    * lists the details about it in an object
    *
    * @return {void}
     */
    setDetails () {
        let { startFormat, endFormat, startNode, endNode } = this.details;

        if (startFormat !== this.format && this.ctxStart.nextSibling && !this.ctxStart.nextSibling.nodeName.match(/#text/)) {
            const nextNode = this.ctxStart.nextSibling.querySelector(this.format);

            startFormat = nextNode ? nextNode.nodeName.toLowerCase() : this.ctxStart.nextSibling.nodeName.toLowerCase();
        }

        if (endFormat !== this.format && this.ctxEnd.previousSibling && !this.ctxEnd.previousSibling.nodeName.match(/#text/)) {
            const prevNode = this.ctxEnd.previousSibling.querySelector(this.format);

            endFormat = prevNode ? prevNode.nodeName.toLowerCase() : this.ctxEnd.previousSibling.nodeName.toLowerCase();
        }

        this.details = {
            ...this.details,
            startFormat,
            endFormat
        };
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
            const biasMerge = this.mergeBias(this.format);

            if (biasMerge) { 
                this.setBoundaries();
                this.clearSelection();

                return; 
            }

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

            //formats.push(formatNode);

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
            isMultiline,
            endNode
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

            const isLine = this.DOM.parentIsLine(startNode);
            const isFormat = startNode.nodeName.toLowerCase() === this.format;
            const nodesMatch = startNode === endNode;

            let before;
            let after;

            this.exterminate(this.ctxSelect, this.format);

            if (!isLine && isFormat && nodesMatch || isLine && isFormat && nodesMatch) {
                [ before, after ] = this.extractSurrounds(startNode);
                this.setBoundaries();
            }

            if (!isLine && isFormat && nodesMatch) {
                this.ctxStart.before(before);

                startNode.after(this.ctxSelect);

                this.ctxSelect.after(after);
            }

            if (isLine && isFormat && nodesMatch) {
                this.removeBoundaries();
                this.selectNode(startNode);
                this.setBoundaries();

                this.ctxStart.before(before);
                this.ctxEnd.after(after);
            }

            this.setBoundaries();
            this.optimizeSelection();
            this.clearSelection();
        });
    }
}
