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

const notifyUserWithEmail = async ({ subject, text, userEmail }) => {
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
        to: userEmail, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
    });

    return info;
}
async function run() {
    try {
        await client.connect();
        const database = client.db(process.env.DB_NAME);
        const trainingsCollection = database.collection('trainings');
        const storiesCollection = database.collection('stories');
        const successesCollection = database.collection('successes');
        const membershipsCollection = database.collection('membership');
        const queriesCollection = database.collection('queries');
        const purchasesCollection = database.collection('purchases');
        const coachesCollection = database.collection('coaches');
        const appointmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');


        // GET  - get trainings data
        app.get('/trainings', async (req, res) => {
            const cursor = trainingsCollection.find({});
            const trainings = await cursor.toArray();
            res.send(trainings);
        });
        // GET  - get stories data
        app.get('/stories', async (req, res) => {
            const cursor = storiesCollection.find({});
            const stories = await cursor.toArray();
            res.send(stories);
        });
        // GET  - get memberships data
        app.get('/memberships', async (req, res) => {
            const cursor = membershipsCollection.find({});
            const memberships = await cursor.toArray();
            res.send(memberships);
        });
        // GET  - get successes data
        app.get('/successes', async (req, res) => {
            const cursor = successesCollection.find({});
            const successes = await cursor.toArray();
            res.send(successes);
        });
        // GET  - get queries data
        app.get('/queries', async (req, res) => {
            const cursor = queriesCollection.find({});
            const queries = await cursor.toArray();
            res.send(queries);
        });
        // GET  - get purchases data
        app.get('/purchases', async (req, res) => {
            const cursor = purchasesCollection.find({});
            const purchases = await cursor.toArray();
            res.send(purchases);
        });
        // GET  - get coaches data
        app.get('/coaches', async (req, res) => {
            const cursor = coachesCollection.find({});
            const coaches = await cursor.toArray();
            res.send(coaches);
        });
        // GET  - get appointments data
        app.get('/appointments', async (req, res) => {
            const cursor = appointmentsCollection.find({});
            const appointments = await cursor.toArray();
            res.send(appointments);
        });
        // POST  - saving query in db
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
        // POST  - saving purchase in db
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
        // POST  - saving appoinment in db
        app.post('/appointment/book', async (req, res) => {
            const data = req.body;
            const insertOperation = await appointmentsCollection.insertOne(data);
            if (insertOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }

        });
        // DELETE  - delete a booking
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
        // DELETE  - delete an appointment
        app.delete('/delete/appointment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteOperation = await appointmentsCollection.deleteOne(query);
            if (deleteOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        });

        // POST  - getting query reply data
        app.post('/reply', async (req, res) => {
            const data = req.body;

            const info = await notifyUserWithEmail({
                subject: "Answer to query in Alpha Fitness",
                text: `Hello, ${data.item.name}\nThank you for contacting us.\nYour query was "${data.item.query}"\nAnswer: ${data.reply}`,
                userEmail: data.item.email
            });
            if (info.accepted?.length > 0) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        });
        // POST  - getting appointment approvement data
        app.post('/appointment/approve', async (req, res) => {
            const data = req.body;
            console.log(data);
            const info = await notifyUserWithEmail({
                subject: "Appointment Confirmation Status",
                text: `Hello, ${data.userName}\nYour appointment with ${data.coachName}, on ${data.date}, at ${data.time} is approved.\nThank you\nAlpha Fitness`,
                userEmail: data.userEmail
            });
            if (info.accepted?.length > 0) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        });

        //UPSERT - update user if exists or insert new
        app.put('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const upsertOperation = await usersCollection.updateOne(filter, updateDoc, options);
            if (upsertOperation.acknowledged) {
                res.send(true);
            }
            else {
                res.send(false);
            }
        })
    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log("listening to", port);
});