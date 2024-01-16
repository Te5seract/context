export default class ContextActionExtension {
    setMethods (instance) {
        const methods = Object.getOwnPropertyNames(this.constructor.prototype).filter(method => method !== "constructor");

        methods.forEach(method => {
            instance[method] = this.constructor.prototype[method];
        });
    }
}
