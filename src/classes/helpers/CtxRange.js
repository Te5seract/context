export default class CtxRange {
    /**
    * beginning of range reference
    *
    * @return {HTMLElement}
    */
    ctxStart () {
        const start = document.createElement("span");

        start.dataset.role = "ctx-start";

        return start;    
    }

    /**
    * end of range reference
    *
    * @return {HTMLElement}
    */
    ctxEnd () {
        const end = document.createElement("span");

        end.dataset.role = "ctx-end";

        return end
    }

    /**
    * wraps selection in a selection span
    *
    * @return {HTMLElement}
    */
    selection (content) {
        const sel = document.createElement("span");

        if (content) sel.appendChild(content);

        sel.dataset.role = "ctx-selection";

        return sel;
    }
}
