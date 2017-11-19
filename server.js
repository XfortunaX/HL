const cluster = require('cluster');
const httpServer = require('./httpServer/httpServer');

const configParser = require('./httpServer/parserConfig');
const config = configParser(__dirname + '/etc/httpd.conf');
config.document_root = __dirname + config.document_root;

const numCPUs = config.cpu_limit;

if (cluster.isMaster) {
  // console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {

  const router = new httpServer(config.listen, config.document_root);
  router._get('*', (req, res) => {
    res.sendFileOr404(req)
  });

  router._head('*', (req, res) => {
    res.checkFileOr404(req)
  });

  console.log(`Worker ${process.pid} started`);
}
