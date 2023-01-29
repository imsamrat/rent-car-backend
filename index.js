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

    app.get("/services", async(req, res) => {
      await serviceCollection.find({}).toArray((err, docs) => res.send(docs));
    });

    app.get("/reviews", async(req, res) => {
      if (req.query.email) {
        return reviewCollection
          .find({ email: req.query.email })
          .toArray((err, docs) => res.send(docs>0));
      }
      await reviewCollection.find({}).toArray((err, docs) => res.send(docs));
    });

    app.get("/orders", async(req, res) => {
      await adminsCollection.find({ email: req.query.email }).toArray((err, docs) => {
        if (docs?.length) {
          orderCollection.find({}).toArray((err, docs) => res.send(docs));
        } else {
          orderCollection
            .find({ email: req.query.email })
            .toArray((err, docs) => res.send(docs));
        }
      });
    });

    app.get("/isAdmin", async(req, res) => {
      await adminsCollection
        .find({ email: req.query.email })
        .toArray((err, docs) => res.send(!!docs?.length));
    });

    app.post("/addService", async(req, res) => {
      await serviceCollection
        .insertOne(req.body)
        .then((result) => res.send(!!result.insertedCount));
    });

    app.post("/addReview", async(req, res) => {
      await reviewCollection
        .insertOne(req.body)
        .then((result) => res.send(!!result.insertedCount));
    });

    app.post("/addAdmin", async(req, res) => {
      await adminsCollection
        .insertOne(req.body)
        .then((result) => res.send(!!result.insertedCount));
    });

    app.post("/addOrder", async(req, res) => {
      await orderCollection
        .insertOne(req.body)
        .then((result) => res.send(!!result.insertedCount));
    });

    app.patch("/updateOrderStatus", async(req, res) => {
      const { id, status } = req.body;
      console.log(req.body);
      await orderCollection
        .findOneAndUpdate(
          { _id: ObjectId(id) },
          {
            $set: { status },
          }
        )
        .then((result) => res.send(result.lastErrorObject.updatedExisting));
    });

    app.patch("/update/:id", async(req, res) => {
      await serviceCollection
        .updateOne(
          { _id: ObjectId(req.params.id) },
          {
            $set: req.body,
          }
        )
        .then((result) => res.send(!!result.modifiedCount));
    });

    app.delete("/delete/:id", async(req, res) => {
      await serviceCollection
        .deleteOne({ _id: ObjectId(req.params.id) })
        .then((result) => res.send(!!result.deletedCount));
    });

    app.patch("/updateReview/:id", async(req, res) => {
      await reviewCollection
        .updateOne(
          { _id: ObjectId(req.params.id) },
          {
            $set: req.body,
          }
        )
        .then((result) => res.send(!!result.modifiedCount));
    });

    app.delete("/deleteReview/:id", async(req, res) => {
      await reviewCollection
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
