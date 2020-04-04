var express = require('express')
var router = express.Router()
var cors = require('cors')

// Controllers
var userControl = require('../../controllers/api/user/userController')

// Middlewares
var UserMiddleware = require('../../Middlewares/user/middleware')
// CORS Config
var corsOptions = require('../config/cors')

// Routes
router.use('/', cors(corsOptions))

// -> /api/user
router.get('/getUserById/:id', UserMiddleware.verifyUser, userControl.getUserById)



module.exports = router