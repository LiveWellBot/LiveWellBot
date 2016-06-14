// Babel ES6/JSX Compiler
require('babel-register');

var path = require('path');
var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var favicon = require('serve-favicon');
var logger = require('morgan');
var async = require('async');
var colors = require('colors');
var mongoose = require('mongoose');
var request = require('request');
var React = require('react');
var ReactDOM = require('react-dom/server');
var Router = require('react-router');
var swig  = require('swig');
var xml2js = require('xml2js');
var _ = require('underscore');

var config = require('./config');
var routes = require('./app/routes');
var Livewell = require('./models/livewell.model');

var app = express();

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?'.red);
});

app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * GET /api/livewell/:id
 * GET /api/livewell/:id/:images_id
 * POST /api/livewell
 * PUT /api/livewell/:id
 * DELETE /api/livewell/:id
 */

// GET ALL lIVEWELLS
app.get('/api/Livewells', function(req,res){
    Livewell.find(function(err, livewells){
        if(err) return res.status(500).send({error: 'database failure'});
        //res.json(livewells);
        res.send(livewells);
    })
});

  // GET Single Livewell
  app.get('/api/livewell/:_id', function(req,res){
    Livewell.findById(req.params._id, function(err, livewell) {
      if(err) return res.status(500).json({error: err});
      if(!livewell) return res.status(404).send({error: 'The id not found'});
      //res.json(livewell);
      res.send(livewell);
    })
  });

  // GET single image
  app.get('/api/livewell/:_id/:images_id', function(req, res){
    Livewell.findById(req.params._id, function(err, livewell){
        if(err) return res.status(500).json({error: err});
        if(livewell.length === 0) return res.status(404).json({error: 'the image not found'});
        res.send(livewell.images[0].data);
        // res.writeHead(200, {'Content-Type': 'text/html'});
        // res.write('<html><body><img src="data:image/png;base64,')
        // res.write(new Buffer(livewell.images[0].data).toString('base64'));
        // res.end('"/></body></html>');
    })
  });

  // POST Livewell (CREATE)
  app.post('/api/livewell', function(req, res){
    var livewell = new Livewell();
    livewell.chat_id = req.body.chat_id;

    livewell.save(function(err) {
      if(err) {
        console.error(err);
        res.json(err);
        return;
      }
      res.json(livewell);
    });
  });

  // PUT Image (UPDATE)
  app.put('/api/livewell/:_id', function(req, res){
    Livewell.findById(req.params._id, function(err, livewell){
     if(err) return res.status(500).json({ error: 'database failure' });
     if(!livewell) return res.status(404).json({ error: 'The id not found' });

      var imageObj = { 
        data: "../public/life.png",
        contentType: "",
        feeling: "Good"
         };
      livewell.images.push(imageObj);
     // livewell.images.data = fs.readFileSync(req.body.images.img_url);
     // livewell.images.contentType = 'image/png';
     // livewell.images.upload_date = req.body.images.upload_date;
     // livewell.images.weight = req.body.images.weight;
     // livewell.images.feeling = req.body.images.feeling;
     // livewell.images.memo = req.body.images.memo;
     // livewell.images.tags = req.body.images.tags;
     console.log(livewell);
     console.log("Image Success");

   livewell.save(function(err){
         if(err) res.status(500).send(err);
         res.send(livewell);
     });

 });
  });

  // DELETE Image
  app.delete('/api/livewell/:id', function(req, res){
    Livewell.remove({ _id: req.params.images.images_id }, function(err, output){
  if(err) return res.status(500).json({ error: "database failure" });

/*
  if(!output.result.n) return res.status(404).json({ error: "Image not found" });
  res.json({ message: "Image deleted" });
*/
  res.status(204).end();
})
  });


  app.use(function(req, res) {
    Router.match({ routes: routes.default, location: req.url }, function(err, redirectLocation, renderProps) {
      if (err) {
        res.status(500).send(err.message)
      } else if (redirectLocation) {
        res.status(302).redirect(redirectLocation.pathname + redirectLocation.search)
      } else if (renderProps) {
          var html = ReactDOM.renderToString(React.createElement(Router.RoutingContext, renderProps));
          var page = swig.renderFile('views/index.html', { html: html });
          res.status(200).send(page);
      } else {
        res.status(404).send('Page Not Found')
      }
    });
  });

  app.use(function(err, req, res, next) {
    console.log(err.stack.red);
    res.status(err.status || 500);
    res.send({ message: err.message });
  });

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
