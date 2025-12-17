import { auth, db } from "./firebase.js";
import { ref, onChildAdded } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

export function loadMessages(convId, container) {
  auth.onAuthStateChanged(user => {
    if (!user) return;
    const me = user.uid;
    container.innerHTML = "";

    onChildAdded(ref(db, `messages/${convId}`), snap => {
      const msg = snap.val();
      const div = document.createElement("div");
      div.className = msg.author === me ? "msg-right" : "msg-left";

      // Déterminer état
      let statusDisplay = "";
      if (msg.status[me] === "sent") statusDisplay = "✔";
      else if (msg.status[me] === "received") statusDisplay = "✔✔";
      else if (msg.status[me] === "read") statusDisplay = "✔✔ (lu)";

      div.innerHTML = `<p>${msg.content}</p>
                       <small>${statusDisplay}</small>`;

      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    });
  });
}
