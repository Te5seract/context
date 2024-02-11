import ContextDOM from "../helpers/ContextDOM.js";

/**
* @namespace Actions
*
* this class adds formatting methods to the 
* ContextActions class
*/
export default class ContextFormatActions {
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

        this.select.get(() => {
            const biasMerge = this.optimize.mergeBias(this.format);

            if (biasMerge) { 
                this.select
                    .boundaries(true)
                    .clear();

                return; 
            }

            const extract = this.range.extractContents();
            const formatNode = this.operation.createNode(this.format, null, extract);

            this.optimize.remove(formatNode, this.format);

            this.ctxSelect.appendChild(formatNode);

            this.range.insertNode(this.ctxSelect);

            if (!isMultiline) {
                this.ctxSelect.before(this.ctxStart);
                this.ctxSelect.after(this.ctxEnd);
            }

            this.range.selectNodeContents(this.ctxSelect);

            const extractSelect = this.range.extractContents();

            this.ctxSelect.after(extractSelect);

            this.ctxSelect.remove();
        });

        this.editor.body.focus();
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
            this.select.get(line => {
                this.select
                    .set()
                    .chain(this.optimize.remove(this.ctxSelect, this.format))
                    .clear(line);
            });

            this.editor.body.focus();

            return;
        }

        this.select.get(() => {
            this.select.set();

            const isLine = this.DOM.parentIsLine(startNode);
            const isFormat = startNode.nodeName.toLowerCase() === this.format;
            const nodesMatch = startNode === endNode;

            let before;
            let after;

            this.optimize.remove(this.ctxSelect, this.format);

            if (!isLine && isFormat && nodesMatch || isLine && isFormat && nodesMatch) {
                [ before, after ] = this.operation.surrounds(startNode);
                this.select.boundaries(true);
            }

            if (!isLine && isFormat && nodesMatch) {
                this.select.node(startNode);
                this.optimize.remove(this.ctxSelect, this.format);

                this.ctxStart.before(before);

                startNode.after(this.ctxSelect);

                this.ctxSelect.after(after);
            }
            else if (isLine && isFormat && nodesMatch) {
                this.select
                    .boundaries()
                    .node(startNode)
                    .chain(this.optimize.remove(this.ctxSelect, this.format))
                    .boundaries(true);

                this.ctxStart.before(before);
                this.ctxEnd.after(after);
            }

            this.select.boundaries(true);
            this.optimize.optimizeSelection();
            this.select.clear();
        });

        this.editor.body.focus();
    }

    insert () {
        const { caretPrev, caretNext, caretNextFormat, caretPrevFormat } = this.details;
        const format = this.operation.createNode(this.format);
        const bias = this.optimize.insertBias();

        if (bias) { 
            this.caret.clear();

            return; 
        }

        this.range.insertNode(format);
        this.range.collapse();

        format.innerHTML = "&#xFEFF;"; 

        this.editor.body.focus();

        this.range.selectNodeContents(format);
        this.range.collapse();

        this.ctxCaret.remove();
    }

    split () {
        const { caretPrev, caretNext, caretNode, caretNextFormat, caretPrevFormat } = this.details;

		this.caret.set();

        if (!caretNextFormat && caretPrevFormat) {
            console.log(1);
			this.caret.exitRight();
        }
        else if (caretNextFormat && caretPrevFormat) {
            console.log(2);
            this.caret.exit();
        }
        //else if (!caretPrevFormat && caretNextFormat) {
            //this.caret.exitLeft();
        //}
    }
}
