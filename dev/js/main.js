//import { Context } from "/context.min.js";
import Context from "/context/Context.js";

const ctx = new Context(`[data-node="mrg-editor"]`);

//ctx.components.get("ContextEditor", editor => {
	//editor.size(800, 300);
//});

//ctx.components.get("ContextFormats", format => {
	//format.register = set => {
		//set("underline", "u", "_");
	//}

	//format.add = add => {
		//add("underline", "u", "_");
	//}

	//format.inner = inner => {
		//inner("{underline}");
	//}

	//format.remove = remove => {
		//remove("bold");
	//}
//});

//ctx.layout(`
	//<ContextWrapper>
		//<ContextEditor></ContextEditor>
	//</ContextWrapper>
//`);

//ctx.formats.add("underline", "u");

ctx.init();
