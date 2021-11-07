const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
require('dotenv').config();
const nodemailer = require("nodemailer");
const ObjectId = require('mongodb').ObjectId;
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
        const successesCollection = database.collection('successes');
        const membershipsCollection = database.collection('membership');
        const queriesCollection = database.collection('queries');
        const purchasesCollection = database.collection('purchases');


        // GET API - fetching trainings data
        app.get('/trainings', async (req, res) => {
            const cursor = trainingsCollection.find({});
            const trainings = await cursor.toArray();
            res.send(trainings);
        });
        // GET API - fetching stories data
        app.get('/stories', async (req, res) => {
            const cursor = storiesCollection.find({});
            const stories = await cursor.toArray();
            res.send(stories);
        });
        // GET API - fetching memberships data
        app.get('/memberships', async (req, res) => {
            const cursor = membershipsCollection.find({});
            const memberships = await cursor.toArray();
            res.send(memberships);
        });
        // GET API - fetching successes data
        app.get('/successes', async (req, res) => {
            const cursor = successesCollection.find({});
            const successes = await cursor.toArray();
            res.send(successes);
        });
        // GET API - fetching queries data
        app.get('/queries', async (req, res) => {
            const cursor = queriesCollection.find({});
            const queries = await cursor.toArray();
            res.send(queries);
        });
        // GET API - fetching purchases data
        app.get('/purchases', async (req, res) => {
            const cursor = purchasesCollection.find({});
            const purchases = await cursor.toArray();
            res.send(purchases);
        });

        // POST API - saving query in db
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
        // POST API - saving purchase in db
        app.post('/purchase', async (req, res) => {
            const data = req.body;
            const insertOperation = await purchasesCollection.insertOne(data);
            if (insertOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }

        });
        // DELETE API - delete a booking
        app.delete('/delete/query/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteOperation = await queriesCollection.deleteOne(query);
            if (deleteOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        });

        // POST API - getting query reply data
        app.post('/reply', async (req, res) => {
            const data = req.body;

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: process.env.EMAIL, // sender address
                to: data.item.email, // list of receivers
                subject: "Answer to query in Alpha Fitness", // Subject line
                text: `Query: ${req.body.item.query} \nAnswer: ${req.body.reply}`, // plain text body
            });
            if (info.accepted.length > 0) {
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