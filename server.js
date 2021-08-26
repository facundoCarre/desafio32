// -------------- ARTILLERY (TEST DE CARGA) -------------------
//https://medium.com/the-andela-way/scaling-out-with-node-clusters-1dca4a39a2a
//npm i -g artillery
//npm list -g | grep artillery

//Setear el servidor en modo fork
//node server.js 8081 FORK
//artillery quick --count 50 -n 40 http://localhost:8081?max=100000 > result_fork.txt

//Setear el servidor en modo cluster
//node server.js 8081 CLUSTER
//artillery quick --count 50 -n 40 http://localhost:8081?max=100000 > result_cluster.txt

import express from 'express'
import cluster from 'cluster'
import * as os from 'os'

const modoCluster = process.argv[3] == 'CLUSTER'

/* --------------------------------------------------------------------------- */
/* MASTER */
if (modoCluster && cluster.isMaster) {
    const numCPUs = os.cpus().length

    console.log(`Número de procesadores: ${numCPUs}`)
    console.log(`PID MASTER ${process.pid}`)

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork()
    }

    cluster.on('exit', worker => {
        console.log('Worker', worker.process.pid, 'died', new Date().toLocaleString())
        cluster.fork()
    })
}
else {
    const app = express()

    app.get('/info', (req, res) => {
        let resp= {}
        resp ={
          'version de node ' : process.version,
          'sistema operativo': process.platform,
          'uso de la memoria': process.memoryUsage(),
          'id del proceso': process.pid,
          'path de ejecucion': process.execPath,
          'arumentos de entrada': process.argv,
          'carpeta corriente': process.cwd()
    
        }
        res.send(resp)
    
    });

    app.get('/info-cosole-log', (req, res) => {
        let resp= {}
        resp ={
          'version de node ' : process.version,
          'sistema operativo': process.platform,
          'uso de la memoria': process.memoryUsage(),
          'id del proceso': process.pid,
          'path de ejecucion': process.execPath,
          'arumentos de entrada': process.argv,
          'carpeta corriente': process.cwd()
    
        }
        console.log(resp)
        res.send(resp)
    
    });

    const PORT = parseInt(process.argv[2]) || 8080;

    app.listen(PORT, err => {
        if (!err) console.log(`Servidor express escuchando en http://localhost:${PORT} - PID WORKER ${process.pid}`)
    })
}
