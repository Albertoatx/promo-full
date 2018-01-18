var express    = require('express');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var path       = require('path'); //Para poder trabajar con directorios al concatenar con "__dirname"
//Since version 1.5.0, the "cookie-parser" middleware no longer needs to be used for this module to work.
var session    = require('express-session'); //Middleware module to manage sessions

var cookieParser = require('cookie-parser');
//var methodOverride = require('method-override');
//var _ = require('lodash');

// Create the application.
var app = express();

// Add Middleware necessary for REST API's.
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser('secretpromotores'));
app.use(session({
  secret: 'secretpromotores',  //Required option: This is the secret used to sign the session ID cookie. 
  resave: false,                //Optional: Forces the session to be saved back to the session store. Typically, you'll want false.
  saveUninitialized: true      //Optional: Forces a session that is "uninitialized" to be saved to the store. 
                                //          A session is uninitialized when it is new but not modified. 
                                //          Choosing false is useful for implementing login sessions, reducing server storage usage
  //cookie: { secure: true }
}));
//app.use(methodOverride('X-HTTP-Method-Override'));

// CORS Support (open the accesibility to every server to use our API, so everyone can access it)
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//We are asking express to expose client folder as a static path
//This way we can run our AngularJS client code on the same express server (cross-origin wont be required if we follow this)
app.use(express.static(path.join(__dirname, '../client'))); //Cargar todos los recursos que haya en el front-end

//En la ruta "http://localhost:3000/hello" 
//when sb hits the URL '/hello' i want you to call this callback function and I want you to pass me the request and response objects
//and then I also want you to give me the ability to go on to the "next" middleware (if not the response will never be sent )
app.use('/hello', function(req, res, next) {
  res.send('Hello World!');
  next();
});

//console.log(__dirname.substring(0, __dirname.indexOf("/server")));

//Ruta para conectar con Angular y su pagina principal (punto de entrada)
app.get('/', function (req, res) {
  res.sendfile(path.join(__dirname, '../client/index.html'));
});


//Rutas
//var routes = require('./routes/index');
//var users = require('./routes/users');
//var api = require('./routes/api');
var apiPromo = require('./controllers/PromotorCtrl');
var apiAuth = require('./controllers/AutenticacionCtrl');

// Connect to MongoDB
//      mpromise (mongoose's default promise library) is deprecated, 
//      plug in your own promise library instead: http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise; //Usar una libreria de promesas que no esta deprecated
//mongoose.connect('mongodb://localhost/obrasdb');
mongoose.connect('mongodb://localhost/obrasdb', {useMongoClient: true});
mongoose.connection.once('open', function() {
  
  // Load all the models
  app.models = require('./models/allmodels');

  app.use('/api', apiPromo);
  app.use('/auth', apiAuth);
								
  console.log('Listening on port 3000...');
  app.listen(3000);
});