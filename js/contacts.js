import { db } from "./firebase-init.js";
import { ref, set, remove, get } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// Ajouter un contact
export function addContact(userId, contactId) {
    return set(ref(db, `contacts/${userId}/${contactId}`), { status: "pending" });
}

// Accepter
export function acceptContact(userId, contactId) {
    return set(ref(db, `contacts/${userId}/${contactId}`), { status: "accepted" })
        .then(() => set(ref(db, `contacts/${contactId}/${userId}`), { status: "accepted" }));
}

// Refuser / Supprimer
export function removeContact(userId, contactId) {
    remove(ref(db, `contacts/${userId}/${contactId}`));
}
