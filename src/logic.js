import { helper } from "./helper.js";

export const logic = (function () {
    /**
     * prevents the inital <p>&#8203;</p> in the editor from being deleted
     */
    function textWrap () {
        var editors = document.querySelectorAll(".context-main");

        for (let i = 0; i < editors.length; i++) {
            editors[i].contentDocument.addEventListener("keyup", (e) => {
                if (e.target.innerHTML === "") e.target.innerHTML = helper.editorBlank();
            });
        }
    }

    function constructor (obj) {
        textWrap();
    }

    return {
        ini : function (obj) {
            constructor(obj);
        }
    }
})();