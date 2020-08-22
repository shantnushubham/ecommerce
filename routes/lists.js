var express = require('express');
const listController=require('../controllers/listAndPackage/listController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
var app = express();

app.get('/user/list/names',ensureAuthenticated,listController.getListPage)
app.get('/user/create-list',ensureAuthenticated,listController.getCreateListPage)
app.post('/user/create-list',ensureAuthenticated,listController.createList)
app.get('/user/list-items/:lid',ensureAuthenticated,listController.showListByLid)
app.get('/user/list-add/:iid',ensureAuthenticated,listController.addToList)
app.get('/user/list/remove/:iid/:lid',ensureAuthenticated,listController.removeFromList)
app.get('/user/list-items/:lid',ensureAuthenticated,listController.showListByLid)
app.get('/user/delete-list/:lid',ensureAuthenticated,listController.deleteList)
app.get('/user/list-items/:lid',ensureAuthenticated,listController.showListByLid)
app.get('/user/list-update/:lid',ensureAuthenticated,listController.getUpdateList)
app.post('/user/list-update/:lid',ensureAuthenticated,listController.postUpdateList)
app.get('/user/export-list/:lid',ensureAuthenticated,listController.addListToCart)






module.exports=app
