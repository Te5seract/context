//import { Context } from "/context.min.js";
import Context from "/context/Context.js";

const ctx = new Context(`[data-node="mrg-editor"]`);

//ctx.components.get("ContextEditor", editor => {
	//editor.size(800, 300);
//});

ctx.components.get("ContextFormats", format => {
	//format.set = set => {
		//set("underline", "u", "_");
		//set("bold", "strong", "b");
	//}

	//format.add = add => {
		//add("underline", "u", "_");
	//}

	//format.remove = remove => {
		//remove("bold");
	//}
});

//ctx.formats.add("underline", "u");

ctx.init();
