export default class ContextWrapper {
	constructor ({ node, dataPrefix, cssPrefix, boundNode }) {
		node.dataset.role = dataPrefix + "wrapper";
	}
}
