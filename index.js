const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

app.use(bodyParser.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tpdhc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  console.log('Database Connected');
  try {
    const serviceCollection = client
      .db(`${process.env.DB_NAME}`)
      .collection("services");
    const reviewCollection = client
      .db(`${process.env.DB_NAME}`)
      .collection("reviews");
    const adminsCollection = client
      .db(`${process.env.DB_NAME}`)
      .collection("admins");
    const orderCollection = client
      .db(`${process.env.DB_NAME}`)
      .collection("orders");

    app.get("/services", (req, res) => {
      serviceCollection.find({}).toArray((err, docs) => res.send(docs));
    });

    app.get("/reviews", (req, res) => {
      if (req.query.email) {
        return reviewCollection
          .find({ email: req.query.email })
          .toArray((err, docs) => res.send(docs[0]));
      }
      reviewCollection.find({}).toArray((err, docs) => res.send(docs));
    });

    app.get("/orders", (req, res) => {
      adminsCollection.find({ email: req.query.email }).toArray((err, docs) => {
        if (docs?.length) {
          orderCollection.find({}).toArray((err, docs) => res.send(docs));
        } else {
          orderCollection
            .find({ email: req.query.email })
            .toArray((err, docs) => res.send(docs));
        }
      });
    });

    app.get("/isAdmin", (req, res) => {
      adminsCollection
        .find({ email: req.query.email })
        .toArray((err, docs) => res.send(!!docs?.length));
    });

    app.post("/addService", (req, res) => {
      serviceCollection
        .insertOne(req.body)
        .then((result) => res.send(!!result.insertedCount));
    });

    app.post("/addReview", (req, res) => {
      reviewCollection
        .insertOne(req.body)
        .then((result) => res.send(!!result.insertedCount));
    });

    app.post("/addAdmin", (req, res) => {
      adminsCollection
        .insertOne(req.body)
        .then((result) => res.send(!!result.insertedCount));
    });

    app.post("/addOrder", (req, res) => {
      orderCollection
        .insertOne(req.body)
        .then((result) => res.send(!!result.insertedCount));
    });

    app.patch("/updateOrderStatus", (req, res) => {
      const { id, status } = req.body;
      console.log(req.body);
      orderCollection
        .findOneAndUpdate(
          { _id: ObjectId(id) },
          {
            $set: { status },
          }
        )
        .then((result) => res.send(result.lastErrorObject.updatedExisting));
    });

    app.patch("/update/:id", (req, res) => {
      serviceCollection
        .updateOne(
          { _id: ObjectId(req.params.id) },
          {
            $set: req.body,
          }
        )
        .then((result) => res.send(!!result.modifiedCount));
    });

    app.delete("/delete/:id", (req, res) => {
      serviceCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((result) => res.send(!!result.deletedCount));
    });

    app.patch("/updateReview/:id", (req, res) => {
      reviewCollection
        .updateOne(
          { _id: ObjectId(req.params.id) },
          {
            $set: req.body,
          }
        )
        .then((result) => res.send(!!result.modifiedCount));
    });

    app.delete("/deleteReview/:id", (req, res) => {
      reviewCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((result) => res.send(!!result.deletedCount));
    });
  } finally {
    await client.close();
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("<h1>Welcome to ManPower Supply Server</h1>");
});

app.listen(process.env.PORT || 5000, () =>
  console.log("I am listening from 5000")
);
