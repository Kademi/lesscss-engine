print = lessenv.print;
quit = lessenv.quit;
readFile = lessenv.readFile;
delete arguments;

var basePath = function(path) {
	if (path != null) {
		return path.replace(/^(.*[\/\\])[^\/\\]*$/, '$1');
	}
	return '';
},
compile = function(source, path, compress) {
	var error = null,
	result = null,
	parser = new (window.less.Parser)({
		optimization : 3,
		paths : [ basePath(path) ],
		filename : path
	});
	window.less.Parser.importer = function(path, currentFileInfo, callback, env) {
		if (!/^\//.test(path) && !/^\w+:/.test(path)
				&& currentFileInfo.currentDirectory) {
			path = currentFileInfo.currentDirectory + path;
		}
		var sheetEnv = env.toSheet(path);
		sheetEnv.currentFileInfo = currentFileInfo;
		if (path != null) {
			try {
				new (window.less.Parser)({
					optimization : 3,
					paths : [ basePath(path) ],
					filename : path
				}).parse(String(lessenv.loader.load(path, lessenv.charset)),
						function(e, root) {
							if (e != null)
								throw e;
							callback(e, root, path);
						});
			} catch (e) {
				error = e;
				throw e;
			}
		}
	};
	parser.parse(source, function(e, root) {
		if (e != null)
			throw e;
		result = root.toCSS();
		if (compress)
			result = exports.compressor.cssmin(result);
	});
	if (error != null)
		throw error;
	if (result != null)
		return result;
	else
		return '';
};
