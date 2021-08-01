import { build } from "./build.js";
import { logic } from "./logic.js";
import { command } from "./command.js";
import { methods } from "./methods.js";

export const Context = (function () {
    var wrapper = [],
        proto = Context.prototype;

    // library initialize
    function Context (selector) {
        var elementList = document.querySelectorAll(selector);

        for (let i = 0; i < elementList.length; i++) {
            this[i] = elementList[i];
        }

        this.length = elementList.length;

        build.ini(this);

        logic.ini(this);

        command.ini(this);
    }

    // convert library object to array
    proto.splice = wrapper.splice;

    methods.set(proto);

    // return the library
    return function (selector) {
        return new Context(selector);
    }
})();