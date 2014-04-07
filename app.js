
/**
 * Module dependencies.
 */

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
    path = require('path'),
    mustache = require('mustache-express');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('mustache', mustache());
// app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.favicon(path.join(__dirname,'/public/images/favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

// console.log('expected favicon path: ' + path.join(__dirname,'/public/images/favicon.ico'));

// development only
// if ('development' == app.get('env')) {
  app.use(express.errorHandler());
// }

/**
 * Serve my code
 */

app.get('/', function(req, res, next){
  res.render('index.mustache', { title: 'Express' });
});

app.get('/map', function(req, res, next){
  res.send('hey thurr')
});

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
    try {
      var pos = JSON.parse(msg);
    } catch (e) {
      return;
    }
    positions[socket.id] = pos;
    io.sockets.emit('position', JSON.stringify({pos: pos, id: socket.id}));
    socket.emit('hi');
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
