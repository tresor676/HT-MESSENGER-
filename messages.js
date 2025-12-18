import { db } from "./firebase-init.js";
import { ref, push, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// Envoyer message
export async function sendMessage(convId, authorId, text) {
    const newMsgRef = push(ref(db, `messages/${convId}`));
    const msgData = {
        author: authorId,
        text: text,
        timestamp: Date.now(),
        status: { [authorId]: "sent" } // état initial
    };
    await set(newMsgRef, msgData);

    // Mettre à jour conversation
    const convRef = ref(db, `conversations/${convId}`);
    await update(convRef, {
        lastMessage: text,
        updatedAt: Date.now(),
        [`unread/${authorId}`]: 0
    });
    return newMsgRef.key;
}

// Recevoir messages en temps réel
export function listenMessages(convId, callback) {
    const msgsRef = ref(db, `messages/${convId}`);
    onValue(msgsRef, (snapshot) => {
        const messages = [];
        if (snapshot.exists()) {
            snapshot.forEach(childSnap => messages.push({ id: childSnap.key, ...childSnap.val() }));
        }
        callback(messages);
    });
}

// Mettre à jour état message (envoyé, reçu, lu)
export async function updateMessageStatus(convId, messageId, userId, status) {
    const statusRef = ref(db, `messages/${convId}/${messageId}/status/${userId}`);
    await set(statusRef, status);
}

// Marquer conversation comme lue
export async function markConversationAsRead(convId, userId) {
    const unreadRef = ref(db, `conversations/${convId}/unread/${userId}`);
    await set(unreadRef, 0);
}
