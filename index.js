const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = express();

// middlewares
app.use(cors());
app.use(express.json());

//database url
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@main.vzl7z.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = process.env.PORT || 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const productsCollection = database.collection('products');

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log("listening to", port);
});