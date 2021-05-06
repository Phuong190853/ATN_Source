var express = require('express')
var hbs = require('hbs')

var app = express()
app.set('view engine','hbs')

//define session
var session = require('express-session');
app.use(session({
    resave: true, 
    saveUninitialized: true, 
    secret: 'alo123', 
    cookie: { maxAge: 60000 }}));

var img = require('path').join(__dirname,'/img');
app.use(express.static(img));

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://adminATN:atn2021@cluster0.heqjk.mongodb.net/test';

hbs.registerPartials(__dirname +'/views/partials')

var bodyParse = require("body-parser");
app.use(bodyParse.urlencoded({extended: false}))

//--------------------------------------
//session login check
app.get('/', async(req,res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    
    let results = await dbo.collection("product").find({}).toArray();

    var user = req.session.User;
    if(!user  || user.username == ''){
        res.render('login')
    }else{
        res.render('home', {model:results});
    }
})
app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

//login
app.post('/doLogin',async (req,res)=>{
    var nameInput = req.body.username;
    var passInput = req.body.password;
    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    var cursor  = dbo.collection("user").
        find({$and: [{username:nameInput},{password:passInput}]});
    
    var count = await cursor.count();
    
    if (count== 0){
        res.render('login',{message: 'Invalid user!'})
    }else{
        let name ='';
        await cursor.forEach(doc=>{      
            name = doc.name; 
        })
        req.session.User = {
            name : name, 
        }
        res.redirect('/')
    }    
})

app.get('/signOut',(req,res)=>{
    req.session.destroy(function (err) {
      res.redirect('/'); 
    });
})

//----------------------------
app.get('/home', async(req,res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    
    let results = await dbo.collection("product").find({}).toArray();
    res.render('home', {model:results});
    
})

//------------------product functions

app.get('/products',async (req,res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    
    let results = await dbo.collection("product").find({}).toArray();
    res.render('products', {model:results});
})
app.get('/add_product',(req,res)=>{
    res.render('add_product')
})
app.post('/doAddProduct', async(req, res)=>{
    var idInput = req.body.product_id;
    var nameInput = req.body.name;
    var priceInput = req.body.price;
    var quantityInput = req.body.quantity;
    var descriptionInput = req.body.description;
    var imageInput = req.body.image;
    var newProduct = {product_id: idInput, name: nameInput, price: priceInput, 
                        quantity: quantityInput, description: descriptionInput, image:imageInput};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("product").insertOne(newProduct);
    res.redirect('/products');
})
app.get('/deleteProduct', async (req, res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id": ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("product").deleteOne(condition);
    res.redirect('/products');
})
app.get('/editProduct', async (req, res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    let productToEdit = await dbo.collection("product").findOne(condition);
    res.render('edit_product',{product:productToEdit})
})

app.post('/updateProduct',async (req,res)=>{
    let id = req.body.txtId;
    let idInput = req.body.product_id;
    let nameInput = req.body.name;
    let priceInput = req.body.price;
    let quantityInput = req.body.quantity;
    let descriptionInput = req.body.description;
    let newValues ={$set : {product_id: idInput, name: nameInput, price: priceInput, 
                             quantity: quantityInput, description: descriptionInput}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("product").updateOne(condition,newValues);
    res.redirect('products');
})
app.post('/searchProduct', async (req, res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    let nameInput = req.body.name;
    let searchCondition = new RegExp(nameInput, 'i');
    let results = await dbo.collection("product").find({name:searchCondition}).toArray();
    res.render('products', {model:results});
})


//-----------------------------category functions
app.get('/categories',async(req,res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    
    let results = await dbo.collection("category").find({}).toArray();
    res.render('categories', {model:results});
})
app.get('/add_category',(req,res)=>{
    res.render('add_category')
})
app.post('/doAddCategory', async(req, res)=>{
    var nameInput = req.body.name;
    var newCategory = {name: nameInput};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("category").insertOne(newCategory);
    res.redirect('categories');
})
app.get('/deleteCategory', async (req, res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id": ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("category").deleteOne(condition);
    res.redirect('categories');
})
app.get('/editCategory', async (req, res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    let categoryToEdit = await dbo.collection("category").findOne(condition);
    res.render('edit_category',{category:categoryToEdit})
})
app.post('/updateCategory',async (req,res)=>{
    let id = req.body.txtId;
    let nameInput = req.body.name;
    let newValues ={$set : {name: nameInput}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("category").updateOne(condition,newValues);
    res.redirect('categories');
})
app.post('/searchCategory', async (req, res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    let nameInput = req.body.name;
    let searchCondition = new RegExp(nameInput, 'i');
    let results = await dbo.collection("category").find({name:searchCondition}).toArray();
    res.render('categories', {model:results});
})

//----------------------------------user functions
app.get('/users',async(req,res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    
    let results = await dbo.collection("user").find({}).toArray();
    res.render('users', {model:results});
})

app.get('/add_user',(req,res)=>{
    res.render('add_user')
})
app.post('/doAddUser', async(req, res)=>{
    var nameInput = req.body.username;
    var emailInput = req.body.email;
    var passwordInput = req.body.password;
    var newUser = {username: nameInput, email: emailInput, password: passwordInput};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("user").insertOne(newUser);
    res.redirect('users');
})
app.get('/deleteUser', async (req, res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id": ObjectID(id)};

    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("user").deleteOne(condition);
    res.redirect('users');
})
app.get('/editUser', async (req, res)=>{
    let id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    let userToEdit = await dbo.collection("user").findOne(condition);
    res.render('edit_user',{user:userToEdit})
})
app.post('/updateUser',async (req,res)=>{
    let id = req.body.txtId;
    let nameInput = req.body.username;
    var emailInput = req.body.email;
    var passwordInput = req.body.password;
    let newValues ={$set : {username: nameInput, email: emailInput, password: passwordInput}};
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id" : ObjectID(id)};

    let client= await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    await dbo.collection("user").updateOne(condition,newValues);
    res.redirect('users');
})
app.post('/searchUser', async (req, res)=>{
    let client = await MongoClient.connect(url);
    let dbo = client.db("ATNDemo");
    let nameInput = req.body.name;
    let searchCondition = new RegExp(nameInput, 'i');
    let results = await dbo.collection("user").find({name:searchCondition}).toArray();
    res.render('users', {model:results});
})

const PORT = process.env.PORT || 3000;

app.listen(PORT);
console.log('Node server is running on port ' + PORT);