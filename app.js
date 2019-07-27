//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-hadit:SeaV9ieW71@cluster0-z0o0o.azure.mongodb.net/todolistDB", { useNewUrlParser: true});


const itemsSchema = new mongoose.Schema({
  name: String
});
const Item = new mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  items : [itemsSchema]
};

const List = new mongoose.model("List", listSchema);

const walkDog = new Item({
  name: "Walk The Dog"
});
const exercise = new Item({
  name: "Exercise"
});
const shopping = new Item({
  name: "Shopping"
});
const defaultItems = [walkDog, exercise, shopping];
// Item.insertMany([walkDog, exercise, shopping],(err,doc) => {
//   if (err){
//     console.log(err);
//   } else {
//     console.log(doc);
//     console.log("Successfully saved default items");
//   }
// });

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
  Item.find({}, (err,docs) => {
    res.render("list", {listTitle: "Today", newListItems: docs});
  });
});
app.get('/favicon.ico', (req, res) => res.status(204));
app.get("/:title", (req,res) => {
  const customList = _.capitalize(req.params.title);
  List.findOne({name:customList}, (err,doc) => {
    if (!doc){
      const list = new List ({
        name: customList,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+customList);
    } else {
      
      res.render("list", {listTitle: doc.name, newListItems: doc.items});
    }
  });

});


app.post("/", function(req, res){
  const itemAdded = new Item({
    name: req.body.newItem
  });
  const list = req.body.list;

  if (list === "Today") {
    itemAdded.save();
    res.redirect("/");
  } else {
    List.findOne({name: list}, (err,listFound) => {
      if(err) {
        console.log(err);
      } else {
      listFound.items.push(itemAdded);
      console.log(listFound);
      listFound.save();
      res.redirect("/" + list);
      }
    });
  }

});

app.post("/delete", (req,res) => {
  const boxSelected = req.body.boxSelected;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(boxSelected, err => {
      if (err){
        console.log(err);
      }
    res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: boxSelected}}},(err,doc) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started " + port);
});
