import { auth, db } from "./firebase.js";
import {
  ref,
  set,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* 📩 ENVOYER DEMANDE */
export async function sendRequest(targetUid) {
  const me = auth.currentUser.uid;
  await set(ref(db, `contactRequests/${targetUid}/${me}`), true);
}

/* ✔ ACCEPTER DEMANDE */
export async function acceptRequest(fromUid) {
  const me = auth.currentUser.uid;

  await set(ref(db, `contacts/${me}/${fromUid}`), true);
  await set(ref(db, `contacts/${fromUid}/${me}`), true);

  await remove(ref(db, `contactRequests/${me}/${fromUid}`));
}

/* ✖ REFUSER DEMANDE */
export async function refuseRequest(fromUid) {
  const me = auth.currentUser.uid;
  await remove(ref(db, `contactRequests/${me}/${fromUid}`));
}
