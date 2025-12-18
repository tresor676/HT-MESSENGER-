import { db } from "./firebase-init.js";
import { ref, push, set, get, update, child } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// Créer une conversation privée (1–1)
export async function createPrivateConversation(user1, user2) {
    // Vérifie si une conversation existe déjà
    const convsSnapshot = await get(ref(db, `conversations`));
    if (convsSnapshot.exists()) {
        const convs = convsSnapshot.val();
        for (let id in convs) {
            const c = convs[id];
            if (c.type === "private" && ((c.participants.includes(user1) && c.participants.includes(user2)))) {
                return id; // conversation existante
            }
        }
    }

    // Créer nouvelle conversation
    const newConvRef = push(ref(db, 'conversations'));
    const convData = {
        type: "private",
        participants: [user1, user2],
        lastMessage: "",
        updatedAt: Date.now(),
        unread: { [user1]: 0, [user2]: 0 }
    };
    await set(newConvRef, convData);
    return newConvRef.key;
}

// Créer un groupe
export async function createGroupConversation(adminId, groupName, members=[]) {
    const newConvRef = push(ref(db, 'conversations'));
    const convData = {
        type: "group",
        name: groupName,
        admin: adminId,
        participants: [adminId, ...members],
        lastMessage: "",
        updatedAt: Date.now(),
        unread: {}
    };
    // Initialiser compteur non lus
    convData.participants.forEach(uid => convData.unread[uid] = 0);

    await set(newConvRef, convData);
    return newConvRef.key;
}

// Ajouter membre dans groupe
export async function addMemberToGroup(convId, userId) {
    const convRef = ref(db, `conversations/${convId}/participants`);
    const snapshot = await get(convRef);
    if (snapshot.exists()) {
        const participants = snapshot.val();
        if (!participants.includes(userId)) {
            participants.push(userId);
            await set(convRef, participants);
            // Init unread
            await set(ref(db, `conversations/${convId}/unread/${userId}`), 0);
        }
    }
}

// Obtenir toutes les conversations d’un utilisateur
export async function getUserConversations(uid) {
    const snapshot = await get(ref(db, 'conversations'));
    const result = [];
    if (snapshot.exists()) {
        const convs = snapshot.val();
        for (let id in convs) {
            const c = convs[id];
            if (c.participants.includes(uid)) {
                result.push({ id, ...c });
            }
        }
    }
    return result;
                                              }
