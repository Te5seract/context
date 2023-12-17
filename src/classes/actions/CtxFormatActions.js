import CtxDOM from "../helpers/CtxDOM.js";
import CtxRange from "../helpers/CtxRange.js";
import CtxCommands from "../helpers/CtxCommands.js";

export default class CtxFormatActions {
    constructor (tools, editor) {
        this.tools = tools;
        this.ed = editor;
        this.editor = this.ed.document();
        this.editorBody = this.ed.body();

        this.tools.forEach(tool => {
            tool.addEventListener("pointerdown", this.#formatEvent);
        });
    }

    // -- private

    /**
    * prepare the selection for formatting
    */
    #prepare (sel, range, format) {
        const ctxCommands = new CtxCommands({
            range : range,
            format : format,
            select : sel
        });

        ctxCommands.slice();

        const [ startParent, endParent ] = ctxCommands.formatRoot();
        const [ start, end ] = ctxCommands.getSplitBoundaries();

        this.fragment = {
            start : start,
            end : end,
            startParent : startParent,
            endParent : endParent,
            format : format,
            range : range,
            select : sel,
            root : ctxCommands.root(start),
            ctxCommands : ctxCommands
        };
    }

    /**
     * orchestrates the type of formatting 
     * action to perform on the selection
     */
    #action () {
        const {
            startParent,
            endParent,
            format,
            range,
            start
        } = this.fragment;

        const startFormat = startParent.localName;
        const endFormat = endParent.localName;
        const selectionFormat = range.cloneContents().querySelector(format);

        // conditions
        const sameParent = startParent === endParent;
        const parentIsParagraph = startFormat !== "p" && endFormat !== "p";
        const formatsMatch = startFormat === endFormat;
        const isFormatWrapped = startFormat === format && endFormat === format;
        const hasFormatting = selectionFormat && selectionFormat.textContent === start.nextSibling.textContent;

        if (sameParent && parentIsParagraph) {
            this.#break();
        }
        else if (!sameParent && formatsMatch) {
            this.#flatten();
        }
        else if (!isFormatWrapped && !hasFormatting) {
            this.#wrap();
        }
        else if (hasFormatting) {
            this.#unwrap();
        }
    }

    #unwrap () {
        const {
            startParent,
            endParent,
            range,
            format,
            ctxCommands
        } = this.fragment;

        ctxCommands.wrapSelection();
        ctxCommands.unwrapSelection();
        ctxCommands.select();
    }

    #wrap () {
        const {
            startParent,
            endParent,
            range,
            format,
            ctxCommands
        } = this.fragment;

        ctxCommands.wrapSelection();

        const [ prevNode, nextNode ] = ctxCommands.getNodesBeforeSelection();

        if (prevNode && prevNode.nodeName.toLowerCase() === format) {
            ctxCommands.moveSelectionBlock("back", prevNode);
        } 
        else if (nextNode && nextNode.nodeName.toLowerCase() === format) {
            ctxCommands.moveSelectionBlock("forwards", nextNode);
        } else {
            range.selectNodeContents(ctxCommands.selection);

            const formattedNode = ctxCommands.wrap(format, range.extractContents());

            ctxCommands.selection.after(formattedNode);
        }

        ctxCommands.unwrapSelection();
        ctxCommands.select();
    }

    /**
    * flattens the selection
    * if the selection contents are not within
    * the same parent format node and yet the
    * format types are the same, this method
    * rips out the formatting between boundaries
    *
    * @return {void}
    */
    #flatten () {
        const {
            startParent,
            endParent,
            format,
            ctxCommands,
            range
        } = this.fragment;

        //const startFormat = startParent.localName;
        //const endFormat = endParent.localName;

        //// conditions
        //const formatsMatch = startFormat === endFormat;
        //const sameParent = startParent === endParent;

        //if (formatsMatch && sameParent) return;

        ctxCommands.wrapSelection();
        ctxCommands.unwrapSelection();
        ctxCommands.select();

        return;
    }

    #break () {
        const {
            end,
            startParent,
            format,
            ctxCommands
        } = this.fragment;

        ctxCommands.wrapSelection();
        ctxCommands.extractBeforeSelection(startParent);
        ctxCommands.extractAfterSelection(startParent);
        ctxCommands.moveSelectionAfter(startParent);

        const before = ctxCommands.wrap(format, ctxCommands.before);
        startParent.after(before);
        startParent.remove();

        const after = ctxCommands.wrap(format, ctxCommands.after);
        end.after(after);

        ctxCommands.unwrapSelection();
        ctxCommands.select();
    }

    /**
    * event
     */
    #formatEvent = e => {
        const { target } = e;
        const format = target.dataset.format;
        const sel = this.editor.getSelection();
        const range = sel.getRangeAt(0);

        this.#prepare(sel, range, format);
        this.#action();
    }
}
