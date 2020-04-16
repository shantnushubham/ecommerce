var itemMetaModel=require("../models/Items/ItemMetadata")
var itemmodel=require('../models/Items/Items')
var mongoose=require("mongoose")
class cart{
    constructor()
    {

    }
    verifyCart(cart,uid){
        var i=0
        for(i=0;i<cart.length();i++){
            var element=cart[i];
            if(element.uid!=uid)
            cart.splice(i,1)
        }
        
        return(cart)
        
    }
    

}
module.exports=new cart()
