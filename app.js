
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
  app.use(express.cookieParser());
  app.use(express.session({ secret: "KJGUIIUGU3425KZGU" }));
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

// Authentication

function loggedIn(req, res, next) {
	req.session.user!=null
	    ? next()
	    : res.redirect("/login?url="+req.url);
}

//Routes

app.get('/', routes.index);
app.get('/login', function(req, res){
	console.log("login invoked");
	res.render('login', {title: 'Login', url: req.param("url")});
});
app.post('/authenticate', function(req, res){
	console.log("authenticate invoked");
	var query = Customer.find({ where: {username: req.param("username")} });
	query.on("success", function(user) {
		if (user!=null) {
			req.session.user = user.username;
			res.redirect(req.param("url"));
		}
	})
});
app.get('/logout', function(req, res){
	console.log("logout invoked");
	req.session.destroy();
	res.redirect("/");
});
app.get('/search', routes.search);
app.get('/hotels/:id', function(req, res){
	console.log("hotel detail invoked");
	var query = Hotel.find(parseInt(req.params.id));
	query.on('success', function(result) {
		res.render('detail', {title: 'Hotel Detail', hotel: result});
	});
});
app.get('/hotels', function(req, res){
	console.log("hotel search invoked");
	var query = Hotel.findAll({where:["name like ?", "%"+req.param("searchString")+"%"]});
	query.on('success', function(result) {
		res.render('hotels', {title: 'Hotels', hotels: result});
	});
});
app.get('/booking', loggedIn, function(req, res){
	console.log("booking invoked");
	var query = Hotel.findAll({where:["name like ?", "%"+req.param("searchString")+"%"]});
	query.on('success', function(result) {
		res.render('hotels', {title: 'Hotels', hotels: result});
	});
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

