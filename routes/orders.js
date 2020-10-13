const cartServices = require('../openServices/cart')
const express = require('express')
const router = express()
const axios = require('axios')
const orderServices = require('../openServices/order')
const orderController = require('../controllers/orders/orderController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const functions = require('../Middlewares/common/functions')
require('dotenv').config()
const envData = process.env


router.get("/order/:id/payment", ensureAuthenticated, function (req, res) {

    orderServices.findOrderById(req.params.id, req.user.uuid, function (foundOrder) {
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
                var totAmt = parseInt(foundOrder.order.total)
                
                if (foundOrder.creditAllowed == true && req.session.mode != undefined && req.session.mode === 'credit') {
                    totAmt = totAmt * (1 - (parseInt(foundOrder.order.creditPercent) / 100))
                    res.session.mode = ''
                }

                var request = require('request')

                var headers = { 'X-Api-Key': envData.X_Api_Key, 'X-Auth-Token': envData.X_Auth_Token };

                var payload = {
                    purpose: 'Auth Trx for order with order ID ' + foundOrder.order.orderId,
                    amount: totAmt * 1.18,
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
                        orderServices.addInstaMojoDetails(foundOrder.order.orderId, body["payment_request"]["longurl"], body["payment_request"]["id"], function (instaAdded) {
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

router.get("/redirect", ensureAuthenticated, function (req, res) {
    var payment_id = req.query.payment_id;
    var payment_request_id = req.query.payment_request_id;
    var headers = { 'X-Api-Key': envData.X_Api_Key, 'X-Auth-Token': envData.X_Auth_Token };

    console.log('----------------');
    console.log(payment_id);
    console.log(req.query);
    console.log(envData.instamojoLink + payment_request_id + '/' + payment_id + '/');
    console.log(headers);
    console.log('----------------');

    axios.get(envData.instamojoLink + payment_request_id + '/' + payment_id + '/', { headers: headers }).then(function (response) {
        console.log('get req made');
        // console.log(err);
        // console.log(response);
        // console.log(body);
        // console.log(response);
        if (response.status == 200) {
            var body = response.data
            console.log(body)
            if (body["success"] == true) {
                console.log('successful payment');
                orderServices.addInstaMojoId(payment_id, payment_request_id, function (foundOrder) {
                    if (foundOrder.success == false) {
                        console.log("Not found");
                        req.flash('error', 'could not update registration')
                        res.redirect('/cartpage')
                    }
                    else {
                        console.log('redirect to success page');
                        res.render('successPage', { order: foundOrder.order })
                    }
                });
            }
            else {
                req.flash('error', 'error in payment')
                res.redirect("/cartpage");
            }
        }
        else {
            req.flash('error', 'error in payment')
            res.redirect("/cartpage");
        }
    }).catch(err => {
        console.log(err);
        res.redirect('/cartpage')
    })
    console.log('outside');
});

router.post('/order-cod',ensureAuthenticated,orderController.codPath)
router.post('/save-order',ensureAuthenticated,orderController.saveOrder)
router.get('/pay/save/cod/:orderId',ensureAuthenticated,orderController.savedToCod)
router.get('/pay/save/online/:orderId',ensureAuthenticated,orderController.savedToCod)
router.get('/pay/save/cred/:orderId',ensureAuthenticated,orderController.savedToCod)

router.get('/allow-credit',functions.isAdmin,orderController.getAllowCred)
router.post('/allow-credit',functions.isAdmin,orderController.allowCred)

router.get('/checkout', ensureAuthenticated, orderController.getCheckout)
router.post('/checkout', ensureAuthenticated, orderController.postCheckout)
router.get("/user-order/:orderId", ensureAuthenticated, orderController.checkUserOrder)
router.get('/orders', ensureAuthenticated, orderController.userOrderList)
router.get('/cancellation/request/:orderId', ensureAuthenticated, orderController.cancelOrder)
router.get('/cancellations', ensureAuthenticated, orderController.userCancellationList)
router.get('/cancellations/:id', ensureAuthenticated, orderController.fetchCancellationById)



router.get('/admin/orders-filter', functions.isAdmin, orderController.getAllOrders)
router.get('/admin/orders-filter-payment/:payment', functions.isAdmin, orderController.getOrderByPayment)
router.get('/admin/orders-filter-shipment/:shipment', functions.isAdmin, orderController.getOrderByShipStatus)
router.get('/admin/orders/:orderId', functions.isAdmin, orderController.adminCheckOrder)
router.get('/admin/confirm-order/:orderId', functions.isAdmin, orderController.getConfirmOrder)
router.post('/admin/confirm-order/:orderId', functions.isAdmin, orderController.confirmOrder)
router.get('/admin/authorize/:orderId', functions.isAdmin, orderController.authorizeOrder)
router.get('/admin/shipmentStatus/:orderId/:status', functions.isAdmin, orderController.setShipmentStatus)


router.get('/admin/cancels-filter', functions.isAdmin, orderController.getAllCancellations)
router.get('/admin/cancels-filter/:status', functions.isAdmin, orderController.getCancellationsByStatus)
router.get('/cancellations/:cancellationId', functions.isAdmin, orderController.getCancellationByIdAdmin)
router.get('/confirm-cancel/:cancellationId', functions.isAdmin, orderController.getConfirmCancellation)
router.get('/confirm-cancel/:cancellationId', functions.isAdmin, orderController.postConfirmCancellation)
router.get('/cancellations/:cancellationId', functions.isAdmin, orderController.getCancellationByIdAdmin)





/**
 * admin get all orders
 * admin see orders
 * admin confirm order
 * see order by shipmentStatus
 * see order by payment
 * 
 * cancel order
 * see all admin cancel orders
 * confirm cancel
 * 
 */


module.exports = router