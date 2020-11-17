var vendorModel=require('../models/Items/vendor')

class vendor{
    constructor()
    {

    }
    createVendor(data,callback)
    {
        vendorModel.create(data,function(err,createdVendor){
            console.log(err);
            if(err)callback({success:false})
            else callback({success:true,vendor:createdVendor})
        })
    }
    getVendors(callback)
    {
        vendorModel.find({},function(err,foundVendor){
            
            if(err)callback({success:false})
            else callback({success:true,vendor:foundVendor})
        })
    }
    getVendorById(vendorId,callback)
    {
        
        vendorModel.find({vendorId:vendorId},function(err,foundVendor){
            
            if(err)callback({success:false})
            else callback({success:true,vendor:foundVendor})
        })
    }
}
module.exports=new vendor()