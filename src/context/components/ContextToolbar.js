export default class ContextToolbar {
	constructor ({ node, classname, cssPrefix }) {
		if (classname) node.classList.add(classname);

		node.classList.add(cssPrefix + "tools");
	}
}
