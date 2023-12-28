export default class ContextEditor {
	constructor ({ node }) {
		this.node = node;

		node.contentDocument.designMode = "on";

		node.contentDocument.body.innerHTML = `
			<p>Here is a second line for the editor <strong>for further</strong> testing</p><p>This <strong>is some t</strong>ext here for test<strong>ing with for</strong> some reason or another</p><p>Here is a second line for the editor for further testing</p>
		`;
	}

	get () {
		return this.node;
	}
}
