import Express from 'express'
import listEndpoints from 'express-list-endpoints'
import authorsRouter from './api/authors/index.js'
import cors from 'cors'

const server = Express()
const port = 3000


server.use(Express.json())
server.use("/authors", authorsRouter)

server.use(cors()) // EXTRA 2

server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("The server is running in port " + port)
})
