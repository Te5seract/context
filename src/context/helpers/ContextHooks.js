export default class ContextHooks {
    constructor () {
        this.hooks = {};
    }

    set (name, value) {
        this.hooks[name] = value;
    }

    get (name, callback) {
        if (!this.hooks[name]) return;

        if (!callback) return this.hooks[name];

        callback(...this.hooks[name]);
    }
}
