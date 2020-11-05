const cartServices = require('../openServices/cart')
const express = require('express')
const router = express()
const axios = require('axios')
const orderServices = require('../openServices/order')
const orderController = require('../controllers/orders/orderController')
const { ensureAuthenticated, forwardAuthenticated } = require('../Middlewares/user/middleware');
const functions = require('../Middlewares/common/functions')
const offers = require('../models/offer/offer')
require('dotenv').config()
const envData = process.env
const jssha = require('jssha')
const uniq = require('generate-unique-id')

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
                console.log(req.session.mode, foundOrder.order.creditAllowed);
                if (foundOrder.order.creditAllowed == true && req.session.mode != undefined && req.session.mode === 'credit') {
                    totAmt = totAmt * (parseInt(foundOrder.order.creditPercent) / 100)
                    req.session.mode = ''
                }

                var request = require('request')

                var headers = { 'X-Api-Key': envData.X_Api_Key, 'X-Auth-Token': envData.X_Auth_Token };


                var payload = {
                    key: "7rnFly",
                    txnid: uniq(20),
                    amount: parseInt(totAmt * 1.18),
                    productinfo: 'Auth Trx for order with order ID ' + foundOrder.order.orderId,
                    firstname: req.user.name,
                    purpose: 'Auth Trx for order with order ID ' + foundOrder.order.orderId,
                    phone: req.user.phone,
                    buyer_name: req.user.name,
                    surl: "http://localhost:3000/payment/success",
                    furl: "http://localhost:3000/payment/failure",
                    service_provider: "payu_paisa",
                    // send_email: true,
                    // webhook: '',
                    // send_sms: true,
                    email: req.user.email,
                    // allow_repeated_payments: false
                }

                const hashString = '7rnFly' //store in in different file
                    + '|' + payload.txnid
                    + '|' + payload.amount
                    + '|' + payload.productinfo
                    + '|' + payload.firstname
                    + '|' + payload.email
                    + '|' + '||||||||||'
                    + 'pjVQAWpA' //store in in different file
                const sha = new jssha('SHA-512', "TEXT");
                sha.update(hashString);
                //Getting hashed value from sha module
                const hash = sha.getHash("HEX");
                payload.hash = hash
                request.post('https://sandboxsecure.payu.in/_payment', { form: payload, headers: headers }, function (error, response, body) {
                    // console.log(response);
                    console.log(error);
                    console.log(response.statusCode);
                    console.log(body);
                    if (response.statusCode === 200) {
                        res.send(body);
                    } else if (response.statusCode >= 300 &&
                        response.statusCode <= 400) {
                        res.redirect(response.headers.location.toString());
                    }
                })

            }
        }
    })







})
router.post('/payment/success', (req, res) => {
    //Payumoney will send Success Transaction data to req body. 
    //Based on the response Implement UI as per you want
    res.send(req.body);
})
router.post('/payment/failure', (req, res) => {
    //Payumoney will send Success Transaction data to req body. 
    // Based on the response Implement UI as per you want
    res.send(req.body);
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
                        orderServices.updateStockList(foundOrder.order.orderedItems, function (stocks) {
                            console.log("stock update status:", stocks.success);
                        })
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

router.post('/order-cod', ensureAuthenticated, orderController.codPath)
router.post('/order-credit', ensureAuthenticated, orderController.creditPath)
router.post('/save-order', ensureAuthenticated, orderController.saveOrder)
router.post('/quotation', ensureAuthenticated, orderController.createQuotation)
router.get('/pay/save/cod/:orderId', ensureAuthenticated, orderController.savedToCod)
router.get('/pay/save/online/:orderId', ensureAuthenticated, orderController.savedToPay)
router.get('/pay/save/cred/:orderId', ensureAuthenticated, orderController.savedToCredit)

router.get('/allow-credit/:orderId', functions.isAdmin, orderController.getAllowCred)
router.post('/allow-credit/:orderId', functions.isAdmin, orderController.allowCred)

router.get('/checkout', ensureAuthenticated, orderController.getCheckout)
router.post('/checkout', ensureAuthenticated, orderController.postCheckout)
router.get("/user-order/:orderId", ensureAuthenticated, orderController.checkUserOrder)
router.get('/orders', ensureAuthenticated, orderController.userOrderList)
router.get('/cancellation/request/:orderId', ensureAuthenticated, orderController.cancelOrder)
router.get('/cancellations', ensureAuthenticated, orderController.userCancellationList)
router.get('/cancellations/:id', ensureAuthenticated, orderController.fetchCancellationById)
router.get("/saved-orders", ensureAuthenticated, orderController.getAllSavedOrders)
router.get("/saved-orders/:orderId", ensureAuthenticated, orderController.checkSavedUserOrder)


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
// router.get('/cancellations/:cancellationId', functions.isAdmin, orderController.getCancellationByIdAdmin)


router.get('/admin/offers', functions.isAdmin, orderController.getAllOffers)
router.get('/admin/offers/create', functions.isAdmin, orderController.getCreateOffer)
router.post('/admin/offers/create', functions.isAdmin, orderController.postCreateOffer)
router.get('/admin/offers/:code', functions.isAdmin, orderController.getOfferByCode)
router.get('/admin/offers/update/:code', functions.isAdmin, orderController.getUpdateOffer)
router.post('/admin/offers/update/:code', functions.isAdmin, orderController.postUpdateOffer)


router.get('/admin/service', functions.isAdmin, orderController.getAllServiceQuotes)
router.get('/service/:iid', orderController.getCreateServiceQuote)
router.post('/service/:iid', orderController.createServiceQuote)
router.get('/admin/service/:quoteId', functions.isAdmin, orderController.getServiceQuoteById)
router.get('/admin/complete-service', functions.isAdmin, orderController.serviceQuoteStatus)






module.exports = router