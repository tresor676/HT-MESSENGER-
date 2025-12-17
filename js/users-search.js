import { db } from "./firebase.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

export async function findUserByEmail(email) {
  const snap = await get(ref(db, "users"));
  if (!snap.exists()) return null;

  const users = snap.val();
  for (let uid in users) {
    if (users[uid].email === email) {
      return { uid, ...users[uid] };
    }
  }
  return null;
}
