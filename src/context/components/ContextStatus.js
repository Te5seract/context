export default class ContextStatus {
    constructor (props) {
        const { formats, node, editor, wordCount, lineage } = props;
        this.editor = editor;
        this.formats = formats;
        this.node = node;

        this.editorNode = this.editor.getProps("node");

        this.select = this.editorNode.contentDocument.getSelection();

        if (lineage) this.#lineage();
        if (wordCount) this.#wordCount();
    }

    ///////////////////////////////////
    // -- private

    // -- word counter
    #wordCount () {
        const wordCountWrapper = document.createElement("div");

        wordCountWrapper.dataset.role = "ctx-word-counter";

        if (!this.counter) {
            const counter = document.createElement("button");
            this.counter = counter;
        }

        this.counter.dataset.role = "ctx-text-info";
        this.counter.dataset.mode = "word-count";

        this.formats.get(format => {
            let [ words, characters ] = this.#getEditorTextInfo();

            this.counter.innerHTML = words;

            format.onKeyPress(commands => {
                [ words, characters ] = this.#getEditorTextInfo();

                this.counter.innerHTML = words;
            });
        });

        wordCountWrapper.appendChild(this.counter);

        this.node.appendChild(wordCountWrapper);
    }

    #getEditorTextInfo () {
        const textContent = this.editorNode.contentDocument.body.textContent.replace(/\n|\t| {2,}/gmi, "");
        const wordCount = textContent.split(" ").length;
        const characterCount = textContent.split("").length;

        return [ wordCount, characterCount ];
    }

    // -- lineage methods

    /**
    * gets the ancestor nodes of the caret's 
    * position
    * 
    * @return {void}
     */
    #lineage () {
        const lineageWrapper = document.createElement("div");

        lineageWrapper.dataset.role = "ctx-lineage";

        this.formats.get(format => {
            format.onPosition(commands => {
                lineageWrapper.innerHTML = "";
                this.commands = commands;

                const [ nodeListStr, nodeList ] = commands.getCaret(this.select)
                const ancestors = nodeListStr.filter(node => !node.match(/#text/));

                this.nodeList = nodeList;

                // create ancestor buttons
                ancestors.forEach((parent, i) => {
                    const nodeHighlight = document.createElement("button");

                    nodeHighlight.innerHTML = parent;

                    nodeHighlight.dataset.index = i;
                    lineageWrapper.appendChild(nodeHighlight);

                    nodeHighlight.addEventListener("pointerup", this.#highlightNode);
                });
            });
        });

        this.node.appendChild(lineageWrapper);
    }

    /**
    * highlights an ancestor node
    * via the ancestry buttons
     */
    #highlightNode = e => {
        const { target } = e;
        const { index } = target.dataset;
        const node = this.nodeList[Number(index)];

        this.select.selectAllChildren(node);
    }
}
