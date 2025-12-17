import { auth, db } from "./firebase.js";
import { ref, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

export function loadConversations(container) {
  auth.onAuthStateChanged(user => {
    if (!user) return;

    onValue(ref(db, `userConversations/${user.uid}`), async snap => {
      container.innerHTML = "";

      if (!snap.exists()) return;

      const convs = snap.val();

      for (let convId in convs) {
        const convSnap = await get(ref(db, `conversations/${convId}`));
        if (!convSnap.exists()) continue;

        const conv = convSnap.val();
        const div = document.createElement("div");

        div.className = "conversation";
        div.innerHTML = `
          <strong>${conv.type === "group" ? conv.name : "Conversation privée"}</strong>
          <br>
          <small>${conv.lastMessage || "Aucun message"}</small>
          <span class="badge">${convs[convId].unread}</span>
        `;

        container.appendChild(div);
      }
    });
  });
}
