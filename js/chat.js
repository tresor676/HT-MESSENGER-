import { auth, db } from './firebase.js';
import { collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const messageForm = document.getElementById('messageForm');
const chatWindow = document.getElementById('chatWindow');
const messageInput = document.getElementById('messageInput');

const chatId = localStorage.getItem('chatId'); // Exemple pour choisir la discussion

if (chatId) {
    const messagesRef = collection(db, "discussions", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp"));
    onSnapshot(q, snapshot => {
        chatWindow.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const div = document.createElement('div');
            div.textContent = `${data.senderName}: ${data.text}`;
            chatWindow.appendChild(div);
        });
    });
}

messageForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!messageInput.value) return;

    try {
        await addDoc(collection(db, "discussions", chatId, "messages"), {
            senderId: auth.currentUser.uid,
            senderName: auth.currentUser.displayName,
            text: messageInput.value,
            timestamp: new Date()
        });
        messageInput.value = '';
    } catch (err) {
        console.error(err);
    }
});
