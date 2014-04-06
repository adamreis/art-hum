
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mustache = require('mustache-express')

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'mustache');
app.engine('mustache', mustache());
app.use(express.favicon());
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

app.get('/', function(req, res, next){
  res.render('index.mustache', { title: 'Express' });
});

app.get('/map', function(req, res, next){
  res.send('hey thurr')
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
