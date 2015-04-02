var fs = require('fs');
var path = require('path');
var kgo = require('kgo');
var within = require('whisk/within');

module.exports = function(exercisePath, callback) {
  
  function find(callback) {
    fs.readdir(exercisePath, callback);
  }
  
  function sort(files, callback) {
    var current;
    var pending = [].concat(files);
    var valid = [];
    
    function statNext() {
      if (pending.length === 0) {
        return sortValid();
      }
      
      current = pending.shift();
      fs.stat(path.join(exercisePath, current), function(err, stats) {
        if (err) {
          return callback(err);
        }
        
        if (stats.isDirectory()) {
          valid.push(current);
        }
        
        statNext();
      });
    }
    
    function sortValid() {
      fs.readFile(path.join(exercisePath, 'lessonplan.txt'), 'utf8', function(err, data) {
        if (err) {
          return callback(null, valid.sort());
        }
        
        callback(null, data.split(require('reu/newline')).filter(within(valid)));
      });
    }
    
    statNext();
  }
  
  function load(lessons, callback) {
    console.log('loading lessons');
    callback(null, lessons);
  }
  
  kgo
  ('find', find)
  ('sort', ['find'], sort)
  ('load', ['sort'], load)
  ('complete', ['load'], function(lessons) {
    callback(null, lessons);
  })
  .on('error', callback);
};