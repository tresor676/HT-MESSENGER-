import { auth, db } from "./firebase.js";
import {
  ref,
  set,
  get,
  push,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* 🔍 TROUVER CONVERSATION PRIVÉE EXISTANTE */
export async function findPrivateConversation(uidA, uidB) {
  const snap = await get(ref(db, `userConversations/${uidA}`));
  if (!snap.exists()) return null;

  for (let convId in snap.val()) {
    const convSnap = await get(ref(db, `conversations/${convId}`));
    if (!convSnap.exists()) continue;

    const c = convSnap.val();
    if (
      c.type === "private" &&
      c.participants[uidA] &&
      c.participants[uidB]
    ) {
      return convId;
    }
  }
  return null;
}

/* 💬 CRÉER / OUVRIR DISCUSSION PRIVÉE */
export async function createPrivateConversation(targetUid) {
  const me = auth.currentUser.uid;

  const existing = await findPrivateConversation(me, targetUid);
  if (existing) return existing;

  const convRef = push(ref(db, "conversations"));
  const convId = convRef.key;

  await set(convRef, {
    type: "private",
    participants: {
      [me]: true,
      [targetUid]: true
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null
  });

  await set(ref(db, `userConversations/${me}/${convId}`), { unread: 0 });
  await set(ref(db, `userConversations/${targetUid}/${convId}`), { unread: 0 });

  return convId;
}
