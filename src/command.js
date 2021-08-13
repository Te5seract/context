import { helper } from "./helper.js";

export const command = (function () {
    ///////////////////////////////////
    // private methods

    /**
     * wraps the selection in the defined format
     * 
     * what this function returns:
     * 
     * 1. range: the range object
     * 2. rangeEnd: the end point of the selection range (as HTML)
     * 3. startInner: the HTML of the starting point of the selection range
     * 4. endInner: the HTML of the ending point of the selection range
     * 5. lines: the lines that make up the entire selection (array)
     * 
     * @param {object} range 
     * the range object
     * 
     * @param {string} format 
     * the format to apply
     * 
     * @return {array}
     */
    function applyFormat (range, format) {
        var tmp = helper.make("div"),
            rangeEnd = range.endOffset,
            selected = range.cloneContents(),
            editor = helper.allLines(range),
            lines = helper.lines(range),
            startInner,
            endInner;

        tmp.append(selected);

        for (let i = 0; i < editor.length; i++) {
            for (let x = 0; x < lines.length; x++) {
                if (lines[x] === editor[i]) {

                    if (tmp.children[x] && lines.length > 1) {
                        var reg = new RegExp(`<${format}>|<\/${format}>`, "igm"),
                            selLine = helper.stripContainer(tmp.children[x].outerHTML),
                            selLineFormatted = `<${format}>${selLine.replace(/(<\/.*?>)/g, `</${format}>$1<${format}>`)}</${format}>`;

                        editor[i].innerHTML = editor[i].innerHTML.replace(selLine, selLineFormatted);

                        if (x === 0) startInner = selLine.replace(/(<\/.*?>.+|<.*?>.+)/gm, "").replace(reg, "");
                        else if (x === lines.length - 1) endInner = selLine.replace(/.+<.*?>/gm, "").replace(reg, "");
                    }
                    else if (!tmp.children[x] || lines.length === 1) {
                        var selLine = helper.stripContainer(tmp.innerHTML),
                            selLineFormatted = `<${format}>${selLine.replace(/(<\/.*?>)/g, `</${format}>$1<${format}>`)}</${format}>`;

                        editor[i].innerHTML = editor[i].innerHTML.replace(selLine, selLineFormatted);

                        if (x === 0) startInner = selLine.replace(/(<\/.*?>.+|<.*?>.+)/gm, "").replace(reg, "");
                        else if (x === lines.length - 1) endInner = selLine.replace(/.+<.*?>/gm, "").replace(reg, "");
                    }

                }
            }
        }

        helper.cleanUp(helper.parents(range.startContainer, "body", true), format);

        return [range, rangeEnd, startInner, endInner, lines];
    }

    /**
     * this function expects the applyFormat function as a parameter
     * once a format has been set, this function highlights the newly
     * formatted text
     * 
     * @param {array} applicator 
     * the applyFormat function
     * 
     * @return {void}
     */
    function highlight (applicator) {
        var [range, rangeEnd, startHTML, endHTML, lines] = applicator,
            startContainer,
            endContainer;

        // if (lines.length > 1) {
            for (let i = 0; i < lines.length; i++) {
                var formatLines = lines[i].querySelectorAll("*");

                for (let x = 0; x < formatLines.length; x++) {
                    if (i === 0 && formatLines[x].innerHTML.match(startHTML)) {
                        startContainer = formatLines[x].childNodes[0];
                    }
                    else if (i === lines.length - 1 && formatLines[x].innerHTML.match(endHTML)) {
                        endContainer = formatLines[x].childNodes[0];
                    }
                }
            }

            if (!endContainer) {
                endContainer = startContainer;
                rangeEnd = startHTML.length;
            }

            range.setStart(startContainer, 0);
            range.setEnd(endContainer, rangeEnd);
        // }

        // for (let i = 0; i < lines.length; i++) {
        //     var formatLines = lines[i].querySelectorAll("*");

        //     for (let x = 0; x < formatLines.length; x++) {}
        //     console.log(formatLines);
        //     console.log(lines);
        // }
    }

    /**
     * wraps/unwraps the selected text
     * 
     * @param {object} range 
     * the range object
     * 
     * @param {string} format 
     * format type
     * 
     * @return {void}
     */
    function wrap (api, format) {
        var {range, sel} = api,
            lines = helper.lines(range),
            start = helper.parents(range.startContainer, format),
            end = helper.parents(range.endContainer, format);

        if (start && end) return;

        highlight(applyFormat(range, format));
    }

    /**
     * constructor for the command class
     * 
     * @param {object} obj 
     * the library object
     * 
     * @return {void}
     */
    function constructor (obj) {
        for (let i = 0; i < obj.length; i++) {
            obj[i].querySelector(".context-main").contentDocument.addEventListener("click", editorEvent);
            obj[i].addEventListener("click", (e) => {
                var sel = obj[i].querySelector(".context-main").contentDocument.getSelection();

                editorEvent(e, sel);
            });
        }
    }

    /**
     * performs events within the editor scope
     * 
     * @param {object} e 
     * event object 
     * 
     * @param {object} sel 
     * the selection object
     * 
     * @return {void}
     */
    function editorEvent (e, sel) {     
        if (e.target.classList.contains("tool-toggle") && sel.getRangeAt) {
            var dataType = helper.attr(e.target, "get", "data-type"),
                range = sel.getRangeAt(0),
                type = {
                    bold : "strong",
                    italic : "em",
                    strike : "s",
                    underline : "u"
                };

            // formats selected text
            wrap({range, sel}, type[dataType]);
        }
    }

    return {
        ini : function (obj) {
            constructor(obj);
        }
    };
})();