import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import date from "./date.js";
import _ from 'lodash';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
    } catch (error) {
        console.log(error);
        process.exit(1);
        
    }
}

//Create an item Schema
const { Schema } = mongoose;

const itemsSchema = new Schema({
    name: String,
});

//Create a model for the Schema
const Item = mongoose.model('Item', itemsSchema);

//Create a document for new items
const item1 = new Item({
    name: "Read."
});

const item2 = new Item({
    name: "Write some code."
});

const item3 = new Item({
    name: "Material research."
});

//Store Items in an array
const defaultItems = [item1, item2, item3];

//Create a schema for list items
const listSchema = {
    name: String,
    items: [itemsSchema]
}

//Create a model for the list items
const List = mongoose.model("List", listSchema);

//Render the homepage with the default items
app.get("/", async function (req, res) {
  try {
    const foundItems = await Item.find({});
    if (foundItems.length === 0) {
      await Item.insertMany(defaultItems);
      console.log("Successfully saved default items to DB");
      res.redirect("/");
    } else {
      res.render("list", { listTitle: date(), newListItems: foundItems });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//Post a new item
app.post("/",function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === date()) {
        item.save()
        res.redirect("/")
       
    } else {

         List.findOneAndUpdate({ name: listName }).exec().then(foundList => {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        }).catch(err => {
            console.log(err);
        });
    }
});

//Delete an item
app.post("/delete", async function (req, res) {
     const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    // Print the name of the list to the console for debugging purposes.
    console.log("the list name is: " + listName);

    // If the list name is === date(), remove the item from the database and redirect to the home page.
    // Otherwise, find the corresponding list in the database and remove the item from it.
    if (listName === date()) {
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

//Custom list route
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
  //if (customListName === "Favicon.ico") return;

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

//The about page
//app.get("/about", function (req, res) {
 // res.render("about");
//});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    });
});
