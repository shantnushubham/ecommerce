var express = require('express')
var router = express.Router()
var cors = require('cors')

// Controllers
var userControl = require('../../controllers/user/userController')

// Middlewares
var UserMiddleware = require('../../Middlewares/user/middleware')
// CORS Config
var corsOptions = require('../config/cors')

// Routes
router.use('/', cors(corsOptions))

// -> /api/user
router.get('/getUserById', UserMiddleware.verifyUser, userControl.getUserById)
router.post('/addUserAddress', UserMiddleware.verifyUser, userControl.addUserAddress)
router.put('/updateUserData', UserMiddleware.verifyUser, userControl.updateUserData)
router.put('/makeDefaultAddress', UserMiddleware.verifyUser, userControl.makeAdressToDefaultAddress)
router.put('/updateAddress', UserMiddleware.verifyUser, userControl.updateUserAddress)
router.delete('/deleteUser', UserMiddleware.verifyUser, userControl.deleteUserById)
router.delete('/deleteAddress', UserMiddleware.verifyUser, userControl.deleteAddress)



module.exports = router