export default class ContextStyles {
	constructor (varPrefix) {
		this.styles = document.head.querySelector(`[data-role="ctx-styles"]`);
		this.varStyles = document.head.querySelector(`[data-role="ctx-style-vars"]`);
		this.css = {};
		this.cssText = "";
        this.varPrefix = varPrefix;

		this.#init();
	}

    /**
    * initializes the the context styles 
    * instance
    *
    * @return {void}
    */
	#init () {
		if (!this.styles && !this.varStyles) {
			this.#createStyles();
		}
	}

    /**
    * sets stylesheets
    * 
    * @return {void}
    */
	#createStyles () {
		const styles = document.createElement("style");
        const varStyles = document.createElement("style");

		this.styles = styles;
		this.styles.dataset.role = "ctx-styles";

        this.varStyles = varStyles;
        this.varStyles.dataset.role = "ctx-style-vars";

        if (!window.ctxEditorMeta) {
            window.ctxEditorMeta = {
                ":root" : {}
            }
        }

		document.head.children[0].before(styles);
        document.head.children[0].before(varStyles);
	}

    /**
    * sets the CSS content for the editors
    *
    * @return {void}
    */
	setCss () {
		let cssText = "";
        let cssVars = ":root{";

        Object.keys(ctxEditorMeta[":root"]).forEach(varDef => {
            cssVars += `${ varDef }:${ ctxEditorMeta[":root"][varDef] }`;
        });

        cssVars += "}";

        this.varStyles.innerHTML = cssVars;

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

        this.styles.innerHTML += cssText;
	}

    /**
    * adds the "." prefix to a class
    *
    * @param {string} value
    * the class name
    *
    * @return {void}
    */
	className (value) {
		return `.${ value }`;
	}

    /**
    * sets CSS variables 
    * 
    * @param {callable} callback
    * the callback passes the ContextStyles instance
    * to the callback scope to add more CSS properties
*
* the callback expects to return an object, eg:
* styles => {
*     return {
*        "var-name" : "value"
*     };
* }
    *
    * @return {void}
    */
	setVar (callback) {
		if (!callback) throw new Error("This method requires a callback as its parameter.");

        if (!ctxEditorMeta) throw new Error("The Context editor metadata failed to be applied.");

		if (this.styles) {
			const cssVars = callback();
			const vars = cssVars ? cssVars : {};
			const variableTransform = {};

			Object.keys(vars).forEach(cssVar => {
				variableTransform[`--${ this.varPrefix }-${ cssVar }`] = vars[cssVar];
			});

			ctxEditorMeta[":root"] = { ...ctxEditorMeta[":root"], ...variableTransform };
		}
	}

    /**
    * sets CSS rules
    *
    * @param {string} identifier
    * this is the className, ID or attribute of the element 
    * to style, use the className() method for classes for 
    * prefixing the class with a "."
    *
    * @param {callable} callback
    * the callback passes the ContextStyles instance
    * to the callback scope to add more CSS properties
    *
    * the callback expects to return an object, eg:
    * styles => {
    *     return {
    *        "background-color" : "red"
    *     };
    * }
    *
    * @return {void}
    */
	setRule (identifier, callback) {
		if (!callback) throw new Error("This method requires a callback as its parameter.");

		if (this.styles) {
			const cssRules = callback();
			const rules = cssRules ? cssRules : {};

			this.css[identifier] = { ...this.css[identifier], ...rules };
		}
	}
}
