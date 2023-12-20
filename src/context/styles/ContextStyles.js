export default class ContextStyles {
	constructor () {
		this.styles = document.head.querySelector(`[data-role="ctx-styles"]`);
		this.css = {
			":root" : {}
		};
		this.cssText = "";

		this.#init();
	}

	#init () {
		if (!this.styles) {
			this.#createStyles();
		}
	}

	#createStyles () {
		const styles = document.createElement("style");

		this.styles = styles;

		this.styles.dataset.role = "ctx-styles";

		document.head.appendChild(styles);
	}

	#setCss () {
		let cssText = "";

		Object.keys(this.css).forEach(rule => {
			cssText += `${ rule }{`;

			const props = Object.keys(this.css[rule]);

			if (props.length) {
				props.forEach(prop => {
					cssText += `${ prop }:${ this.css[rule][prop] };`;
				});
			}

			cssText += "}";
		});

		this.cssText = cssText;

		console.log(cssText);

		//this.styles.innerHTML += this.cssText;
	}

	className (value) {
		return `.${ value }`;
	}

	setVar (callback) {
		if (!callback) throw new Error("This method requires a callback as its parameter.");

		if (this.styles) {
			const cssVars = callback();
			const vars = cssVars ? cssVars : {};
			const variableTransform = {};

			Object.keys(vars).forEach(cssVar => {
				variableTransform[`--${ cssVar }`] = vars[cssVar];
			});

			this.css[":root"] = { ...this.css[":root"], ...variableTransform };

			this.#setCss();
		}
	}

	setRule (identifier, callback) {
		if (!callback) throw new Error("This method requires a callback as its parameter.");

		if (this.styles) {
			const cssRules = callback();
			const rules = cssRules ? cssRules : {};

			this.css[identifier] = { ...this.css[identifier], ...rules };

			this.#setCss();
		}
	}
}
