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
const mailer = require('../controllers/common/Mailer')
const { route } = require('./admin')
const userModel = require('../models/User/User')

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

                var tx = uniq(20)
                orderServices.addTransactionId(foundOrder.order.orderId, tx, function (updatedOtx) {
                    if (updatedOtx.success == false) {

                    }
                    else {
                        var payload = {
                            key: "RhPPuiIm",
                            txnid: tx,
                            amount: parseInt(totAmt),
                            productinfo: 'Auth Trx for order with order ID ' + foundOrder.order.orderId,
                            firstname: req.user.name,
                            purpose: 'Auth Trx for order with order ID ' + foundOrder.order.orderId,
                            phone: req.user.phone,
                            buyer_name: req.user.name,
                            surl: envData.surl,
                            furl: envData.furl,
                            service_provider: "payu_paisa",
                            // send_email: true,
                            // webhook: '',
                            // send_sms: true,
                            email: req.user.email,
                            // allow_repeated_payments: false
                        }

                        const hashString = 'RhPPuiIm' //store in in different file
                            + '|' + payload.txnid
                            + '|' + payload.amount
                            + '|' + payload.productinfo
                            + '|' + payload.firstname
                            + '|' + payload.email
                            + '|' + '||||||||||'
                            + 'AXU18HEr7j' //store in in different file
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
                })


            }
        }
    })





    /**
     * {"isConsentPayment":"0","mihpayid":"9084064091","mode":"CC","status":"success","unmappedstatus":"captured",
     * "key":"RhPPuiIm","txnid":"1mke5p57y16b1p64nznl","amount":"143.00","addedon":"2020-11-08 15:29:30",
     * "productinfo":"Auth Trx for order with order ID f01RGusnQ","firstname":"prakhar",
     * "lastname":"","address1":"","address2":"","city":"","state":"","country":"","zipcode":"",
     * "email":"prakharshriv@gmail.com","phone":"9431756171","udf1":"",
     * "udf2":"","udf3":"","udf4":"","udf5":"","udf6":"","udf7":"","udf8":"","udf9":"","udf10":"",
     * "hash":"391984b1c837417368baaf07efd18db1d32c83bfa7e17d44e9b7c003c204df4277f6cbd4240efb186407eff2739baffc0010f1f6f36030dbe50050f912b83e4b","
     * field1":"062302384746","field2":"355531","field3":"222445837167721",
     * "field4":"Ym5wNEtWZkVsaUpKYXlzMlBvTzU=","field5":"05","field6":"","field7":"AUTHPOSITIVE","field8":"","field9":"",
     * "giftCardIssued":"true","PG_TYPE":"HDFCPG",
     * "encryptedPaymentId":"979658513DC85CBBAA5B8AA88B9A2BF2",
     * "bank_ref_num":"222445837167721","bankcode":"VISA","error":"E000","error_Message":"No Error",
     * "name_on_card":"Test","cardnum":"401200XXXXXX1112",
     * "cardhash":"This field is no longer supported in postback params.",
     * "amount_split":"{\"PAYU\":\"143.00\"}",
     * "payuMoneyId":"250618877","discount":"0.00","net_amount_debit":"143"}
     */

})
router.post('/payment/success', (req, res) => {
    //Payumoney will send Success Transaction data to req body. 
    //Based on the response Implement UI as per you want
    orderServices.updatePaymentByTransactionId(req.body.txnid, req.body.status, function (updatedOtx) {
        orderServices.updateStockList(updatedOtx.order.orderedItems, function (stocks) {
            console.log("stock update status:", stocks.success);
        })
        var promiseArr = []
        userModel.findOne({ uuid: updatedOtx.order.uuid }, function (err, user) {
            if (!err && user != null && user != undefined) {


                for (var i = 0; i < updatedOtx.order.orderedItems.length; i++) {
                    // console.log("foreach",createOrder.order.orderedItems[i]);
                    if (updatedOtx.order.orderedItems[i].iid != undefined)
                        promiseArr.push(cartServices.getItemForList(updatedOtx.order.orderedItems[i].iid, updatedOtx.order.orderedItems[i].quantity, user.uuid))
                };
                Promise.all(promiseArr).then((respo) => {
                    var data = {
                        mail: user.email,
                        user: user,
                        items: respo,
                        order: updatedOtx.order
                    }
                    // console.log(respo);
                    console.log("maildata", data);
                    mailer.sendPerforma(user.email, data, function (mailed) {
                        console.log(mailed);
                    })
                    mailer.orderReceived(user.email, data, function (mailed) {
                        console.log(mailed);
                    })
                }).catch(err => {
                    console.log(err);

                })
                
                cartServices.clearCart(user.uuid,function(cleared){
                    console.log(cleared);
                })
            }
        })

        console.log('redirect to success page');
        res.render('successpage', { order: updatedOtx.order, failure: false, failureMessage: null })
        
    })

})
router.post('/payment/failure', (req, res) => {
    //Payumoney will send Success Transaction data to req body. 
    // Based on the response Implement UI as per you want
    orderServices.updatePaymentByTransactionId(req.body.txnid, req.body.status, function (updatedOtx) {

        console.log('redirect to success page');
        res.render('failurepage', { order: updatedOtx.order, failure: true, failureMessage: req.body.error_Message })
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
                        orderServices.updateStockList(foundOrder.order.orderedItems, function (stocks) {
                            console.log("stock update status:", stocks.success);
                        })
                        console.log('redirect to success page');
                        res.render('successpage', { order: foundOrder.order })
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

router.post('/proceed', ensureAuthenticated, orderController.getCheckout)
// router.get('/checkout', ensureAuthenticated, orderController.getCheckout)
router.post('/checkout', ensureAuthenticated, orderController.postCheckout)
router.get("/user-order/:orderId", ensureAuthenticated, orderController.checkUserOrder)
router.get('/orders', ensureAuthenticated, orderController.userOrderList)
router.get('/cancellation/request/:orderId', ensureAuthenticated, orderController.cancelOrder)
router.get('/cancellations', ensureAuthenticated, orderController.userCancellationList)
router.get('/cancellations/:id', ensureAuthenticated, orderController.fetchCancellationById)
router.get("/saved-orders", ensureAuthenticated, orderController.getAllSavedOrders)
router.get("/saved-orders/:orderId", ensureAuthenticated, orderController.checkSavedUserOrder)

router.get("/admin/orders-section", functions.isAdmin, orderController.showOrderSection)
router.get('/admin/orders-filter', functions.isAdmin, orderController.getAllOrders)
router.get('/admin/orders-filter-paymentStatus/:payment', functions.isAdmin, orderController.getOrderByPST)
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
router.post('/confirm-cancel/:cancellationId', functions.isAdmin, orderController.postConfirmCancellation)
// router.get('/cancellations/:cancellationId', functions.isAdmin, orderController.getCancellationByIdAdmin)

router.get('/admin/offer-section', functions.isAdmin, orderController.showOfferSection)
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
router.get('/admin/complete-service/:quoteId', functions.isAdmin, orderController.serviceQuoteStatus)
router.get('/admin/get/allOrderQuotes', functions.isAdmin, orderController.adminAllQuotes)
router.get('/admin/get/allOrderSaved', functions.isAdmin, orderController.adminAllSaved)

router.get('/admin/sendInvoice/:orderId', functions.isAdmin, orderController.sendInvoice)
router.get('/admin/generated-invoice', functions.isAdmin, orderController.getGeneratedInvoiceList)
router.get('/fee/update', functions.isAdmin, orderController.getUpdateFee)
router.get('/codAllow/update', functions.isAdmin, orderController.getUpdateCODAllow)

router.post('/fee/update', functions.isAdmin, orderController.postUpdateFee)
router.post('/codAllow/update', functions.isAdmin, orderController.postUpdateCODAllow)

router.get('/admin/track/:orderId', functions.isAdmin, orderController.getTrack)
router.post('/admin/track/:orderId', functions.isAdmin, orderController.postTrack)



module.exports = router