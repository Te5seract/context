export const methods = (function () {
    function methods (proto) {
        proto.settings = function (options) {
            var width = options.width ? options.width : 400,
                height = options.height ? options.height : 300;
                
            for (let i = 0; i < this.length; i++) {
                this[i].querySelector(".context-main").style.cssText += `
                    width: ${width}px;
                    height: ${height}px;
                `;
            }

            return this;
        }
    }

    return {
        set : function (proto) {
            methods(proto);
        }
    }
})();