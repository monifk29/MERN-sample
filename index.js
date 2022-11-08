const express = require("express");
// require('./db/config')

const {connection} = require("./db/config");
const UserModel = require("./db/User");
const ProductModel = require("./db/Product");

const cors = require("cors");

// const User = require("./db/User")
// const Product = require("./db/Product")

const Jwt = require("jsonwebtoken");
const jwtKey = "@420";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/",(req,res) => {
    res.send("homepage")
})

app.post("/reg", async (req,res) => {
    let user = new UserModel(req.body);
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

    let user = await UserModel.findOne(req.body).select("-pass");
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
let product =  new ProductModel(req.body);
let result = await product.save();
res.send(result)
})


app.get("/products", verifyToken , async(req,res) => {
    let products = await ProductModel.find();
    if(products.length > 0){
        res.send(products)
    }
    else{
        res.send({result : 'No result Found'})
    }
})

  

app.get("/product/:id",verifyToken,async (req,res) => {
   
    let result = await ProductModel.findOne({_id:req.params.id});
if(result){
    res.send(result)

}
else{
    res.send("Product not Found")
}
})

app.delete("/product/:id",verifyToken,async (req,res) => {
   
    let result = await ProductModel.deleteOne({_id:req.params.id});

    res.send(result)



})

app.put("/product/:id",verifyToken, async (req,res) => {
    let result = await ProductModel.updateOne({_id:req.params.id},
    {
$set : req.body
    });

    res.send(result)
});


app.get("/search/:key",verifyToken,async (req,res) => {
    let result = await ProductModel.find({
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



app.listen(process.env.PORT || 5000, async () =>{
try{
    await connection;
    console.log("connection")
}
catch(e){
    console.log(e)
}
console.log("server running")

});