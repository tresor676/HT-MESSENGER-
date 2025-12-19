import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    if (document.getElementById("userName")) {
      document.getElementById("userName").innerText = user.displayName;
      loadMessages();
    }
  } else {
    if (!location.pathname.endsWith("index.html")) {
      location.href = "index.html";
    }
  }
});

window.register = async () => {
  const email = emailInput.value;
  const pass = password.value;
  const name = document.getElementById("name").value;

  const res = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(res.user, { displayName: name });
  location.href = "chat.html";
};

window.login = async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
  location.href = "chat.html";
};

window.logout = async () => {
  await signOut(auth);
};

window.sendMessage = async () => {
  const text = messageInput.value;
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    text,
    sender: currentUser.uid,
    name: currentUser.displayName,
    time: serverTimestamp()
  });

  messageInput.value = "";
};

function loadMessages() {
  const q = query(collection(db, "messages"));
  onSnapshot(q, snap => {
    messages.innerHTML = "";
    snap.forEach(doc => {
      const m = doc.data();
      const div = document.createElement("div");
      div.className = m.sender === currentUser.uid ? "msg-me" : "msg-other";
      div.innerText = m.name + ": " + m.text;
      messages.appendChild(div);
    });
  });
    }
