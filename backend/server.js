const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 1234;

app.use(express.json());
app.get("/", (req,res) => {
  res.send("the server is running");
})
app.use(cors({
  origin: "http://localhost:5173", // Change si ton frontend est ailleurs
  methods: ["GET","POST","OPTIONS"],
  //allowedHeaders: "Content-Type"
}));

// Gérer les requêtes preflight OPTIONS
app.options("*", (req, res) => {
  res.set("Access-Control-Allow-Origin", "http://localhost:5173");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).send();
});

const FILE_PATH = path.join(__dirname, "documents");
if (!fs.existsSync(FILE_PATH)) {
  fs.mkdirSync(FILE_PATH);
}

// Enregistrer un fichier Markdown
app.post("/save", (req, res) => {
  const { filename, content } = req.body;
  if (!filename || !content) {
    return res.status(400).json({ message: "Filename and content are required." });
  }
  
  fs.writeFileSync(path.join(FILE_PATH, filename), content);
  res.json({ message: "File saved successfully." });
});

// Charger un fichier Markdown
app.get("/load/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(FILE_PATH, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File not found." });
  }
  
  const content = fs.readFileSync(filePath, "utf8");
  res.json({ content });
});

app.get("/dir/list", (req, res) => {
   
  const content = fs.readdirSync(FILE_PATH);
  res.json({ content });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
