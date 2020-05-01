// router.post("/order/:cid/newmode/:mode", middleware.isLoggedIn, function(req, res){

    
//     Registration.isUserRegisteredForCourse(req.user.uid, "modeCourse", req.params.cid, function (rsp) {
//         if (rsp['success'] == false) {
//             console.log(rsp['message']);
//             req.flash("error", rsp['message']);
//             res.redirect("/dashboard");
//         } else {
//             if (rsp['allow'] == false) {
//                 req.flash("error", "You have already registered for the course!");
//                 res.redirect("/dashboard");
//             } else {
//                 if (req.user.active == false) {
//                     res.redirect("/signup/google");
//                 } else {
//                     if (req.user.coursesRegistered.includes(req.params.cid)) {
//                         res.redirect("/courses/" + req.params.cid);
//                     } else {
                       
//                             Courses.findCourse(req.params.cid, [], function (response) {
//                                 if (response['success'] == false) {
//                                     console.log(response['message']);
//                                     res.redirect("/");
//                                 } else {
//                                     if (functions.isEmpty(response['course'])) {
//                                         res.redirect("/");
//                                     } else {
//                                         var register = {};
//                                         register['uid'] = req.user.uid;
//                                         register['cid'] = response['course']['cid'];
//                                         register['amount'] = response['course']['modeAmount'+req.params.mode];
//                                         register['mode'] = 'modeCourse';
//                                         register['city'] = req.body.city;
//                                         register['modeNumber']=req.params.mode


//                                             Registration.createRegistration(req.user.uid, register, false, function (rsp){
//                                                 if (rsp['success'] == false) {
//                                                     console.log(rsp['message']);
//                                                     res.redirect("/");
//                                                 } else {
//                                                     var request=require('request')
//                                                      var headers = { 'X-Api-Key':envData.X_Api_Key , 'X-Auth-Token': envData.X_Auth_Token};
//                                                     var payload = {
//                                                         purpose: 'Auth Trx for '+response.course.cname,
//                                                         amount: parseInt(response['course']['modeAmount'+req.params.mode])*1.18,
//                                                         phone: req.user.phone,
//                                                         buyer_name: req.user.name,
//                                                         redirect_url: envData.instamojoRedirect,
//                                                         // redirect_url: 'http://localhost:8889/redirect',
//                                                         send_email: true,
//                                                         webhook: '',
//                                                         send_sms: true,
//                                                         email: req.user.email,
//                                                         allow_repeated_payments: false
//                                                   }
//                                                     req.body['mode'] = 'modeCourse';    
                                       
//                                         request.post(envData.instamojoLink, {form: payload,  headers: headers}, function(error, response, body){
//                                         // console.log(response);
//                                         console.log(response.statusCode);
//                                         console.log(body);
//                                         if(!error && response.statusCode == 201){
//                                             var body = JSON.parse(body);
//                                                     console.log(body);
//                                                     var x = body["payment_request"]["longurl"];
//                                                     req.body["payment_request_id"] = body["payment_request"]["id"];
//                                                     Registration.addInstaMojoDetails( body["payment_request"]["id"] ,rsp.registration.rid,body["payment_request"]["longurl"] ,function(instaAdded){
//                                                         if(instaAdded.success==false)
//                                                         {
//                                                             console.log(instaAdded.message);
//                                                             req.flash(instaAdded.message)
//                                                             res.redirect('/dashboard')
//                                                         }
//                                                         else
//                                                         {
//                                                             console.log('reg='+rsp.registration);
//                                                             res.redirect(x);
//                                                         }
//                                                     })
                                                    
//                                                     }
//                                                 })
                                        

//                                         }

//                                     })

//                                             }
//                                         }
                                
//                             })
                        
//                     }
//                 }
//             }
//         }
//     })

// })


// router.get("/redirect", function(req, res){
//     var payment_id = req.query.payment_id;
//     console.log(payment_id);
//     console.log(req.query);
//     var payment_request_id = req.query.payment_request_id;
//     var headers = { 'X-Api-Key':envData.X_Api_Key , 'X-Auth-Token': envData.X_Auth_Token};

    
 

//     request.get(
//         envData.instamojoLink+payment_request_id+'/'+payment_id+'/',
//         {form: "",  headers: headers}, function(error, response, body){
//             console.log(body);
//             // console.log(response);
//             if(!error && response.statusCode == 200)
//             {
//             body = JSON.parse(body);
//             console.log(body)
//             if (body["success"]==true) {
            
//                 Registration.addInstaMojoId(payment_id,payment_request_id ,function(foundReg){
//                             if (foundReg.success==false) {
//                                 console.log("Not found");
//                                 req.flash('error','could not update registration')
//                             }
//                             else{
//                                 if(foundReg.registration.mode=='blended'||foundReg.registration.mode=='modeCourse'){
//                                 var bdata={
//                                     uid:foundReg.registration.uid,
//                                     rid:foundReg.registration.rid,
//                                     paid:true,
//                                     paymentDate:foundReg.registration.dateCreated,
//                                     cid:foundReg.registration.cid,
//                                     mode:foundReg.registration.mode
//                                     }
            
//                                     batchServices.createBatchData(bdata,function(batchData){
//                                         if(batchData.success==false){
//                                         console.log(batchData.message)
//                                         req.flash("error", "trouble in creating batch data for user")
//                                         res.redirect("/dashboard")   
//                                     }
//                                         else
//                                         {
//                                             res.render("successPage", { registration: foundReg['registration'], type: "", });
//                                         } 
//                                     })
//                             // res.render('successpage',{registration:foundReg.registration,type:''});
//                                 } 
//                                 else
//                                 {
//                                     res.render("successPage", { registration: foundReg['registration'], type: "", });
//                                 }   
//                         }    
//                         });
//         }
//         else {
//             req.flash('error','error in payment')
//             res.redirect("/dashboard");
//         }
//     }
//         else {
//             req.flash('error','error in payment')
//             res.redirect("/dashboard");
//         }
//     });
// });