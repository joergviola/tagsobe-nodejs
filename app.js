
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , Sequelize = require("sequelize")

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Database

var sequelize = new Sequelize('tagsobe', 'tagsobe', 'tagsobe', {
	  host: "localhost"
});
var Customer = sequelize.define('Customer', {
	username: Sequelize.STRING,
	password: Sequelize.STRING,
	name : Sequelize.STRING
}, {timestamps: false,freezeTableName: true});
var Hotel = sequelize.define('Hotel', {
	id: Sequelize.INTEGER,
	price: Sequelize.INTEGER,
	name: Sequelize.STRING,
	address: Sequelize.STRING,
	city: Sequelize.STRING,
	state: Sequelize.STRING,
	zip: Sequelize.STRING,
	country: Sequelize.STRING
}, {timestamps: false,freezeTableName: true});
sequelize.sync();

//Routes

app.get('/', routes.index);
app.get('/search', routes.search);
app.get('/hotels', function(req, res){
	console.log("hotels invoked");
	var query = Hotel.findAll({where:["name like ?", "%"+req.param("searchString")+"%"]});
	query.on('success', function(result) {
		res.render('hotels', {title: 'Hotels', hotels: result});
	});
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

