import { db } from "./firebase-init.js";
import { ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

export function createUserProfile(uid, displayName, email) {
    return set(ref(db, 'users/' + uid), {
        displayName: displayName,
        email: email,
        photoURL: "https://via.placeholder.com/150",
        last_active: Date.now()
    });
}

export async function getUser(uid) {
    const snapshot = await get(ref(db, 'users/' + uid));
    return snapshot.exists() ? snapshot.val() : null;
}

export async function getAllUsers() {
    const snapshot = await get(ref(db, 'users'));
    return snapshot.exists() ? snapshot.val() : {};
}
