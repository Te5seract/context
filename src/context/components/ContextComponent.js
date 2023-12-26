export default class ContextComponent {
	constructor () {
		this.nodes = {
			run : function (scope) {
				const keys = Object.keys(this).filter(key => key !== "run");

				for (let i = 0; i < keys.length; i++) {
					this[keys[i]]["props"] = this[keys[i]].interpolate.bind(this[keys[i]], scope)();
				}
			}
		};
	}

	#interpolator (scope) {
		const fragment = document.createDocumentFragment();
		const fragInner = [ ...scope.domFrag.querySelectorAll(this.nodeName) ];

		let props = {};

		fragInner.forEach(node => {
			const replacement = document.createElement(this.replacement);
			const fragHTML = node.innerHTML;
			const content = node.childNodes;

			replacement.innerHTML = fragHTML;

			node.before(replacement);

			Object.keys(node.attributes).forEach(attr => {
				let { nodeName, nodeValue } = node.attributes[Number(attr)];

				if (nodeName.match(/-/g)) {
					const attrSplit = nodeName.split("-");

					nodeName = "";

					attrSplit.forEach((slug, i) => {
						const first = slug.split("");
						const trail = first.splice(1, first.length - 1);

						nodeName += i > 0 ? first[0].toUpperCase() + trail.join("") : first[0] + trail.join("");
					});
				}

				if (scope.nodes[nodeValue]) {
					props[nodeName] = scope.nodes[nodeValue];
				} else {
					props[nodeName] = nodeValue;
				}
			});

			node.remove();

			props = { ...props, ...scope.gProps, node : replacement, content };
		});

		return props;
	}

	globalProps (props) {
		this.gProps = props;
	}

	register (instance, nodeReplacement) {
		const name = instance.prototype.constructor.name;

		nodeReplacement = nodeReplacement ? nodeReplacement : "div";

		this.nodes[name] = {
			nodeName : name.toLowerCase(),
			interpolate : this.#interpolator,
			replacement : nodeReplacement,
			instance
		};
	}

	setMarkup (markup) {
		this.markup = markup.replace(/\n+|\t+/gm, "");

		this.domFrag = document.createElement("div");

		this.domFrag.innerHTML = this.markup;
	}

	get (name, callback) {
		if (!callback) return;

		callback(this.nodes[name].instance.prototype);
	}

	set (refNode) {
		const wrapper = document.createElement("div");

		this.nodes.run(this);

		const fragChildren = [ ...this.domFrag.childNodes ];

		fragChildren.forEach(child => {
			refNode.before(child);
		});

		const nodes = Object.keys(this.nodes).filter(node => node !== "run");

		nodes.forEach(node => {
			const ctxElement = this.nodes[node];
			const ctxInstanceProps = ctxElement.props;
			const ctxNode = new ctxElement.instance(ctxInstanceProps);
		});
	}
}
