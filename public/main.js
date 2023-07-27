function addNote() {
    var noteInput = document.getElementById("noteInput");
    var noteText = noteInput.value;
    noteInput.value = "";

    fetch('/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: noteText }) // Use 'text' instead of 'note'
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to add note");
        }
        loadNotes();
    }).catch(function (error) {
        console.error(error);
        alert("Failed to add note");
    });
}

function deleteNote(note) {
    fetch('/notes/' + note.id, {
        method: 'DELETE'
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to delete note");
        }
        loadNotes();
    }).catch(function (error) {
        console.error(error);
        alert("Failed to delete note");
    });
}

function loadNotes() {
    fetch('/notes')
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Failed to fetch notes");
            }
            return response.json();
        })
        .then(function (data) {
            var notesList = document.getElementById("notesList");
            notesList.innerHTML = "";

            data.forEach(function (note) {
                var listItem = document.createElement("li");
                listItem.innerHTML = note.text;

                var deleteButton = document.createElement("button");
                deleteButton.innerText = "Delete";
                deleteButton.onclick = function () {
                    deleteNote(note);
                };

                listItem.appendChild(deleteButton);
                notesList.appendChild(listItem);
            });
        }).catch(function (error) {
            console.error(error);
            alert("Failed to fetch notes");
        });
}

// Load notes initially on page load
loadNotes();
