export default class CtxEditor {
    constructor (selectedNode, prefix) {
        this.selectedNode = selectedNode;
        this.prefix = prefix;

        // editor wrapper
        this.#wrapper();

        // editor tools
        this.#tools();

        this.editor = document.createElement("iframe");
    }

    // -- private

    /**
    * builds out the tools portion of the 
    * editor
    *
    * @return {void}
     */
    #tools () {
        this.tools = document.createElement("div");

        this.tools.dataset.role = `${ this.prefix }tools`
    }

    /**
    * builds out the entire wrapper of the 
    * editor 
    *
    * @return {void}
     */
    #wrapper () {
        this.wrapper = document.createElement("div");

        this.wrapper.dataset.role = `${ this.prefix }wrapper`;
    }

    // -- public

    build () {
        // &#8203;
        const { attributes } = this.selectedNode;
        const para = document.createElement("p");

        Object.keys(attributes).forEach(attr => {
            this.editor.setAttribute(attributes[attr].nodeName, attributes[attr].nodeValue);
        });

        this.editor.width = 900;
        this.editor.height = 400;

        //para.innerHTML = "<br>";

        para.innerHTML = "Boundary <strong>(end) node is created - <em>hangs <u>here</u></em></strong><em><u> for about 3 </u>steps, </em><strong><em>and</em> is </strong>inserted after the <strong>selection ra</strong>nge.";
        //para.innerHTML = "Boundary <strong>(end) node is created - <em>hangs here</em></strong><em> for about 3</em> steps, <strong>and is </strong>inserted after the <strong>selection ra</strong>nge.";
        //para.innerHTML = "Th<strong>is is a <em>test p</em>ar</strong>agraph. This is for <strong>testing the </strong>stuff to test.";
        //para.innerHTML = "Th<strong>is is</strong> a <em>te</em><em>st p</em>aragraph. This is for <strong>testing the </strong>stuff to test.";
        //<p>Th<strong>is is</strong> a <em>t<span data-role="ctx-start"></span>e</em><em>st <span data-role="ctx-end"></span>p</em>aragraph. This is for <strong>testing the </strong>stuff to test.</p>

        this.wrapper.appendChild(this.editor);
        this.editor.before(this.tools);
        this.selectedNode.before(this.wrapper);

        this.editorBody = this.editor.contentDocument.body;
        this.editorBody.appendChild(para);

        this.editor.contentDocument.designMode = "on";
    }

    body () {
        return this.editorBody;
    }

    document () {
        return this.editor.contentDocument;
    }

    wrapper () {
        return this.wrapper;
    }

    tools () {
        return this.tools;
    }
}
