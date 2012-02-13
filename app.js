
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , moment = require('moment')
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
	  host: "localhost",
	  logging: false
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
var Booking = sequelize.define('Booking', {
	username : Sequelize.STRING,
	hotel: Sequelize.INTEGER,
	checkinDate: Sequelize.DATE,
	checkoutDate: Sequelize.DATE,
	creditCard : Sequelize.STRING,
	creditCardName : Sequelize.STRING,
	creditCardExpiryMonth: Sequelize.INTEGER,
	creditCardExpiryYear: Sequelize.INTEGER,
	smoking : Sequelize.STRING,
	beds: Sequelize.INTEGER,
	amenities : Sequelize.STRING,
	state : Sequelize.STRING
}, {timestamps: false,freezeTableName: true});
Booking.hasOne(Hotel);
sequelize.sync();

// Authentication

function loggedIn(req, res, next) {
	req.session.user!=null
	    ? next()
	    : res.redirect("/login?url="+encodeURI(req.url));
}

//Routes

app.get('/', routes.index);
app.get('/login', function(req, res){
	res.render('login', {title: 'Login', url: req.param("url")});
});
app.post('/authenticate', function(req, res){
	var query = Customer.find({ where: {username: req.param("username")} });
	query.on("success", function(user) {
		if (user!=null) {
			req.session.user = user.username;
			res.redirect(encodeURI(req.param("url")));
		}
	})
});
app.get('/logout', function(req, res){
	req.session.destroy();
	res.redirect("/");
});
app.get('/search', loggedIn, function(req, res){
	Booking.findAll({where:{state: 'BOOKED'}}).on('success', function(bookings) {
		res.render('search', {title: 'Search', bookings: bookings})
	});
});


app.get('/hotels/:id', function(req, res){
	var query = Hotel.find(parseInt(req.params.id));
	query.on('success', function(result) {
		res.render('detail', {title: 'Hotel Detail', hotel: result});
	});
});
app.get('/hotels', function(req, res){
	var query = Hotel.findAll({where:["name like ?", "%"+req.param("searchString")+"%"]});
	query.on('success', function(result) {
		res.render('hotels', {title: 'Hotels', hotels: result});
	});
});
app.get('/booking', loggedIn, function(req, res){
	var query = Hotel.find(parseInt(req.param["hotelId"]));
	query.on('success', function(result) {
		res.render('booking', {title: 'Reservation', hotel: result});
	});
});
app.post('/confirm', loggedIn, function(req, res){
	var query = Hotel.find(parseInt(req.body["hotelId"]));
	query.on('success', function(result) {
		var booking = Booking.build({
			username : req.session.user,
			hotel: result.id,
			checkinDate: moment(req.body.checkinDate, "MM-DD-YYYY"),
			checkoutDate: moment(req.body.checkoutDate, "MM-DD-YYYY"),
			creditCard : req.body.creditCard,
			creditCardName : req.body.creditCardName,
			creditCardExpiryMonth: parseInt(req.body.creditCardExpiryMonth),
			creditCardExpiryYear: parseInt(req.body.creditCardExpiryYear),
			smoking : req.body.smoking,
			beds: 1,
			amenities : req.body.amenities,
			state : 'CREATED'
		});
		booking.save().on('success', function() {
			booking.numberOfNights = (booking.checkoutDate - booking.checkinDate) / (24*60*60*1000);
			booking.totalPayment = booking.numberOfNights * result.price;
			res.render('confirm', {title: 'Confirmation', hotel: result, booking: booking});
		}).on('failure', function(error) {
			console.log(error);
			res.send(error, 500);
		})
	});
});
app.post('/book', loggedIn, function(req, res){
	var query = Booking.find(parseInt(req.body["bookingId"]));
	query.on('success', function(booking) {
		if (req.body["_eventId_confirm"]!=null) {
			booking.state = "BOOKED";
			booking.save().on('success', function() {
				res.redirect("/search");
			}).on('failure', function(error) {
				console.log(error);
				res.send(error, 500);
			})
		} else if (req.body["_eventId_cancel"]!=null) {
			booking.state = "CANCELLED";
			booking.save().on('success', function() {
				res.redirect("/search");
			}).on('failure', function(error) {
				console.log(error);
				res.send(error, 500);
			})
		} else if (req.body["_eventId_revise"]!=null) {
			Hotel.find(booking.hotel).on('success', function(hotel) {
				booking.numberOfNights = (booking.checkoutDate - booking.checkinDate) / (24*60*60*1000);
				booking.totalPayment = booking.numberOfNights * hotel.price;
				res.render('confirm', {title: 'Revise', hotel: hotel, booking: booking});
			})
		}
	});
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

