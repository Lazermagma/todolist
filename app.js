//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const {
  Schema
} = mongoose;

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-asol:Test123@cluster0.qr8nilg.mongodb.net/todolistDB");
const itemSchema = new Schema({
  name: String
});

const Item = mongoose.model('Item', itemSchema);



const defaultItems = [Item1, Item2, Item3];

const listSchema = new Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {


  Item.find()
    .then(function (foundItems) {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems).then(function () {
          console.log("Successfully saved default items to Database.");
        }).catch(function (err) {
          console.log(err);
        });

      } else {
        console.log("Items Loaded Successfully");
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }
    }).catch(function (err) {
      console.log(err);
    });



});

app.get("/:customListName", function (req, res) {
  const customListName =_.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }).then(function (foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/"+ customListName);
    } else {
      
      res.render("list",{listTitle: foundList.name,
      newListItems: foundList.items})

    }
  }).catch(function (err) {
    console.log(err);
  });

  




  
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}).then(function(foundList){
        
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    }).catch(function(err){
      console.log(err);
    })
  };
 
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function () {
      console.log("Successfully deleted Checked Item");
      res.redirect("/");
    }).catch(function (err) {
      console.log(err);
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
      res.redirect("/"+listname);
    }).catch(function(err){
      res.redirect("/"+listName);
    })
  }


})
app.get("/work", function (req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});