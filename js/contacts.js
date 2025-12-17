import { auth, db } from "./firebase.js";
import {
  ref, set, remove, get, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* ➕ ENVOYER DEMANDE */
export async function sendRequest(targetUid) {
  const me = auth.currentUser.uid;

  if (me === targetUid) return;

  await set(ref(db, `contactRequests/${targetUid}/${me}`), {
    date: serverTimestamp()
  });
}

/* ✅ ACCEPTER */
export async function acceptRequest(senderUid) {
  const me = auth.currentUser.uid;

  await set(ref(db, `contacts/${me}/${senderUid}`), true);
  await set(ref(db, `contacts/${senderUid}/${me}`), true);

  await remove(ref(db, `contactRequests/${me}/${senderUid}`));
}

/* ❌ REFUSER */
export async function refuseRequest(senderUid) {
  const me = auth.currentUser.uid;
  await remove(ref(db, `contactRequests/${me}/${senderUid}`));
}

/* 🗑️ SUPPRIMER CONTACT */
export async function removeContact(targetUid) {
  const me = auth.currentUser.uid;

  await remove(ref(db, `contacts/${me}/${targetUid}`));
  await remove(ref(db, `contacts/${targetUid}/${me}`));
}

/* 🚫 BLOQUER */
export async function blockUser(targetUid) {
  const me = auth.currentUser.uid;

  await set(ref(db, `blocked/${me}/${targetUid}`), true);
  await removeContact(targetUid);
}

/* 🔓 DÉBLOQUER */
export async function unblockUser(targetUid) {
  const me = auth.currentUser.uid;
  await remove(ref(db, `blocked/${me}/${targetUid}`));
}

/* 🔒 VÉRIFIER BLOCAGE */
export async function isBlocked(targetUid) {
  const me = auth.currentUser.uid;
  const snap = await get(ref(db, `blocked/${targetUid}/${me}`));
  return snap.exists();
                   }
