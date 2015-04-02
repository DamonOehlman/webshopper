var http = require('http');
var url = require('url');

var kgo = require('kgo');
var out = require('out');
var Router = require('routes');

module.exports = function(opts) {
  var router = new Router();
  var server = http.createServer(handleRequest);
  
  function handleRequest(req, res) {
    var path = url.parse(req.url).pathname;
    var match = router.match(path);
    
    // run the match
    (match && match.fn(req, res, match)) || notFound(req, res);
  }
  
  function notFound(req, res) {
    res.statusCode = 404;
    res.end('not found');
  }
  
  server.start = function() {
    server.listen((opts || {}).port || 0, function(err) {
      if (err) {
        return out.error(err);
      }
      
      out('workshop available @ http://localhost:{0}', server.address().port);
    });
  };
  
  kgo
  (opts || {})
  ('load-exercises', ['exercises'], require('./lib/load-exercises'))
  ('create-routes', ['load-exercises'], require('./lib/create-routes')(router))
  .on('error', out.error);
  
  
  return server;
};