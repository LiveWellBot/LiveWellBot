'use strict';

var mongoose = require('mongoose');

var livewellSchema = new mongoose.Schema({
  chat_id: { type: Number, required: true, unique: true },
  join_date: { type: Date, default: Date.now },
  images: [{
    data: Buffer,
    contentType: String,
    upload_date: { type: Date, default: Date.now },
    weight: Number,
    feeling: String,
    memo: String,
    tags: [{ type: String }]
  }],
});



module.exports = mongoose.model('Livewell', livewellSchema);
