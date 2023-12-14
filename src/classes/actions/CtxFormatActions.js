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
        //const ctxDom = new CtxDOM();
        //const ctxRange = new CtxRange(range);
        //const start = ctxDom.ctxStart();
        //const end = ctxDom.ctxEnd();

        const ctxCommands = new CtxCommands({
            range : range,
            format : format,
            select : sel
        });

        const ctxDom = new CtxDOM({ 
            editor : this.editor,
            format : format
        });

        ctxCommands.slice();

        const [ startParent, endParent ] = ctxDom.formatRoot();
        const [ start, end ] = ctxDom.getSplitBoundaries();

        this.fragment = {
            start : start,
            end : end,
            startParent : startParent,
            endParent : endParent,
            format : format,
            range : range,
            select : sel,
            root : ctxDom.root(start),
            ctxCommands : ctxCommands
        };
    }

    /**
     * orchestrates the type of formatting 
     * action to perform on the selection
     */
    #action () {
        this.#break();
        this.#flatten();
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
            ctxCommands
        } = this.fragment;

        const startFormat = startParent.localName;
        const endFormat = endParent.localName;

        // conditions
        const formatsMatch = startFormat === format && endFormat === format;
        const sameParent = startParent === endParent;

        if (formatsMatch && sameParent) return;

        ctxCommands.wrapSelection();
        ctxCommands.unwrapSelection();
        ctxCommands.select();

        return;
    }

    #break () {
        const {
            start,
            end,
            startParent,
            endParent,
            range,
            format,
            ctxCommands
        } = this.fragment;

        const ctxDom = new CtxDOM(range);
        const ctxRange = new CtxRange(range);

        // conditions
        const sameParent = startParent !== endParent;

        if (startParent !== endParent) return;

        ctxCommands.wrapSelection();

        // select & extract content before start boundary
        range.setStartBefore(startParent);
        range.setEndBefore(start);

        const before = range.extractContents();

        // select & extract content after end boundary
        range.setStartAfter(end);
        range.setEndAfter(startParent);

        const after = range.extractContents();

        // move boundaries
        ctxCommands.moveSelectionAfter(startParent);
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
