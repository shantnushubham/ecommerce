var express = require('express')
var router = express.Router()
var cors = require('cors')

// Controllers
var UserControl = require('../../controllers/api/user/userController')

// Middlewares
var UserMiddleware = require('../../Middlewares/user/middleware')
// CORS Config
var corsOptions = require('../config/cors')

// Routes
router.use('/', cors(corsOptions))

// -> /api/user
router.post('/login', UserControl.login)
router.post('/register', UserControl.register)


// -> /api/user
router.get('/getUserById', UserMiddleware.verifyUser, UserControl.getUserById)
router.post('/addUserAddress', UserMiddleware.verifyUser, UserControl.addUserAddress)
router.put('/updateUserData', UserMiddleware.verifyUser, UserControl.updateUserData)
router.put('/makeDefaultAddress', UserMiddleware.verifyUser, UserControl.makeAdressToDefaultAddress)
router.put('/updateAddress', UserMiddleware.verifyUser, UserControl.updateUserAddress)
router.delete('/deleteUser', UserMiddleware.verifyUser, UserControl.deleteUserById)
router.delete('/deleteAddress', UserMiddleware.verifyUser, UserControl.deleteAddress)



module.exports = router