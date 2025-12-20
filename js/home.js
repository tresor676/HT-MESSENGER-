import { auth, db } from './firebase.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const discussionList = document.getElementById('discussionList');
const friendsList = document.getElementById('friendsList');
const requestList = document.getElementById('requestList');

// Discussions
if (discussionList) {
    const q = query(collection(db, "discussions"), orderBy("lastMessageTime", "desc"));
    onSnapshot(q, snapshot => {
        discussionList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.lastMessage || ''} - ${data.lastMessageTime ? new Date(data.lastMessageTime.seconds * 1000).toLocaleTimeString() : ''}`;
            discussionList.appendChild(li);
        });
    });
}

// Amis
if (friendsList) {
    const q = query(collection(db, "friends"));
    onSnapshot(q, snapshot => {
        friendsList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.firstName} ${data.lastName}`;
            friendsList.appendChild(li);
        });
    });
}

// Demandes
if (requestList) {
    const q = query(collection(db, "friendRequests"));
    onSnapshot(q, snapshot => {
        requestList.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const li = document.createElement('li');
            li.textContent = `${data.from} → ${data.status}`;
            requestList.appendChild(li);
        });
    });
}
