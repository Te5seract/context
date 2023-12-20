//import { Context } from "/context.min.js";
import Context from "/context/Context.js";

const ctx = new Context(`[data-node="editor-one"]`, {
    width : 800,
    height: 400
});

ctx.init();


const ctxTwo = new Context(`[data-node="editor-two"]`, {
    width : 400,
    height: 200
});

ctxTwo.init();
