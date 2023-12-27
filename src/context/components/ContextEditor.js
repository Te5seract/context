export default class ContextEditor {
	constructor ({ node }) {
		this.node = node;

		node.contentDocument.designMode = "on";

		node.contentDocument.body.innerHTML = `<p>This <strong>is some t</strong>ext here for test<strong>ing with for</strong> some reason or another</p>`;
	}

	get () {
		return this.node;
	}
}
