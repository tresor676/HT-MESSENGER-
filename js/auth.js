import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const storage = getStorage();

// SIGNUP
const signupForm = document.getElementById('signupForm');
signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const profilePic = document.getElementById('profilePic').files[0];

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let photoURL = '';
        if (profilePic) {
            const storageRef = ref(storage, `profilePics/${user.uid}`);
            await uploadBytes(storageRef, profilePic);
            photoURL = await getDownloadURL(storageRef);
        }

        await updateProfile(user, { displayName: `${firstName} ${lastName}`, photoURL });

        // Ajouter user dans Firestore
        await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            email,
            photoURL
        });

        alert("Compte créé avec succès !");
        window.location.href = 'login.html';

    } catch (error) {
        alert(error.message);
    }
});

// LOGIN
const loginForm = document.getElementById('loginForm');
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
});
