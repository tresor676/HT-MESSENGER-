import { auth, db } from './firebase.js';
import { collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchUser');
const searchResults = document.getElementById('searchResults');

searchBtn?.addEventListener('click', async () => {
    searchResults.innerHTML = '';
    const q = query(collection(db, "users"), where("firstName", "==", searchInput.value));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement('li');
        li.textContent = `${data.firstName} ${data.lastName}`;
        const btn = document.createElement('button');
        btn.textContent = "Ajouter";
        btn.onclick = async () => {
            await addDoc(collection(db, "friendRequests"), {
                from: auth.currentUser.uid,
                to: doc.id,
                status: "pending"
            });
            alert("Demande envoyée !");
        };
        li.appendChild(btn);
        searchResults.appendChild(li);
    });
});
