const cartServices = require('../openServices/cart')
const express = require('express')
const router = express()
const orderServices = require('../openServices/order')
const { ensureAuthenticated, forwardAuthenticated } = require('../../Middlewares/user/middleware');

router.get("/order/:id/payment", middleware.isLoggedIn, function (req, res) {

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
                                console.log('reg=' + rsp.registration);
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
    console.log(payment_id);
    console.log(req.query);
    var payment_request_id = req.query.payment_request_id;
    var headers = { 'X-Api-Key':envData.X_Api_Key , 'X-Auth-Token': envData.X_Auth_Token};




    request.get(
        envData.instamojoLink+payment_request_id+'/'+payment_id+'/',
        {form: "",  headers: headers}, function(error, response, body){
            console.log(body);
            // console.log(response);
            if(!error && response.statusCode == 200)
            {
            body = JSON.parse(body);
            console.log(body)
            if (body["success"]==true) {

                orderServices.addInstaMojoId(payment_id,payment_request_id ,function(foundOrder){
                            if (foundReg.success==false) {
                                console.log("Not found");
                                req.flash('error','could not update registration')
                            }
                            else
                            {
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
    });
});