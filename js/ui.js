import { getUserConversations } from "./conversations.js";
import { listenMessages, markConversationAsRead } from "./messages.js";

// Calculer badge non lus
export async function getUnreadCount(uid) {
    const convs = await getUserConversations(uid);
    let total = 0;
    convs.forEach(c => {
        if(c.unread && c.unread[uid]) total += c.unread[uid];
    });
    return total;
}

// Indicateur "en train d’écrire"
export function setTyping(convId, userId, typing=true) {
    const typingRef = ref(db, `typing/${convId}/${userId}`);
    set(typingRef, typing);
}
