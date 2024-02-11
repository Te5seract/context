export default class ContextCaret {
	/**
	* sets the caret at the current position of the cursor
	*
	* @return {void}
	*/
	set () {
		this.range.insertNode(this.ctxCaret);
	}

	/**
	* places the caret after a selected node
	*
	* @param {HTMLElement} node
	* the node to place the caret after
	*
	* @return {void}
	*/
	setAfter (node) {
		this.caret.clear();

		node.after(this.ctxCaret);
	}

	/**
	* sets the caret before a selected node
	*
	* @param {HTMLElement} node
	* the node to place the caret before
	*
	* @return {void}
	*/
	setBefore (node) {
		this.caret.clear();

		node.before(this.ctxCaret);
	}

	/**
	* removes the caret from the editor
	*
	* @return {void}
	*/
	clear () {
		this.ctxCaret.remove();
	}

	/**
	* exists a node that the caret is within from the right
	*
	* @return {void}
	*/
	exitRight () {
		if (!this.editor.body.querySelector(`[data-role="ctx-caret"]`)) throw new Error(`The Context Caret has not been set, use the this.caret.set() before using this method.`);

        const parentFormats = this.DOM.getFormats(this.ctxCaret, this.format);
        const { caretNode } = this.details;

		this.caret.setAfter(caretNode);

		const scoutParents = this.DOM.getFormats(this.ctxCaret);
		const createNodes = parentFormats.filter(node => !scoutParents.includes(node));
		const [ nest, focus ] = this.DOM.createNodeNest(createNodes);

		if (nest) {
			this.range.setStartAfter(caretNode);
			this.range.insertNode(nest);

			this.caret.focus(focus);

			this.editor.body.focus();

			return;
		}

		this.caret.focus(caretNode, "after");

		this.editor.body.focus();
	}

    /**
    * exists a node that the caret is within from the left 
    *
    * @return {void}
    */
    exitLeft () {
		if (!this.editor.body.querySelector(`[data-role="ctx-caret"]`)) throw new Error(`The Context Caret has not been set, use the this.caret.set() before using this method.`);

        const parentFormats = this.DOM.getFormats(this.ctxCaret, this.format);
        const { caretNode } = this.details;

		this.caret.setBefore(caretNode);

		const scoutparents = this.DOM.getFormats(this.ctxCaret);
		const createNodes = parentFormats.filter(node => !scoutparents.includes(node));
		const [ nest, focus ] = this.DOM.createNodeNest(createNodes);

		if (nest) {
			this.range.setStartBefore(caretNode);
			this.range.insertNode(nest);

			this.caret.focus(focus);

			this.editor.body.focus();

			return;
		}

		this.caret.focus(caretNode, "before");

		this.editor.body.focus();
    }

    /**
    * exists a node that the caret is within by breaking the node
    * at the caret's position
    */
    exit () {
		if (!this.editor.body.querySelector(`[data-role="ctx-caret"]`)) throw new Error(`The Context Caret has not been set, use the this.caret.set() before using this method.`);

        const { caretNode } = this.details;
        const parentFormatsSplit = this.DOM.getFormats(this.ctxCaret, this.format);

        this.range.setStartAfter(this.ctxCaret);
        this.range.setEndAfter(caretNode);

        const extract = this.range.extractContents();

        caretNode.after(extract);

        this.ctxCaret.remove();

        caretNode.after(this.ctxCaret);

        const parentFormatsAfter = this.DOM.getFormats(this.ctxCaret);
        const createNodes = parentFormatsSplit.filter(node => !parentFormatsAfter.includes(node));

        console.log(parentFormatsSplit, parentFormatsAfter);

        if (createNodes.length) {
            const [ nest, focus ] = this.DOM.createNodeNest(createNodes);

            caretNode.after(nest);

            this.caret.focus(focus);
            this.editor.body.focus();
            this.caret.clear();

            return;
        }

        this.caret.focus(caretNode, "after");
        this.caret.clear();

        this.editor.body.focus();
    }

	/**
	* shifts the text focus to a nominated node
	*
	* @param {HTMLElement} node
	* the node to shift focus to
	*
	* @param {string} [method]
	* the focus method if no method is defined
	* the focus will be shifted into the selected node
	*
	* focus methods are:
	* after or append to shift the focus after a node
	* before or prepend to shift fucs before a node
	*
	* @return {void}
	*/
	focus (node, method) {
		const fragment = this.range.createContextualFragment("&#xFEFF;");

		if (!method) {
			this.range.setStart(node, 0);
			this.range.insertNode(fragment);
			//node.appendChild(fragment);

			return;
		}

		if (method.match(/^after$|^append$/i)) {
			this.range.setStartAfter(node);
			this.range.insertNode(fragment);
		}
		else if (method.match(/^before$|^prepend$/i)) {
			this.range.setStartBefore(node);
			this.range.insertNode(fragment);
		}
        else if (method.match(/^innerAfter$|^innerAppend$/i)) {
            this.range.setStart(node, node.childNodes.length);
            this.range.insertNode(fragment);
        }
        else if (method.match(/^innerBefore$|^innerPrepend$/i)) {
            this.range.setStart(node, 0);
            this.range.insertNode(fragment);
        }
	}
}
