import ContextActionExtension from "./ContextActionExtension.js";

export default class ContextOptimize extends ContextActionExtension {
    constructor (actions) {
        super();

        this.setMethods(actions);
    }

    /**
    * unnests nested formats and removes
    * empty nodes
    *
    * @return {void}
    */
    optimizeSelection () {
        if (this.ctxStart.previousSibling && !this.ctxStart.previousSibling.nodeName.toLowerCase() === this.format) this.exterminate(this.ctxStart.previousSibling, this.format);
        if (this.ctxEnd.nextSibling && !this.ctxEnd.nextSibling.nodeName.toLowerCase() === this.format) this.exterminate(this.ctxEnd.nextSibling, this.format);

        if (this.ctxStart.previousSibling && this.ctxStart.previousSibling.nodeName.match(/#text/) && !this.ctxStart.previousSibling.textContent) this.ctxStart.previousSibling.remove();
        if (this.ctxEnd.nextSibling && !this.ctxEnd.nextSibling.nodeName.match(/#text/) && !this.ctxEnd.nextSibling.textContent) this.ctxEnd.nextSibling.remove();
    }

    mergeBias (tag) {
        const { prev, next } = this.getSelectionSiblings();
        const { prevFormat, prevNode } = prev;
        const { nextFormat, nextNode } = next;

        if (nextFormat !== tag && prevFormat !== tag) return false;

        this.setSelection();

        if (prevFormat === tag && nextFormat !== tag) {
            this.moveSelectionTo(prevNode, "append");

            return true;
        }
        else if (nextFormat === tag && prevFormat !== tag) {
            this.moveSelectionTo(nextNode, "before");

            return true;
        }
        else if (nextFormat === tag && prevFormat === tag) {
            this.moveSelectionTo(prevNode, "append");
            this.moveNodeContentsTo(nextNode, prevNode, "append");

            return true;
        }
    }
}
