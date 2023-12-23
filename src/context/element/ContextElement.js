export default class ContextElement {
    constructor (nodeName, element) {
        this.nodeName = nodeName;
        this.element = element;

        this.node = this.#createNode();
    }

    #createNode () {
        const ctx = this;

        if (!customElements.get(this.nodeName)) {
            customElements.define(this.nodeName, class extends HTMLElement {
                constructor () {
                    super();

                    if (ctx.element) {
                        ctx.element.bind(this)();
                    }
                }
            });
        }

        return customElements.get(this.nodeName).prototype;
    }

    create () {
        return `<${ this.nodeName }></${ this.nodeName }>`;
    }
}
