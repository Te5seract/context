export const helper = (function () {
    var fn = {};

    /**
     * sets attributes
     * 
     * @param {HTMLElement} elem 
     * the element to set attributes to
     * 
     * @param {string} action 
     * the type of attribute action to perform
     * 
     * values: 
     * 
     * set
     * remove or delete or del
     * get
     * has
     * 
     * @param {string} value 
     * the attributes to apply 
     * 
     * @return {array|string}
     */
    fn.attr = function (elem, action, value) {
        var values = value.split(/ ,|, |,/g),
            result = [];

        for (let i = 0; i < values.length; i++) {

            if (action.match(/set/ig)) {
                var settings =  values[i].split(/=/g);

                elem.setAttribute(settings[0], settings[1]);
            }
            else if (action.match(/remove|delete|del/ig)) {
                elem.removeAttribute(values[i]);
            }
            else if (action.match(/get/ig)) {
                result.push(elem.getAttribute(values[i]));
            }
            else if (action.match(/has/ig)) return elem.hasAttribute(values[i]);
        }

        return result.length > 1 ? result : result[0];
    }

    /**
     * makes an element
     * 
     * @param {string} elem 
     * the type of element to make
     * 
     * @param {string} attrs 
     * the attributes to apply to the element
     * multiple attributes can be set by separating with a comma
     * 
     * @return {HTMLElement}
     */
    fn.make = function (elem, attrs) {
        var node = document.createElement(elem);

        if (attrs) this.attr(node, "set", attrs);

        return node;
    }

    /**
     * appends newly made elements
     * 
     * @param {any} appendTo 
     * where to append the element to
     * 
     * @param  {...any} elems 
     * the elements to append
     * 
     * @return {void}
     */
    fn.append = function (appendTo, ...elems) {
        appendTo = appendTo ? appendTo : document.body;

        for (let i = 0; i < elems.length; i++) appendTo.append(elems[i]);
    }

    /**
     * inserts a node before another node
     * 
     * @param {HTMLElement} parent
     * the container element
     * 
     * @param {HTMLElement} newNode
     * the node to prepend
     * 
     * @param {HTMLElement} before 
     * the node to insert before
     * 
     * @return {void}
     * 
     */
    fn.prepend = function (parent, newNode, before) {
        parent.insertBefore(newNode, before);
    }

    /**
     * outputs the editor starting point: <p>&#8203;</p>
     * 
     * @return {string}
     */
    fn.editorBlank = function () {
        return `<p>&#8203;</p>`;
    }

    /**
     * creates event listeners
     * 
     * @param {HTMLElement} elem 
     * the element or elements to perform events on
     * 
     * @param {string} type 
     * event types to perform on the selected elements
     * 
     * @param {function} callback 
     * the event callback
     * 
     * @return {void}
     */
    fn.events = function (elem, type, callback) {
        var types = type.split(/ ,|, |,/g);

        for (let i = 0; i < elem.length; i++) {
            for (let x = 0; x < types.length; x++) {
                elem[i].addEventListener(types[x], ev);
            }
        }

        function ev (e) {
            callback ? callback(e) : null;
        }
    }

    /**
     * gets the parents of the selected node
     * 
     * @param {HTMLElement} node
     * the node to get the parents list from
     * 
     * @param {string} elem
     * the query selector for the element to get from the parents list
     * 
     * @param {boolean} getNode
     * returns the matched node
     * 
     * @return {array|boolean}
     */
    fn.parents = function (node, elem, getNode) {
        var nodes = [],
            result = false;

        while (node) {
            node = node.parentNode;

            nodes.push(node);

            if (elem && elem === node.localName) {
                result = getNode ? node : true;
                break;
            }

            if (node.localName === "html") break;
        }

        return elem ? result : nodes;
    }

    /**
     * gets full list of child elements
     * 
     * @param {HTMLElement} node 
     * the node to get the child list from
     * 
     * @param {string} elem 
     * the element to get from the children list
     * 
     * @return {array|boolean}
     */
    fn.children = function (node, elem) {
        var result = false,
            children = [];

        if (node.localName) {
            children = node.querySelectorAll("*");

            for (let i = 0; i < children.length; i++) {
                if (children[i].localName === elem) {
                    result = true;
                    break;
                }
            }
        }

        children = children.length > 1 ? children : false;

        return elem ? result : children;
    }

    /**
     * checks if the type of element is a block type
     * 
     * @param {string|HTMLElement} elem 
     * 
     * @return {boolean}
     */
    fn.isBlockElement = function (elem) {
        var blocks = ["address", "article", "aside", "blockquote", "details", "dialog", "dd", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "h4", "li", "main", "nav", "ol", "pre", "section", "table", "ul"];

        if (typeof elem === "string") {
            if (blocks.indexOf(elem) !== -1) return true;
        }
        else if (typeof elem === "object") {
            if (blocks.indexOf(elem.nodeName.toLowerCase()) !== -1) return true;
        }

        return false;
    }

    /**
     * gets start and end points of a selection range
     * 
     * @param {object} range 
     * 
     * 
     * @returns 
     */
    fn.startAndEnd = function (range) {
        var start = range.startContainer,
            end = range.endContainer;

        return {start, end};
    }

    /**
     * checks if the selected format is contained within or 
     * parent of the selected element
     * 
     * @param {HTMLElement} elem 
     * the element to observe
     * 
     * @param {string} format 
     * the format to look for
     * 
     * @return {object} 
     */
    fn.formatObserver = function (elem, format) {
        var parents = this.parents(elem, format),
            children = this.children(elem, format),
            hasParent = false,
            hasChild = false;
        
        if (parents) hasParent = true;
        else if (children) hasChild = true;
        
        return {parent : hasParent, child : hasChild};
    }

    /**
     * tests to see if the start and end point of a selection range
     * is of the same container element
     * 
     * @param {object} range 
     * the range object
     * 
     * @return {boolean}
     */
    fn.sameScope = function (range) {
        var start = range.startContainer.parentNode,
            end = range.endContainer.parentNode;

        return start === end;
    }

    /**
     * checks if the editor selection contains a format element
     * 
     * @param {*} selection 
     * 
     * @param {*} format 
     * 
     * @return {void }
     */
    fn.selectionContains = function (selection, format) {
        var tmp = this.make("div");

        tmp.append(selection);

        var all = tmp.querySelectorAll("*");

        for (let i = 0; i < all.length; i++) {
            if (all[i].nodeName.toLowerCase() === format) return true;
        }

        return false;
    }

    /**
     * creates a string version of the editor content
     * 
     * @param {HTMLElement} editor 
     * the body element of the editor
     * 
     * @return {string}
     */
    fn.editorProto = function (editor) {
        var tmp = this.make("div");

        tmp.innerHTML = editor.innerHTML;

        return tmp;
    }

    /**
     * creates a temporary element with the selection contents within
     * 
     * @param {object} selected 
     * a fragment of a range selection
     * 
     * @param {boolean} asString 
     * if true a string version of the selection will be returned
     * 
     * @return {string|HTMLElement}
     */
    fn.tmp = function (selected, asString) {
        var tmp = this.make("div");

        tmp.append(selected);

        return asString ? tmp.innerHTML : tmp;
    }

    /**
     * escapes special regex characters
     * 
     * @param {string} subject 
     * the string to escape
     * 
     * @return {void}
     */
    fn.escape = function (subject) {
        subject = subject.replace(/(\.)/igm, "\\$1");
        subject = subject.replace(/(\$)/igm, "\\$1");
        subject = subject.replace(/(\^)/igm, "\\$1");
        subject = subject.replace(/(\[)/igm, "\\$1");
        subject = subject.replace(/(\])/igm, "\\$1");
        subject = subject.replace(/(\()/igm, "\\$1");
        subject = subject.replace(/(\))/igm, "\\$1");
        subject = subject.replace(/(\?)/igm, "\\$1");
        subject = subject.replace(/(\*)/igm, "\\$1");
        subject = subject.replace(/(\+)/igm, "\\$1");
        subject = subject.replace(/(\|)/igm, "\\$1");
        subject = subject.replace(/(\/)/igm, "\\$1");

        return subject;
    }

    /**
     * removes wrapper elements from the selection
     * 
     * @param {string} subject 
     * the string to strip
     * 
     * @return {string}
     */
    fn.stripContainer = function (subject) {
        if (!subject) return subject;

        subject = subject.replace(/>/gm, ">:$").replace(/</gm, ":$<").split(/:\$/gm).filter((item) => item !== "");

        for (let i = 0; i < subject.length; i++) {
            if (!subject[i].match(/<.*?>/i)) break;

            if (subject[i].match(/<.*?>/i)) {
                subject[i] = "";
            }
        }

        for (let i = subject.length - 1; i >= 0; i--) {
            if (!subject[i].match(/<.*?>/i)) break;

            if (subject[i].match(/<.*?>/i)) {
                subject[i] = "";
            }
        }

        subject.filter((item) => item !== "");

        return subject.join("");
    }

    /**
     * gets the container paragraph elements of the start and end points
     * of the range then selects all the nodes between them
     * 
     * @param {object} range 
     * the range object
     * 
     * @return {array}
     */
    fn.lines = function (range) {
        var body = this.parents(range.startContainer, "body", true),
            start = this.parents(range.startContainer, "p", true),
            end = this.parents(range.endContainer, "p", true),
            lines = [];

        for (let i = 0; i < body.children.length; i++) {
            if (body.children[i] === end) {
                lines.push(body.children[i]);

                break;
            }

            if (body.children[i] === start || lines.length > 0) lines.push(body.children[i]);
        }

        return lines;
    }

    /**
     * gets all lines of the editor
     * 
     * @param {object} range 
     * the range object
     * 
     * @return {array}
     */
    fn.allLines = function (range) {
        var body = this.parents(range.startContainer, "body", true),
            lines = [];

        for (let i = 0; i < body.children.length; i++) lines.push(body.children[i]);

        return lines;
    }

    /**
     * cleans up HTML to prevent nesting of the same node, two of the same nodes as siblings will be
     * melded into one to improve optimisation
     * 
     * @param {htmlElement} elem
     * the element to check for nesting or neighboring siblings
     *  
     * @param {string} type 
     * the type of element to prevent the nesting or neighboring of
     * 
     * @return {void}
     */
    fn.cleanUp = function (elem, type) {
        var elems = elem.querySelectorAll(type),
            all = elem.querySelectorAll("*"),
            reg = new RegExp(`<${type}>|<\/${type}>`, "igm"),
            siblings = new RegExp(`<\/${type}><${type}>`, "igm");

        for (let i = 0; i < elems.length; i++) {
            if (elems[i].innerHTML.match(reg)) elems[i].innerHTML = elems[i].innerHTML.replace(reg, "");
        }

        if (elem.innerHTML.match(siblings)) elem.innerHTML = elem.innerHTML.replace(siblings, "");
    }

    return fn;
})();