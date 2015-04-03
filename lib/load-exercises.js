var fs = require('fs');
var path = require('path');
var kgo = require('kgo');
var within = require('whisk/within');
var match = require('whisk/match');
var toAST = require('marked-ast').parse;

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
    var pending = [].concat(lessons);
    var loaded = [];
    var current;
    var heading;
    
    function loadNext() {
      if (pending.length === 0) {
        return callback(null, loaded);
      }
      
      current = pending.shift();
      fs.readFile(path.join(exercisePath, current, 'README.md'), 'utf8', function(err, data) {
        if (err) {
          return callback(new Error('A lesson must include a valid README.md file'));
        }
        
        // parse the document contents using marked-ast
        heading = toAST(data).filter(match({ type: 'heading', level: 1 }))[0];
        
        // if no heading was found then error
        if (! heading) {
          return callback(new Error('no H1 found in ' + current + ' lesson README'));
        }
        
        loaded.push({
          id: current,
          heading: heading.raw,
          readme: data
        });
        
        loadNext();
      });
    }
    
    loadNext();
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