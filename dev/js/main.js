//import { Context } from "/context.min.js";
import Context from "/classes/Context.js";

const ctx = new Context(`[data-node="editor-one"]`);

ctx.tools.set("underline", "u", "U");

ctx.start();

