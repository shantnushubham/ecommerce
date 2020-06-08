const cartServices = require('../openServices/cart')
const express = require('express')
const router = express()
const axios=require('axios')
const orderServices = require('../openServices/order')
const orderController=require('../controllers/orders/orderController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const functions=require('../Middlewares/common/functions')
require('dotenv').config()
const envData=process.env


router.get("/order/:id/payment", function (req, res) {

    orderServices.findOrderById(req.params.id,req.user.uuid, function (foundOrder) {
        if (foundOrder.success == false) {
            req.flash('error', 'trouble in payment')
            res.redirect('/cartpage')
        }
        else {
            if (foundOrder.found == false) {
                req.flash('error', 'could not find order by that id')
                res.redirect('/cartpage')
            }
            else {
                var request = require('request')
                var headers = { 'X-Api-Key': envData.X_Api_Key, 'X-Auth-Token': envData.X_Auth_Token };
                var payload = {
                    purpose: 'Auth Trx for order with order ID ' + foundOrder.order.orderId,
                    amount: parseInt(foundOrder.order.total) * 1.18,
                    phone: req.user.phone,
                    buyer_name: req.user.name,
                    redirect_url: envData.instamojoRedirect,
                    send_email: true,
                    webhook: '',
                    send_sms: true,
                    email: req.user.email,
                    allow_repeated_payments: false
                }
                request.post(envData.instamojoLink, { form: payload, headers: headers }, function (error, response, body) {
                    // console.log(response);
                    console.log(response.statusCode);
                    console.log(body);
                    if (!error && response.statusCode == 201) {
                        var body = JSON.parse(body);
                        console.log(body);
                        var x = body["payment_request"]["longurl"];
                        req.body["payment_request_id"] = body["payment_request"]["id"];
                        orderServices.addInstaMojoDetails(foundOrder.order.orderId, body["payment_request"]["longurl"],body["payment_request"]["id"], function (instaAdded) {
                            if (instaAdded.success == false) {
                                console.log(instaAdded.message);
                                req.flash(instaAdded.message)
                                res.redirect('/dashboard')
                            }
                            else {
                                
                                res.redirect(x);
                            }
                        })

                    }
                })

            }
        }
    })







})

router.get("/redirect", function(req, res){
    var payment_id = req.query.payment_id;
    var payment_request_id = req.query.payment_request_id;
    var headers = { 'X-Api-Key':envData.X_Api_Key , 'X-Auth-Token':envData.X_Auth_Token};

console.log('----------------');
console.log(payment_id);
console.log(req.query);
console.log(envData.instamojoLink+payment_request_id+'/'+payment_id+'/');
console.log(headers);
console.log('----------------');

    axios.get(envData.instamojoLink+payment_request_id+'/'+payment_id+'/',{headers:headers}).then(function(response){
            console.log('get req made');
            // console.log(err);
            // console.log(response);
            // console.log(body);
            // console.log(response);
            if(response.status == 200)
            {
            var body = response.data
            console.log(body)
            if (body["success"]==true) {
                console.log('successful payment');
                orderServices.addInstaMojoId(payment_id,payment_request_id ,function(foundOrder){
                            if (foundOrder.success==false) {
                                console.log("Not found");
                                req.flash('error','could not update registration')
                                res.redirect('/cartpage')
                            }
                            else
                            {
                                console.log('redirect to success page');
                                res.render('successPage',{order:foundOrder.order})
                            }    
                        });
        }
        else {
            req.flash('error','error in payment')
            res.redirect("/cartpage");
        }
    }
        else {
            req.flash('error','error in payment')
            res.redirect("/cartpage");
        }
    }).catch(err=>
        {
            console.log(err);
            res.redirect('/cartpage')
        })
    console.log('outside');
});


router.get('/checkout',ensureAuthenticated,orderController.getCheckout)
router.post('/checkout',ensureAuthenticated,orderController.postCheckout)
// router.get('/voucher',orderController.getUserRefcode)


module.exports=router