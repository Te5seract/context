export default class CtxFormatTools {
    constructor (editor) {
        this.editor = editor;
        this.tools = [];
        this.formatList = [];
    }

    // -- private

    /**
    * builds out the formatting tools for the editor
    *
    * @return {void}
     */
    #formatTools () {
        this.formatWrapper = document.createElement("div");

        this.formatWrapper.dataset.role = "format-tools";

        this.editor.tools.appendChild(this.formatWrapper);

        this.tools.forEach(tool => {
            this.formatWrapper.appendChild(tool);
        });
    }

    // -- public 
    /**
    * sets a formatting tool
    *
    * @return {void}
    */
    set (name, format, icon) {
        const tool = document.createElement("button");

        tool.innerHTML = icon;

        tool.dataset.format = format;
        tool.dataset.name = name;

        this.tools.push(tool);
        this.formatList.push(format);
    }

    /**
    * initialize the module
    */
    init () {
        this.#formatTools();
    }
}
