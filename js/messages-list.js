import { auth, db } from "./firebase.js";
import { ref, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* AFFICHER LES MESSAGES D’UNE CONVERSATION */
export function loadMessages(convId, container) {
  auth.onAuthStateChanged(user => {
    if (!user) return;

    const me = user.uid;
    container.innerHTML = "";

    onChildAdded(ref(db, `messages/${convId}`), snap => {
      const msg = snap.val();
      const div = document.createElement("div");
      div.className = msg.author === me ? "msg-right" : "msg-left";

      div.innerHTML = `<p>${msg.content}</p>
                       <small>${msg.status}</small>`;

      container.appendChild(div);
      container.scrollTop = container.scrollHeight; // scroll auto
    });
  });
}
