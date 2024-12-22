module.exports = function(app) {
    app.get('/service-worker.js', (req, res) => {
      res.set('Content-Type', 'application/javascript');
      res.sendFile('service-worker.js', { root: 'public' });
    });
  };