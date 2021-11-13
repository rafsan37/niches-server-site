const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iwrp9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run (){
    try{
        await client.connect();
        const database = client.db('engines');
        const productsCollection = database.collection('products');
        const purchasesCollection = database.collection('purchases');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        console.log('database connented successfully');

        //Get API
        app.get('/products', async(req, res) =>{
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        //GET API
        app.get('/purchases', async(req,res) =>{
            const cursor = purchasesCollection.find({});
            const purchases = await cursor.toArray();
            res.send(purchases);
         })
  
        //POST API
         app.post('/purchases', async(req, res) =>{
            const purchase = req.body;
        console.log('hit the post api', purchase);
  
         const result = await purchasesCollection.insertOne(purchase);
        console.log(result);
        res.json(result)
  });

         // GET Single product
         app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const service = await productsCollection.findOne(query);
            res.json(service);
        })

        // delete data from cart delete api
    app.delete("/purchases/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await purchasesCollection.deleteOne(query);
        res.json(result);
      });
        // delete data from cart delete api
    app.delete("/products/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.json(result);
      });
      // confirmation
      app.put('/confirmation/:id',async (req, res) => {
        const id = req.params.id;

        const query = {_id:ObjectId(id)}
        const  options = {upsert: true}
        const purchase = {
            $set: {
                Status: "Confirm"
            },
        };
        const result = await purchasesCollection.updateOne(query, purchase, options);
        res.json(result)
        console.log(result);
      });
       
     // save user 
     app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })

    app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result);
    });

    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
    });

    app.put('/users/admin', async (req, res) => {
        const user = req.body;
        
                const filter = { email: user.email };
                const updateDoc = { $set: { role: 'admin' } };
                const result = await usersCollection.updateOne(filter, updateDoc);
                res.json(result);
            });
        // Post API
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the post api', product);

          const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        })
        // Post API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hit the post api', review);

          const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        })

        //Get API
        app.get('/reviews', async(req, res) =>{
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        //Get API
        app.get('/products', async(req, res) =>{
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
    }
    finally{
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Engines Server Is Running');
})

app.listen(port, () => {
    console.log('server runnig at port', port);
})