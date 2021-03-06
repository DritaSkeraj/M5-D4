const express = require("express")
const listEndpoints = require("express-list-endpoints")
const cors = require("cors");
const {join} = require("path")
const studentsRouter = require("./services/students")
const projectsRouter = require("./services/projects")

const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  catchAllHandler,
} = require("./errorHandling")

const server = express()

const port = process.env.PORT || 3002
const publicFolderPath = join(__dirname, "../public/img/students");

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`)
  next()
}

server.use(cors())
server.use(express.json())
server.use(loggerMiddleware)
server.use(express.static(publicFolderPath))

server.use("/students", studentsRouter)
server.use("/projects", projectsRouter)

// ERROR HANDLERS

server.use(notFoundHandler)
server.use(unauthorizedHandler)
server.use(forbiddenHandler)
server.use(catchAllHandler)

console.log("listEndpoints(server) => ", listEndpoints(server))

server.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
