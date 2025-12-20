import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const chatList = document.getElementById("chatList");

auth.onAuthStateChanged(user => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  loadChats(user.uid);
});

function loadChats(uid) {
  const q = query(
    collection(db, "chats"),
    where("members", "array-contains", uid)
  );

  onSnapshot(q, snap => {
    chatList.innerHTML = "";

    snap.forEach(doc => {
      const data = doc.data();

      const li = document.createElement("li");
      li.className = "chat-item";

      // ⚠️ ID JAMAIS DANS L’UI
      li.dataset.chat = doc.id;

      li.innerHTML = `
        <div class="name">${data.title}</div>
        <div class="last-msg">${data.lastMessage || ""}</div>
      `;

      li.onclick = () => {
        sessionStorage.setItem("chat", doc.id);
        location.href = "chat.html";
      };

      chatList.appendChild(li);
    });
  });
}
