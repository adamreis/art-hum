
/**
 * Module dependencies.
 */

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
    path = require('path'),
    mustache = require('mustache-express'),
    mongoose = require('mongoose');

app.configure(function() {
  // all environments
  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.engine('mustache', mustache());
  // app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.favicon(path.join(__dirname,'/public/images/favicon.ico')));
  app.use(express.static(path.join(__dirname, 'public')));
});

// console.log('expected favicon path: ' + path.join(__dirname,'/public/images/favicon.ico'));

// development only
// if ('development' == app.get('env')) {
  app.use(express.errorHandler());
// }

/**
 * Set up mongo
 */

mongoose.connect('mongodb://localhost/arthum');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log('db open!');

  var mapSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    theme: String,
    tags: []
  });

  var Map = mongoose.model('Map', mapSchema);
  // var map = new Map({
  //   // _id:1,
  //   theme:'Leisure',
  //   tags: []
  // });
  //
  // map.save(function (err, map) {
  //   if (err) return console.error(err);
  //   console.log('save for map with theme ' + map.theme + ' successful');
  // });
});


/**
 * Serve my code
 */

app.get('/', function (req, res, next){
  res.render('index.mustache', { title: 'Express' });
});

app.get('/map', function (req, res, next){
  res.render('mapview.mustache', {theme: req.query.theme});
});

app.get('/upload', function (req, res, next) {
  res.render('uploadform.mustache', {id: req.query.id});
});

app.post('/upload', function (req, res, next) {
  var id = req.body.id,
      picture = req.files.picture,
      message = req.body.message;
  console.log('upload seems to have worked.  Picture:');
  console.log(picture);
});

// app.get('/uploadform.html', function (req, res, next) {
//   res.render('uploadform.html');
// });

/**
 * Socket.IO stuff
 */

var positions = {},
    total = 0;

io.sockets.on('connection', function(socket) {
  // send everyone's positions
  socket.emit('initialize', JSON.stringify(positions));

  // give the socket an id
  socket.id = ++total;
  console.log('connection # '+socket.id);

  socket.on('click', function(msg) {
    msg = JSON.parse(msg);
    positions[socket.id] = msg;
    io.sockets.emit('position', JSON.stringify({pos: msg.pos, id: socket.id, link: msg.link}));
  });

  socket.on('disconnect', function () {
    console.log('connection # ' + socket.id + ' closed');
    delete positions[socket.id];
    socket.broadcast.emit('disconnect', JSON.stringify({ id: socket.id}));
  });

});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
