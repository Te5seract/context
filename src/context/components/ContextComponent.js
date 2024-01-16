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

	/**
	* interpolates the faux HTML into real HTML 
	* and sends info back to the instance that owns
	* the faux markup node by placing it into
	* a temporary element, and turning it into a 
	* real element
	*
	* @param {object} scope
	* the ContexComponent instance
	*
	* @return {object}
	 */
	#interpolator (scope) {
		// turn the faux markup into a normal array of nodes
		const fragInner = [ ...scope.domFrag.querySelectorAll(this.nodeName) ];

		// prepare the props object
		let props = {};

		// iterate through the faux nodes
		fragInner.forEach(node => {
			const replacement = document.createElement(this.replacement);
			const fragHTML = node.innerHTML;
			const content = node.childNodes;

			// take the inner HTML of the faux node and put it into the true node
			replacement.innerHTML = fragHTML;

			// place the true node before the faux one
			node.before(replacement);

			// take the attributes of the faux node and add them as porops
			// to be passed to the faux node's instance
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

				// pass the faux node instance as a prop if it's
				// set as an attribute's value
				if (scope.nodes[nodeValue]) {
					props[nodeName] = scope.nodes[nodeValue];
				} else {
					// typical attribute value passed as a true
					// value back to the faux instance props
					props[nodeName] = scope.#attrVal(nodeValue);
				}
			});

			// remove the faux node
			node.remove();

			// keep props immutable
			props = { ...props, ...scope.gProps, node : replacement, content };
		});

		// return the prop object
		return props;
	}

	/*
	* turn an attribute value into its true
	* equivalent, eg: "true" to true and 
	* string numbers to numbers
	*
	* @return {int|bool|string}
	*/
	#attrVal (attr) {
		if (!attr.match(/\d+|true|false/)) return attr;

		if (attr.match(/true|false/)) return attr === "true";

		if (attr.match(/\d+/)) return Number(attr);
	}

	/**
	* sets global props, these will be accessible
	* from all faux node instances
	*
	* @param {object} props
	* the properties to pass to the faux node
	* instances
	*
	* @return {void}
	*/
	globalProps (props) {
		this.gProps = props;
	}

	/**
	* registers a new faux element for custom
	* additions to the editor
	*
	* @param {object} instance
	* the class representative of the faux node,
	* for example: MyCompoonent will be <MyComponent></MyComponent>
	*
	* @param {string} [nodeReplacement]
	* Note: default value is "div"
	* what element faux node will be turned into, eg:
	* "div" 
	*
	* @return {void}
	*/
	register (instance, nodeReplacement) {
		const name = instance.prototype.constructor.name;

		nodeReplacement = nodeReplacement ? nodeReplacement : "div";

		this.nodes[name] = {
			nodeName : name.toLowerCase(),
			interpolate : this.#interpolator,
			replacement : nodeReplacement,
            get : (callback) => callback && callback(instance.prototype),
            getProps : this.#getProps.bind(this, name),
			instance
		};
	}

    #getProps (name, ...args) {
        if (args.length === 2) {
            const [ argA, argB ] = args;

            const callback = typeof argA === "function" ? argA : argB;
            const prop = typeof argA === "string" ? argA : argB;

            callback && callback(this.nodes[name].props[prop].props || this.nodes[name].props[prop]);

            return;
        }

        if (typeof args[0] === "string") return this.nodes[name].props[args[0]];
    }

	/**
	* optimizes and inserts the faux markup into
	* a document fragment, or a temporary node
	* for analysis
	*
	* @param {string} markup
	* the faux markup
	*
	* Note: the this.domFrag is born here
	*
	* @return {void}
	*/
	setMarkup (markup) {
		this.markup = markup.replace(/\n+|\t+/gm, "");

		this.domFrag = document.createElement("div");

		this.domFrag.innerHTML = this.markup;
	}

	/**
	* gets a particular faux node instance and hooks into
	* it by supplying it with methods.
	*
	* @param {string} name
	* the name of the faux node instance, eg:
	* get("ContextFormats");
	*
	* @param {callable} callback
	* the callback will return the instance's object
	* where a hook method can be hooked into, eg:
	* get("ContextFormats", formats => {
	*     formats.set = set => {
	*         set("underline", "u", "U");
	*     }
	* });
	*
	* @return {void}
	*/
	get (name, callback) {
		if (!callback) return;

		callback(this.nodes[name].instance.prototype);
	}

	/**
	* triggers the component object to finalize
	* the settings and display the interpolated
	* nodes
	*
	* @param {HTMLElement} refNode
	* where the interpolated node is to be placed 
	* relative to
	*
	* @return {void}
	*/
	set (refNode) {
		const wrapper = document.createElement("div");

		this.nodes.run(this);

		const fragChildren = [ ...this.domFrag.childNodes ];

		fragChildren.forEach(child => {
			refNode.before(child);
		});

		const nodes = Object.keys(this.nodes).filter(node => node !== "run");

		nodes.forEach(node => {
			const fauxNodeReg = new RegExp(`<${ node }>|<\/${ node }>`);

			if (this.markup.match(fauxNodeReg)) {
				const ctxElement = this.nodes[node];
				const ctxInstanceProps = ctxElement.props;
				const ctxNode = new ctxElement.instance(ctxInstanceProps);
			}
		});
	}
}
