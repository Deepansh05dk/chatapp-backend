//NIxy8QGsFanA0wxs
// import
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbmessages.js";
import Pusher from "pusher";
import cors from "cors";

// app-config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1121292",
  key: "2d1dc535879b604c2259",
  secret: "737bb8fdf06828ed658a",
  cluster: "ap2",
  useTLS: true,
});

// middleware
app.use(express.json());
// app.use((req,res,next)=>{
//     // Website you wish to allow to connect
//     res.setHeader("Access-Control-Allow-origin","*");
//     // Request headers you wish to allow
//     res.setHeader("Access-Control-Allow-Headers","*");
//     next();
// })
app.use(cors());

// db config
const connection_url =
  "mongodb+srv://khatridk0508:WRHfx5Wqp9w2PICg@cluster0.u8bzent.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// watching changes in database
const db = mongoose.connection;
db.once("open", () => {
  console.log("db connected");
  const msgcollect = db.collection("messagecontents");
  const changestream = msgcollect.watch();

  changestream.on("change", (change) => {
    if (change.operationType === "insert") {
      const msgdetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        id: msgdetails._id,
        message: msgdetails.message,
        name: msgdetails.name,
        timestamp: msgdetails.timestamp,
      });
      console.log(msgdetails);
    } else {
      console.log("error");
    }
  });
});

// app routers
app.get("/", (req, res) => res.status(200).send("hello world"));
app.post("/messages/new", (req, res) => {
  const dbmessage = req.body;
  Messages.create(dbmessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

// listen
app.listen(port, () => console.log("listening"));
