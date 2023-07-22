
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//CONNECTING 
mongoose.connect('mongodb+srv://MichaelInziani:HyperText1205Lang!&@cluster0.mxdjmpr.mongodb.net/todolistDB');

//CREATING SCHEMA
const { Schema } = mongoose;

const itemsSchema = new Schema({
    name: String,
});

//CREATING THE MODEL
const Item = mongoose.model('Item', itemsSchema);

//CREATE A DOCUMENT/NEW ITEMS
const item1 = new Item({
    name: "Read."
});

const item2 = new Item({
    name: "Write some code."
});

const item3 = new Item({
    name: "Material research."
});

//STORING ITEMS INTO AN ARRAY
const defaultItems = [item1, item2, item3];

//LOGGING ITEMS IN GITBASH

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function (req, res) {

    //const day = date.getDate();
    Item.find({})
        .then(function (foundItems) {
            if (foundItems.length === 0) {
                /** Insert Items 1,2 & 3 to todolistDB */
                Item.insertMany(defaultItems)
                    .then(function (result) {
                        console.log("Sucessfully Added Default Items to DB.");
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
                res.redirect("/");
            } else res.render("list", { listTitle: "Today", newListItems: foundItems });
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })
   
    //if (req.body.list === "Work") {
    //  workItems.push(item);
    //   res.redirect("/work");
    // } else {
    //  items.push(item);
    //   res.redirect("/");
    // }

    if (listName === "Today") {
        item.save()
        res.redirect("/")
    } else {

         List.findOne({ name: listName }).exec().then(foundList => {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        }).catch(err => {
            console.log(err);
        });
    }
});

app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    // Print the name of the list to the console for debugging purposes.
    console.log("the list name is: " + listName);

    // If the list name is "Today", remove the item from the database and redirect to the home page.
    // Otherwise, find the corresponding list in the database and remove the item from it.
    if (listName === "Today") {
        if (checkedItemId != undefined) {
            await Item.findByIdAndRemove(checkedItemId);
            console.log(`Deleted ${checkedItemId} Successfully`);
            res.redirect("/");
        }
    } else {
        await List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkedItemId } } }
        );
        console.log(`Deleted ${checkedItemId} Successfully`);
        res.redirect("/" + listName);
    }
});

//app.get("/work", function(req,res){
 // res.render("list", {listTitle: "Work List", newListItems: workItems});
//});

   // app.get("/about", function (req, res) {
 // res.render("about");
//});

//CREATING A SCHEMA FOR LIST ITEMS
const listSchema = {
    name: String,
    items: [itemsSchema]
}

//CREATING A MODEL FOR LIST ITEMS
const List = mongoose.model("List", listSchema);
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
        .then(function (foundList) {

            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                console.log("saved");
                res.redirect("/" + customListName);
            }
            else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        })
        .catch(function (err) {
            console.log(err);
        });

});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port , function() {
  console.log("Server started on port 3000");
});
