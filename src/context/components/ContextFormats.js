import ContextCommands from "../commands/ContextCommands.js";

export default class ContextFormats {
	constructor (props) {
		const { node, classname, cssPrefix, editor } = props;

		// properties
		this.node = node;
		this.editor = editor.props.node;
		this.formats = [];

		// static
		this.command = new ContextCommands(this.editor.contentDocument);

		// hooks
		if (this.register) this.register(this.#register.bind(this));

		if (this.remove) this.remove(this.#remove.bind(this));

		if (this.inner) this.inner(this.#inner.bind(this));

		if (this.add) this.add(this.#add.bind(this));

		// format container class
		node.classList.add(cssPrefix + "format-wrapper");

		if (classname) {
			node.classList.add(classname);
		}

		// kickoff
		this.#init();
	}

	#add (name, format, icon) {
		this.#register(name, format, icon);
	}

	#inner (content) {
		this.node.textContent += content;
	}

	#remove (formatName) {
		this.formats = this.formats.filter(format => format.name !== formatName);
	}

	#register (name, format, icon) {
		const button = document.createElement("button");

		button.dataset.format = format;
		button.dataset.name = name;
		button.innerHTML = icon;

		this.formats.push({
			name,
			format,
			icon,
			button
		});
	}

	#init () {
		const formats = this.node.textContent;

		this.node.textContent = "";

		this.formats.forEach(format => {
			const formatReg = new RegExp(`{(| )${ format.name }(| )}`);

			if (formats.match(formatReg)) {
				this.node.appendChild(format.button);

				format.button.addEventListener("pointerdown", this.#format);
			}
		});
	}

	#format = e => {
		const { target } = e;
		const { format } = target.dataset;

		this.command.exec(format);
	}
}
