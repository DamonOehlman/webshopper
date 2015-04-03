module.exports = function(router) {
  return function(exercises, callback) {
    console.log('creating routes from exercises: ', exercises);
    
    router.addRoute('/', function(req, res) {
      res.statusCode = 200;
      res.end(exercises.join('\n'));
    });
    
    exercises.forEach(function(exercise) {
      router.addRoute('/exercise/' + exercise.id, function(req, res) {
        res.statusCode = 200;
        res.end(exercise);
      });
    });
    
    callback();
  };
};