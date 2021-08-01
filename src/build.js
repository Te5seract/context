import { helper } from "./helper.js";

export const build = (function () {
    /**
     * assembles the markup for the editor
     * 
     * @param {HTMLElement} obj 
     * the editor wrapper
     * 
     * @return {void}
     */
    function assemble (obj) {
        var prefilledEditor = [];

        for (let i = 0; i < obj.length; i++) {
            var canvas = helper.make("iframe", "class=context-main"),
                existingContent = obj[i].innerHTML.replace(/ {2,}|\n/g, "");

            obj[i].innerHTML = "";

            obj[i].classList.add("context-wrapper");

            obj[i].innerHTML = `
                <a class="tool-toggle" data-type="bold">B</a>
                <a class="tool-toggle" data-type="italic">I</a>
                <a class="tool-toggle" data-type="underline">U</a>
                <a class="tool-toggle" data-type="strike">S</a>
                <br>
            `;

            helper.append(obj[i], canvas);

            prefilledEditor.push(existingContent);
        }

        prepare(obj, prefilledEditor);
    }

    /**
     * validates pre-filled content inside the text editor
     * 
     * @param {HTMLElement} editor 
     * the text editor canvas
     * 
     * @param {string} content 
     * pre-filled content inside the editor wrapper
     * 
     * @return {void}
     */
    function validateContent (editor, content) {
        var tmp = helper.make("div"),
            validated = "";

        tmp.innerHTML = content;

        for (let i = 0; i < tmp.childNodes.length; i++) {
            var nodeName = tmp.childNodes[i].nodeName.toLowerCase();

            if (nodeName !== "p") {
                var html = nodeName === "#text" ? tmp.childNodes[i].data : tmp.childNodes[i].outerHTML,
                    para = helper.make("p");

                if (!helper.isBlockElement(nodeName)) {
                    para.innerHTML = html;

                    validated += para.outerHTML;
                }
                else if (helper.isBlockElement(nodeName)) {
                    var blockInner = tmp.childNodes[i].innerHTML;

                    para.innerHTML = blockInner;

                    tmp.childNodes[i].innerHTML = para.outerHTML;

                    validated = tmp.childNodes[i].outerHTML;
                }
            } else {
                validated += tmp.childNodes[i].outerHTML;
            }
        }

        tmp.innerHTML = validated;

        tmp.innerHTML = tmp.innerHTML.replace(/<p><\/p>/gm, "");

        editor.contentDocument.body.innerHTML = validated ? tmp.innerHTML : helper.editorBlank();
    }

    /**
     * prepare text editor
     * 
     * @param {string} preFilled 
     * pre-existing content to put into the editor
     * 
     * @param {number} index 
     * editor index
     * 
     * @return {void}
     */
    function prepare (obj, preFilled) {
        for (let i = 0; i < obj.length; i++) {
            var editor = obj[i].querySelector(".context-main");

            validateContent(editor, preFilled[i]);

            // editor.contentDocument.body.innerHTML = preFilled[i] ? `<p>${preFilled[i]}</p>` : helper.editorBlank();

            helper.attr(editor.contentDocument.body, "set", "contenteditable=true");

            editor.contentDocument.designMode = "on";
        }
    }

    /**
     * constructor for the build class
     * 
     * @param {HTMLElement} obj 
     * wrapper element for the editor
     * 
     * @return {void}
     */
    function constructor (obj) {
        assemble(obj);
    }

    return {
        ini : function (obj) {
            constructor(obj);
        }
    }
})();