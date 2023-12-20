export default class ContextEditor {
    constructor ({ hooks, options, dataPrefix, selectedNode, cssPrefix }) {
        // static
        this.options = options;
        this.dataPrefix = dataPrefix;
		this.cssPrefix = cssPrefix;
        this.hooks = hooks;
        this.selectedNode = selectedNode;

        // main editor
        this.wrapper = document.createElement("div");
        // main editor
        this.editor = document.createElement("iframe");

        // kickoff
        this.#editor();
    }

    #editor () {
        const editor = this.editor;
		const width = this.options.width ? this.options.width : "800";
		const height = this.options.height ? this.options.height : "400";

		this.editorClass = `${ this.cssPrefix }editor-${ crypto.randomUUID() }`;

		editor.classList.add(this.editorClass);

		this.hooks.get("style", styles => {
			styles.setVar(() => {
				return {
					"editor-width" : `${ width }px`,
					"editor-height" : `${ height }px`
				}
			});
		});

		this.hooks.get("style", styles => {
			styles.setRule(styles.className(this.editorClass), () => {
				return {
					width : `${ width }px`,
					height : `${ height }px`
				};
			});

			styles.setRule(styles.className(this.editorClass), () => {
				return {
					width : `${ width }px`,
					height : `${ height }px`,
					"background-color" : "red"
				};
			});
		});

        editor.dataset.role = `${ this.dataPrefix }main-editor`;
    }

    #wrapper () {
        const wrapper = this.wrapper;

        editor.dataset.node = `${ this.dataPrefix }editor-wrapper`;
    }

    set () {
        this.wrapper.append(this.editor);
        this.selectedNode.before(this.wrapper);

        this.editor.contentDocument.designMode = "on";
    }
}
