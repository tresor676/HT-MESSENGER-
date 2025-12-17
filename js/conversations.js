import { auth, db } from "./firebase.js";
import {
  ref, set, get, push, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* 🔍 TROUVER CONVERSATION PRIVÉE EXISTANTE */
export async function findPrivateConversation(uidA, uidB) {
  const snap = await get(ref(db, `userConversations/${uidA}`));
  if (!snap.exists()) return null;

  const convs = snap.val();
  for (let convId in convs) {
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

/* 💬 CRÉER CONVERSATION PRIVÉE */
export async function createPrivateConversation(targetUid) {
  const me = auth.currentUser.uid;

  const existing = await findPrivateConversation(me, targetUid);
  if (existing) return existing;

  const convRef = push(ref(db, "conversations"));
  const convId = convRef.key;

  const data = {
    type: "private",
    participants: {
      [me]: true,
      [targetUid]: true
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null
  };

  await set(convRef, data);

  await set(ref(db, `userConversations/${me}/${convId}`), { unread: 0 });
  await set(ref(db, `userConversations/${targetUid}/${convId}`), { unread: 0 });

  return convId;
}

/* 👥 CRÉER GROUPE */
export async function createGroup(name, members) {
  const me = auth.currentUser.uid;
  const convRef = push(ref(db, "conversations"));
  const convId = convRef.key;

  const participants = { [me]: true };
  members.forEach(uid => participants[uid] = true);

  await set(convRef, {
    type: "group",
    name: name,
    admin: me,
    participants,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: null
  });

  for (let uid in participants) {
    await set(ref(db, `userConversations/${uid}/${convId}`), { unread: 0 });
  }

  return convId;
}
