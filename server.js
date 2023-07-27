const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.use(express.static('public'));

app.use(session({
    secret: 'node_tutorial',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    if (!req.session.notes) {
        req.session.notes = [];
    }
    next();
});

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

function getNotesFromDatabase(req) {
    return req.session.notes || [];
}

function saveNotesToFile(notes) {
    fs.writeFile('notes.json', JSON.stringify(notes), (err) => {
        if (err) {
            console.error('Error writing notes to file', err);
        }
    });
}

function readNotesFromFile(callback) {
    fs.readFile('notes.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading notes from file', err);
            callback([]);
        } else {
            try {
                const notes = JSON.parse(data);
                callback(notes);
            } catch (parseError) {
                console.error('Error parsing notes from file', parseError);
                callback([]);
            }
        }
    });
}

app.get("/notes", async function (req, res) {
    try {
        // Read notes from the file
        readNotesFromFile(function (notes) {
            console.log("reading notes", notes);
            res.send(notes);
        });
    } catch (error) {
        console.error("Error reading notes", error);
        res.status(500).json({ error: "Error reading notes" });
    }
});

app.post("/notes", async function (req, res) {
    try {
        let note = req.body;
        note.id = uid(); // Generate a unique id for the note
        req.session.notes.push(note);
        console.log("added note", req.session.notes);

        // Save notes to the file
        saveNotesToFile(req.session.notes);

        res.end();
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ error: "Something went wrong." });
    }
});

app.delete("/notes/:id", async function (req, res) {
    try {
        const noteId = req.params.id;

        // Find the note by its id and remove it from the list of notes
        req.session.notes = req.session.notes.filter((note) => note.id !== noteId);
        console.log("deleted note", req.session.notes);

        // Save notes to the file after deletion
        saveNotesToFile(req.session.notes);

        res.end();
    } catch (err) {
        console.error("Error occurred:", err);
        res.status(500).json({ error: "Something went wrong." });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
