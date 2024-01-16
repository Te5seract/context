export default class ContextEditor {
	constructor ({ node }) {
		this.node = node;

		node.contentDocument.designMode = "on";

		node.contentDocument.body.innerHTML = `
			<p>Here is <span data-role="ctx-style" style="color: red;">a second </span>line <em>for th<strong>e editor </strong></em><strong>for <em>further testing</em></strong></p><p><strong>This <em>is some</em> t</strong>ext here for test<strong>ing with for</strong> some reason or another</p><p>Here is a second line for the editor for further testing</p>
		`;
	}

	get () {
		return this.node;
	}
}
