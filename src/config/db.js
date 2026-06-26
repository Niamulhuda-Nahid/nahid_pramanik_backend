const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0puja.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let projectsCollection;
let adminsCollection;

async function connectDB() {
  await client.connect();

  const db = client.db("nahidPortfolioDB");

  projectsCollection = db.collection("projects");
  adminsCollection = db.collection("admins");

  await client.db("admin").command({ ping: 1 });

  console.log("MongoDB connected successfully");
}

module.exports = {
  connectDB,
  getProjectsCollection: () => projectsCollection,
  getAdminsCollection: () => adminsCollection,
};
