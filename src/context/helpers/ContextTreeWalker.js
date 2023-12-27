export default class ContextTreeWalker {
	/**
	* walks from one location to another
	* via the sibling axis
	*
	* @param {HTMLElement} start
	* the node to start from
	*
	* @param {HTMLElement} end
	* the node to stop on
	*
	* @param {callable} callback
	* executes the callback with the current
	* walked to node
	*
	* @return {void}
	*/
	walkAtoB (start, end, callback) {
		let walking = start;

		while (walking) {
			if (callback) callback(walking);

			if (walking === end) break;

			walking = walking.nextSibling;
		}
	}
}
