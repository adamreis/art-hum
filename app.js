
/**
 * Module dependencies.
 */

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
    path = require('path'),
    mustache = require('mustache-express'),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs');

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
});
  var mapSchema = mongoose.Schema({
    // id: String,
    theme: String,
    tags: []
  });

  var tagSchema = mongoose.Schema({
    id: String,
    theme: String,
    picture: String,
    description: String,
    name: String,
    year: String,
    artist: String,
    pos: {x: Number, y: Number}
  });

  var Map = mongoose.model('Map', mapSchema);
  var Tag = mongoose.model('Tag', tagSchema);
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


var map = new Map({
  theme: '',
  tags: []
});

/**
 * Serve my code
 */

app.get('/', function (req, res, next){
  if (map.theme != '') {
    res.render('redirect.mustache');
  }
  res.render('index.mustache', { title: 'Express' });
});

app.get('/map', function (req, res, next){
  if (!map.theme && req.query.theme) {
    map.theme = req.query.theme;
  }
  res.render('mapview.mustache', {theme: map.theme});
});

app.get('/tag', function (req, res, next) {
  id = req.query.id;
  var curTag;
  for (var i = 0; i< map.tags.length; i++) {
    if (map.tags[i].id == id) {
      curTag = map.tags[i];
      break;
    }
  }
  if (!curTag) res.send('invalid tag id');
  res.render('tagview.mustache', {
                                  theme: curTag.theme,
                                  picture: curTag.picture,
                                  name: curTag.name,
                                  artist: curTag.artist,
                                  year: curTag.year,
                                  description: curTag.description});
});

app.get('/upload', function (req, res, next) {
  res.render('uploadform.mustache', {id: req.query.id});
});

app.post('/upload', function (req, res, next) {
  console.log('received post');
  var id = req.body.id,
      picture = req.files.picture,
      message = req.body.message,
      year = req.body.year,
      name = req.body.name,
      artist = req.body.artist;
  var tempPath = picture.path,
      // targetPath = path.resolve('./public/'+picture.originalFilename);
      targetPath = __dirname+'/public/uploads/'+encodeURI(picture.originalFilename);
  fs.rename(tempPath, targetPath, function (err) {
    if (err) {
      console.log('error inside fs.rename');
      throw err;
    }
    console.log('Upload completed!');
  });

  var coords = id.split('-').map(function (item) {
    return parseInt(item, 10);
  });

  var tag = new Tag({
    id: id,
    theme: map.theme,
    picture: '/uploads/'+encodeURI(picture.originalFilename),
    description: message,
    name: name,
    year: year,
    artist: artist,
    pos: {x: coords[0], y: coords[1]}
  });
  map.tags.push(tag);

  io.sockets.emit('position', JSON.stringify({pos:tag.pos, link: '/tag?id='+tag.id}))
  res.render('redirect.mustache', {url: '/map'});
});


/**
 * Socket.IO stuff
 */

// var total = 0;

io.sockets.on('connection', function(socket) {
  // send everyone's positions
  console.log('initializing new connection');
  socket.emit('initialize', JSON.stringify(map.tags));

  // give the socket an id
  // socket.id = ++total;
  // console.log('connection # '+socket.id);
});


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
