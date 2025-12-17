import { auth, db } from "./firebase.js";
import { ref, onDisconnect, update, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

export function setupPresence() {
  auth.onAuthStateChanged(user => {
    if (!user) return;

    const userRef = ref(db, "users/" + user.uid);

    update(userRef, {
      online: true
    });

    onDisconnect(userRef).update({
      online: false,
      lastSeen: serverTimestamp()
    });
  });
}
