
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log("index invoked");
	res.redirect("/search");
};

