import { db } from "./firebase.js";
import { ref, set, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

export function createUser(uid, name, email) {
  return set(ref(db, "users/" + uid), {
    displayName: name,
    email: email,
    photo: "placeholder.png",
    online: true,
    lastSeen: serverTimestamp()
  });
}
