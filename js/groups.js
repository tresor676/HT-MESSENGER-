import { auth, db } from './firebase.js';
import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const createGroupForm = document.getElementById('createGroupForm');
const groupsList = document.getElementById('groupsList');

createGroupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const groupName = document.getElementById('groupName').value;
    await addDoc(collection(db, "groups"), {
        name: groupName,
        admin: auth.currentUser.uid,
        members: [auth.currentUser.uid]
    });
    alert("Groupe créé !");
});

if (groupsList) {
    const q = collection(db, "groups");
    onSnapshot(q, snapshot => {
        groupsList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.name} (Admin: ${data.admin})`;
            groupsList.appendChild(li);
        });
    });
                }
