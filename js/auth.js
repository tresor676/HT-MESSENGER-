import { auth } from "./firebase.js";
import { createUser } from "./user.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// INSCRIPTION
export function register(email, password, name) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      return createUser(cred.user.uid, name, email);
    })
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => alert(err.message));
}

// CONNEXION
export function login(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(err => alert(err.message));
}
