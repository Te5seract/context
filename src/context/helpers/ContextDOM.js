export default class ContextDOM {
	nodeRoot (start, type) {
		let parent = start;

		while (parent) {
			if (parent.parentNode.localName === "body") return parent;

			if (parent.localName === type) return parent;

			parent = parent.parentNode;
		}
	}
}
