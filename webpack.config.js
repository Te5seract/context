import path from "path";
import TerserPlugin from "terser-webpack-plugin";

export default {
	mode : "production",
    entry : "./src/main.js",
    devServer : {
        static : [
            { directory : "./dev" },
            { directory : "./build" },
            { directory : "./src" }
        ],
        liveReload : true,
        port : 3000,
		open : [ "http://localhost:3000/" ]
    },

    experiments : {
        outputModule : true
    },

    output : {
        filename : "context.min.js",
        path : path.resolve("./", "build"),
        library : {
            type : "module"
        }
    },

    module : {
        rules : [
            {
                test : /\.js$/,
                exclude : "/node_modules/",
                use : {
                    loader : "babel-loader"
                }
            }
        ]
    }
};
