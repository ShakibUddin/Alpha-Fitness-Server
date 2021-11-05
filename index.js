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
        const trainingsCollection = database.collection('trainings');
        const storiesCollection = database.collection('stories');
        const specialClassesCollection = database.collection('special-classes');
        const successesCollection = database.collection('successes');
        const membershipsCollection = database.collection('membership');
        const usersCollection = database.collection('users');
        const queriesCollection = database.collection('queries');

        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        // GET API
        app.get('/trainings', async (req, res) => {
            const cursor = trainingsCollection.find({});
            const trainings = await cursor.toArray();
            res.send(trainings);
        });
        // GET API
        app.get('/stories', async (req, res) => {
            const cursor = storiesCollection.find({});
            const stories = await cursor.toArray();
            res.send(stories);
        });
        // GET API
        app.get('/memberships', async (req, res) => {
            const cursor = membershipsCollection.find({});
            const memberships = await cursor.toArray();
            res.send(memberships);
        });
        // GET API
        app.get('/successes', async (req, res) => {
            const cursor = successesCollection.find({});
            const successes = await cursor.toArray();
            res.send(successes);
        });

        // POST API
        app.post('/users', async (req, res) => {
            const data = req.body;
            const insertOperation = await usersCollection.insertOne(data);
            if (insertOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        });
        // POST API
        app.post('/queries', async (req, res) => {
            const data = req.body;
            const insertOperation = await queriesCollection.insertOne(data);
            if (insertOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
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