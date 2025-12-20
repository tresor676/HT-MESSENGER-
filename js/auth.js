import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

loginBtn.onclick = async () => {
  await signInWithEmailAndPassword(auth, email.value, password.value);
  location.href = "home.html";
};

registerBtn.onclick = async () => {
  const res = await createUserWithEmailAndPassword(auth, email.value, password.value);
  await updateProfile(res.user, { displayName: name.value });

  await setDoc(doc(db, "users", res.user.uid), {
    name: name.value,
    email: email.value,
    online: true
  });

  location.href = "home.html";
};
