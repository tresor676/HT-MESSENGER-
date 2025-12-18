import { auth } from "./firebase-init.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// INSCRIPTION
export function register(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            const user = userCredential.user;
            // Optionnel : ajouter displayName et placeholder photo dans la DB
            return user.uid;
        });
}

// CONNEXION
export function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => userCredential.user.uid);
}

// DECONNEXION
export function logout() {
    return signOut(auth);
}

// État en ligne / hors ligne
import { ref, onDisconnect, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
export function setOnlineStatus(uid, online=true) {
    const statusRef = ref(db, `status/${uid}`);
    if (online) {
        set(statusRef, { state: "online", last_changed: Date.now() });
        onDisconnect(statusRef).set({ state: "offline", last_changed: Date.now() });
    } else {
        set(statusRef, { state: "offline", last_changed: Date.now() });
    }
}
