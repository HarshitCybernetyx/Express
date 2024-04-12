const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

const cors = require('cors'); // Import the cors middleware

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000

var json  = null;

// MongoDB connection string
const uri = "mongodb+srv://harshitdb3:Harshitdb3@cluster1.lqihvmv.mongodb.net/TextTo3D?retryWrites=true&w=majority&appName=Cluster1";

// Create a MongoClient
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes
// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Middleware to ensure MongoDB connection before processing requests
app.use(async (req, res, next) => {
  if (!client.topology || !client.topology.isConnected()) {
    await connectToMongoDB();
  }
  next();
});

// API endpoint to get the JSON collection
app.get('/getDeleted', async (req, res) => {
  try {

    const db = client.db("TextTo3D");
    const jsonCollection = db.collection("Data");
    // Fetch documents from the collection
    const documents = await jsonCollection.find({}).toArray();
    res.json(documents); // Return the documents as JSON response
  } catch (err) {
    console.error("Error fetching JSON collection:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// const getJson = async () => {
    
//     if(json != null)
//     return json;
//     else {
//     const db = client.db("TextTo3D");
//     const jsonCollection = db.collection("Data"); 
//     // Fetch documents from the collection
//     const documents = await jsonCollection.find({}).toArray();
//     json = documents;
//     return json;
//     }
// }

// function updateDeletedAtPath(jsonData, path, deleted) {
//     // Base case: If jsonData is not an array or is empty, return
//     if (!Array.isArray(jsonData) || jsonData.length === 0) {
//         return;
//     }

//     // Loop through each item in the JSON data array
//     for (let item of jsonData) {
//         // If the item's path matches the provided path, update the deleted property
//         if (item.path === path) {
//             item.deleted = deleted;
//             return; // Stop further recursion since the path is found
//         }

//         // If the item has children, recursively call the function on its children
//         if (item.children && Array.isArray(item.children) && item.children.length > 0) {
//             updateDeletedAtPath(item.children, path, deleted);
//         }
//     }
// }

app.post('/deletePath', async (req, res) => {
    console.log("Updating JSON collection");
    console.log("Updating JSON collection");

    try {
        var val = {
            path: req.body.path,
            deleted: req.body.deleted,
        };

        const db = client.db("TextTo3D");
        const jsonCollection = db.collection("Data");

        // Find the document with the specified path
        const document = await jsonCollection.findOne({ path: val.path }
            );
        if(document != null)
        {
        // Update the document's deleted property
        document.deleted = val.deleted;
        // Update the document in the collection
        await jsonCollection.updateOne({ path: val.path }, { $set: document });
        }
        else
        {
            // Insert new
            await jsonCollection.insertOne(val);
            console.log("Inserted new");
        }
 
        res.status(200).json({ message: "JSON collection updated successfully" });
    } catch (err) {
        console.error("Error updating JSON collection:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


  
  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  
