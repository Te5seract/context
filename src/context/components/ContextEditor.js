export default class ContextEditor {
	constructor ({ node }) {
		this.node = node;

		node.contentDocument.designMode = "on";

		node.contentDocument.body.innerHTML = `<p>This is some text here for testing with for some reason or another</p>`;
	}

	get () {
		return this.node;
	}
}
