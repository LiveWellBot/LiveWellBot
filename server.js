// Babel ES6/JSX Compiler
require('babel-register');

var path = require('path');
var express = require('express');
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
        res.json(livewells);
    })
});

  // GET Single Livewell
  app.get('/api/livewell/:id', function(req,res){
    Livewell.findeOne({_id: req.params._id}, function(err, livewell) {
      if(err) return res.status(500).json({error: err});
      if(!livewell) return res.status(404).json({error: 'The id not found'});
      res.json(livewell);
    })
  });

  // GET single image
  app.get('/api/livewell/:_id/:images_id', function(req, res){
    Livewell.find({_id: req.params._id}, function(err, livewell){
        if(err) return res.status(500).json({error: err});
        if(livewells.length === 0) return res.status(404).json({error: 'the image not found'});
        res.json(livewell);
    })
  });

  // POST Livewell (CREATE)
  app.post('/api/livewell', function(req, res){
    var livewell = new Livewell();
    livewell.chat_id = req.body.chat_id;

    livewell.save(function(err) {
      if(err) {
        console.error(err);
        res.json({error: err});
        return;
      }
      res.json(livewell);
    });
  });

  // PUT Image (UPDATE)
  app.put('/api/livewell/:id', function(req, res){
    Livewell.findById(req.params._id, function(err, livewell){
     if(err) return res.status(500).json({ error: 'database failure' });
     if(!livewell) return res.status(404).json({ error: 'the image not found' });

     if(req.body.images.img_url) livewell.images.img_url = req.body.images.img_url;
     if(req.body.images.upload_date) livewell.images.upload_date = req.body.images.upload_date;
     if(req.body.images.weight) livewell.images.weight = req.body.images.weight;
     if(req.body.images.feeling) livewell.images.feeling = req.body.images.feeling;
     if(req.body.images.memo) livewell.images.memo = req.body.images.memo;
     if(req.body.images.tags) livewell.images.tags = req.body.images.tags;

     Livewell.save(function(err){
         if(err) res.status(500).json({error: 'failed to update'});
         res.json({message: 'Image updated'});
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

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
