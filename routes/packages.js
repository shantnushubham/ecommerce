var express = require('express');
const packageController=require('../controllers/listAndPackage/packageController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const functions=require('../Middlewares/common/functions')
var app = express();

// app.get('/user/list/names',ensureAuthenticated,listController.getListPage)
// app.get('/user/create-list',ensureAuthenticated,listController.getCreateListPage)
app.post('/user/create-list',functions.isAdmin,listController.createList)
// app.get('/user/list-items/:lid',ensureAuthenticated,listController.showListByLid)
app.post('/user/list-add/:iid',functions.isAdmin,listController.addToList)
app.get('/user/list/remove/:iid/:lid',listController.removeFromList)
// app.get('/user/list-items/:lid',ensureAuthenticated,listController.showListByLid)
app.get('/user/delete-list/:lid',ensureAuthenticated,listController.deleteList)
// app.get('/user/list-items/:lid',ensureAuthenticated,listController.showListByLid)
app.get('/user/list-update/:lid',ensureAuthenticated,listController.getUpdateList)
app.post('/user/list-update/:lid',ensureAuthenticated,listController.postUpdateList)
app.get('/user/export-list/:lid',ensureAuthenticated,listController.addListToCart)






module.exports=app
