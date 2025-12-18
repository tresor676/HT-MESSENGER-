import { auth, db } from "./firebase.js";
import {
  ref,
  get,
  set,
  push,
  update,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* 🔍 Trouver conversation privée existante */
export async function findPrivateConversation(me, other) {
  const snap = await get(ref(db, `userConversations/${me}`));
  if (!snap.exists()) return null;

  for (let convId in snap.val()) {
    const convSnap = await get(ref(db, `conversations/${convId}`));
    if (!convSnap.exists()) continue;

    const c = convSnap.val();
    if (
      c.type === "private" &&
      c.participants[me] &&
      c.participants[other]
    ) {
      return convId;
    }
  }
  return null;
}

/* 💬 Créer ou ouvrir conversation privée */
export async function openPrivateConversation(otherUid) {
  const me = auth.currentUser.uid;

  const existing = await findPrivateConversation(me, otherUid);
  if (existing) return existing;

  const convRef = push(ref(db, "conversations"));
  const convId = convRef.key;

  const conversation = {
    type: "private",
    participants: {
      [me]: true,
      [otherUid]: true
    },
    lastMessage: "",
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp()
  };

  await set(convRef, conversation);

  await set(ref(db, `userConversations/${me}/${convId}`), { unread: 0 });
  await set(ref(db, `userConversations/${otherUid}/${convId}`), { unread: 0 });

  return convId;
}

/* ✍️ Mettre à jour le dernier message */
export async function updateLastMessage(convId, text) {
  await update(ref(db, `conversations/${convId}`), {
    lastMessage: text,
    updatedAt: serverTimestamp()
  });
}
