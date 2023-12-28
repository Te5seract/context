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
		let i = 0;

		while (walking) {
			const prev = i > 0 ? walking.previousSibling : null;
			const current = walking;
			const next = walking !== end ? walking.nextSibling : null;

			const props = { prev, current, next };

			if (callback) callback(props);

			if (!walking.nextSibling) break;

			if (end && walking === end) break;

			walking = walking.nextSibling;

			i++;
		}
	}
}
