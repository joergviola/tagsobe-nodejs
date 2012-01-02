
/*
 * GET home page.
 */

exports.index = function(req, res){
	console.log("index invoked");
	res.render('index', { title: 'Express' })
};


exports.search = function(req, res){
	console.log("search invoked");
	res.render('search', {title: 'Search'})
};


exports.hotels = function(req, res){
	console.log("hotels invoked");
	
	res.render('hotels', {title: 'Hotels'})
};