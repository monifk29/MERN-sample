const express = require("express");
require('./db/config')

const cors = require("cors");

const User = require("./db/User")
const Product = require("./db/Product")

const Jwt = require("jsonwebtoken");
const jwtKey = "@420";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/reg", async (req,res) => {
    let user = new User(req.body);
    let result = await user.save()
    result = result.toObject();
    delete result.pass;
    Jwt.sign({result},jwtKey, (err,token) =>{
        if(err){
            res.send("something went wrong, Token not found")
        }
        res.send({result,token})
    })
});

app.post("/login", async (req,res) => {
if(req.body.pass && req.body.email){

    let user = await User.findOne(req.body).select("-pass");
    if(user){
        Jwt.sign({user},jwtKey, (err,token) =>{
            if(err){
                res.send("something went wrong, Token not found")
            }
            res.send({user,token})
        })
       
    }
    else{
        res.send({result :"no user found"})
    }
}

else{
    res.send({result :"no user found"})
}
});


app.post("/add-product",verifyToken, async (req,res) => {
let product =  new Product(req.body);
let result = await product.save();
res.send(result)
})


app.get("/products", verifyToken , async(req,res) => {
    let products = await Product.find();
    if(products.length > 0){
        res.send(products)
    }
    else{
        res.send({result : 'No result Found'})
    }
})

app.delete("/product/:id",verifyToken,async (req,res) => {
   
    let result = await Product.deleteOne({_id:req.params.id});
    res.send(result)
})

app.get("/product/:id",verifyToken,async (req,res) => {
   
    let result = await Product.findOne({_id:req.params.id});
if(result){
    res.send(result)

}
else{
    res.send("Product not Found")
}
})

app.put("/product/:id",verifyToken         , async (req,res) => {
    let result = await Product.updateOne({_id:req.params.id},
    {
$set : req.body
    });

    res.send(result)
});


app.get("/search/:key",verifyToken,async (req,res) => {
    let result = await Product.find({
        "$or" : [
            {name : {$regex:req.params.key}},
            {company : {$regex:req.params.key}},
            {price : {$regex:req.params.key}},
            {category : {$regex:req.params.key}}

        ]
    });
    res.send(result)
})


function verifyToken(req,res,next){
    token = req.headers["authorization"];
    if(token){
        token = token.split(" ")[1];
        console.log(token)
        Jwt.verify(token,jwtKey,(err,valid) => {
            if(err){
                res.status(401).send("Please provide valid token")
            }
            else{
                next()
            }
        })
    }
    else{
        res.status(403).send("Please add token with header")
    }
}



app.listen(5000);