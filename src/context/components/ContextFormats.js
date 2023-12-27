import ContextCommands from "../commands/ContextCommands.js";

/**
* @namespace Components
*
* this class represents the <ContextFormats> proxy
* node for the editor
*
* find the following method types:
* -- hooks
*  1. set
*  2. remove
*  3. add
*/

export default class ContextFormats {
	constructor (props) {
		const { node, classname, cssPrefix, editor, debugmode } = props;

		// properties
		this.node = node;
		this.editor = editor.props.node;
		this.formats = [];
		this.debugmode = debugmode;

		// static
		this.command = new ContextCommands(this.editor.contentDocument);

		// hooks
		if (this.set) this.set(this.#set.bind(this));

		if (this.remove) this.remove(this.#remove.bind(this));

		if (this.add) this.add(this.#add.bind(this));

		// format container class
		node.classList.add(cssPrefix + "format-wrapper");

		if (classname) {
			node.classList.add(classname);
		}

		// kickoff
		this.#init();
	}

	////////////////////////////////////////////////
	// -- hooks

	/**
	* 1. set
	* - hook method - sets a format, thus removing
	* all other existing formats
	*
	* @param {string} name
	* the name of the format
	*
	* @param {string} format
	* the node to format to, eg: "strong", "em"
	*
	* @param {string} icon
	* the icon that is to represent the setting
	* on the format button
	*
	* @return {void}
	 */
	#set (name, format, icon) {
		const button = document.createElement("button");

		button.dataset.format = format;
		button.dataset.name = name;
		button.innerHTML = icon;

		this.node.textContent += `{${name}}`;

		this.formats.push({
			name,
			format,
			icon,
			button
		});
	}

	/**
	* 2. remove
	* hook method - removes a formatting node
	* from the list of formats
	*
	* @param {string} formatName
	* the name of the format to remove, the
	* existing formats being: "bold", "italic", "strike"
	*
	* @return {void}
	 */
	#remove (formatName) {
		this.formats = this.formats.filter(format => format.name !== formatName);
	}

	/**
	* 3. add
	* - hook method - adds another format
	* to the list
	*
	* @param {string} name
	* the name of the format
	*
	* @param {string} format
	* the node to format to, eg: "strong", "em"
	*
	* @param {string} icon
	* the icon that is to represent the setting
	* on the format button
	*
	* @return {void}
	 */
	#add (name, format, icon) {
		this.#set(name, format, icon);
	}

	////////////////////////////////////////////////
	// -- private

	/**
	* interpolates the formats into the 
	* node as buttons rather than text
	* before initialized formats presented
	* as: {bold}{italic}{strike}
	*
	* @return {void}
	 */
	#init () {
		const formats = this.node.innerHTML;

		this.node.innerHTML = "";

		this.formats.forEach(format => {
			const formatReg = new RegExp(`{(| )${ format.name }(| )}`, "gmi");

			if (formats.match(formatReg)) {
				this.node.appendChild(format.button);

				format.button.addEventListener("pointerdown", this.#format);
			}
		});
	}

	////////////////////////////////////////////////
	// -- events

	/**
	* - event
	* bound event listeners for the 
	* format tools
	*
	* @return {void}
	 */
	#format = e => {
		const { target } = e;
		const { format } = target.dataset;

		this.command.setMode({
			debug : this.debugmode
		});
		this.command.exec(format);
	}
}
