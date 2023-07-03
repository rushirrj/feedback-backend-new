const jwt = require('jsonwebtoken');
const productDetailsCollection = require('../models/productModel');


const verifyToken = async (tokenObj) => {
    const token = tokenObj.slice(7);

    if (!token) {
        return ({
            success: false,
            message: 'token not received'
        })
    }
    else {
        try {
            const result = await jwt.verify(token, process.env.TOKEN_KEY);
            return ({
                success: true,
                message: 'User authorization success'
            })
        }
        catch (err) {
            console.log('checking error in token', err);
            return ({
                success: false,
                message: 'user authorization failed, login again'
            })
        }
    }
}

const addProduct = async (productDetails) => {
    try {
        // const token = productDetails.token.slice(7);

        const result = await verifyToken(productDetails.token);
        if(result.success){
            const {product_name, logo_url, product_link, product_description, product_category} = productDetails;
            const likes = 0;
            const total_comments = 0;
            const newProduct = new productDetailsCollection({
                product_name, logo_url, product_link, product_description, product_category, likes, total_comments
            })
            const saveProduct = await newProduct.save();
            // console.log(saveProduct);
            return({
                success: true,
                message: 'product added successfully'
            })
        }
        else{
            console.log('Error in token verification');
            return({
                success: false,
                message: result.message
            })
        }
    }
    catch (err) {
        console.log('Error in add Product', err);
        return ({
            success: false,
            message: 'Error in adding product, try again'
        })
    }
}

const getProducts = async(query, userSort)=>{
    let sort = userSort;
    if(!userSort){
        sort = {_id:-1};
    }
    else if(sort == 'likes'){
        sort = {likes: -1}
    }
    else if(sort == 'comments'){
        sort = {total_comments: -1}
    }
    if (!query) {
        const result = await productDetailsCollection.find().sort(sort);
        return {
            success: true,
            data: result
        };
    }
    else{
        try{
            const result = await productDetailsCollection.find({
                'product_category': {
                    $in: [query]
                }
            }).sort(sort);
            return({
                success: true,
                data: result
            })
        }
        catch(err){
            console.log('error in getting products', err);
            return({
                success: false,
                message: 'Could not fetch products, try again'
            });
        }
    }
}

const addLike = async(productObj)=>{
    const {productId} = productObj;
        try{
            const result = await productDetailsCollection.updateOne(
                { _id: productId },
                { 
                    $inc: { likes: 1 }
                }
            )
            return({
                success: true,
                message: 'like added'
            })
        }
        catch(err){
            console.log('error in adding like');
            return({
                success: false,
                message: 'Error in adding like, try again'
            })
        }
}

const addComment = async(productObj)=>{
    const { productId, comment} = productObj;
    
        try{
            console.log('checking product id', productId);
            const result = await productDetailsCollection.updateOne(
                { _id: productId },
                { 
                    $inc: { total_comments: 1 },
                    $push: { comments: comment}
                }
            )
            console.log('checking result of add comment', result);
            return({
                success: true,
                message: 'Comment added'
            });
        }
        catch(err){
            console.log('error in adding comment', err);
            return({
                success: false,
                message: 'Failed to add comment'
            })
        }
    

}

const editProductDetails = async(productObj)=>{
    const {token, productId,product_name, logo_url, product_link, product_description, product_category } = productObj;
    const tokenVerification = await verifyToken(token);
    if(tokenVerification.success){
        await productDetailsCollection.updateOne({ _id: productId }, {
            $set: {
                product_name,
                logo_url,
                product_link,
                product_description,
                product_category
            }
        })
        return ({
            success: true,
            message: 'Product details updated'
        })
    }
    else{
        return({
            success: false,
            message: tokenVerification.message
        });
    }

}

module.exports = {
    addProduct,
    getProducts,
    addComment,
    addLike,
    editProductDetails
}