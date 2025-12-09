// === CONFIG FIREBASE ===
// Remplace ces valeurs par celles de ton projet Firebase (depuis la console)
const firebaseConfig = {
  apiKey: "AIzaSyC2WG-135oKY_s6xf5-nBBhxncNV9UayQ0",
  authDomain: "tresor-ae58e.firebaseapp.com",
  projectId: "tresor-ae58e",
  storageBucket: "tresor-ae58e.firebasestorage.app",
  messagingSenderId: "835562519447",
  appId: "1:835562519447:web:e4032e73f7601ba3c522d2"
};
// Init Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// UI refs
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signinBtn = document.getElementById('signin-btn');
const signupBtn = document.getElementById('signup-btn');
const signoutBtn = document.getElementById('signout-btn');
const authMsg = document.getElementById('auth-msg');
const authArea = document.getElementById('auth-area');
const chatArea = document.getElementById('chat-area');
const userEmailSpan = document.getElementById('user-email');

const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let unsubscribeMessages = null;

// Auth actions
signupBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const pw = passwordInput.value;
  authMsg.textContent = '';
  if (!email || !pw) { authMsg.textContent = 'Email et mot de passe requis.'; return; }
  try {
    await auth.createUserWithEmailAndPassword(email, pw);
    authMsg.style.color = 'green';
    authMsg.textContent = 'Inscription réussie — connecté.';
  } catch (e) {
    authMsg.style.color = 'red';
    authMsg.textContent = e.message;
  }
});

signinBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const pw = passwordInput.value;
  authMsg.textContent = '';
  if (!email || !pw) { authMsg.textContent = 'Email et mot de passe requis.'; return; }
  try {
    await auth.signInWithEmailAndPassword(email, pw);
  } catch (e) {
    authMsg.style.color = 'red';
    authMsg.textContent = e.message;
  }
});

signoutBtn.addEventListener('click', () => auth.signOut());

// Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    // connecté
    authArea.classList.add('hidden');
    chatArea.classList.remove('hidden');
    signoutBtn.classList.remove('hidden');
    userEmailSpan.textContent = user.email;
    startMessagesListener();
  } else {
    // déconnecté
    authArea.classList.remove('hidden');
    chatArea.classList.add('hidden');
    signoutBtn.classList.add('hidden');
    userEmailSpan.textContent = '';
    if (unsubscribeMessages) { unsubscribeMessages(); unsubscribeMessages=null; }
    messagesDiv.innerHTML = '';
  }
});

// Messages: envoi
messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  const user = auth.currentUser;
  if (!user) return;
  if (!text) return;
  try {
    await db.collection('messages').add({
      text,
      uid: user.uid,
      email: user.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    messageInput.value = '';
  } catch (err) {
    console.error('Erreur en écrivant le message', err);
  }
});

// Listener messages en temps réel
function startMessagesListener() {
  unsubscribeMessages = db.collection('messages')
    .orderBy('createdAt', 'asc')
    .limit(200)
    .onSnapshot(snapshot => {
      messagesDiv.innerHTML = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const el = renderMessage(data);
        messagesDiv.appendChild(el);
      });
      // scroll to bottom
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, err => {
      console.error('Écoute messages échouée', err);
    });
}

function renderMessage(data) {
  const div = document.createElement('div');
  div.className = 'message-bubble';
  const me = auth.currentUser && data.uid === auth.currentUser.uid;
  if (me) div.classList.add('me');

  const textNode = document.createElement('div');
  textNode.textContent = data.text || '';
  div.appendChild(textNode);

  const meta = document.createElement('div');
  meta.className = 'meta';
  const time = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate().toLocaleString() : '';
  meta.textContent = `${data.email || 'inconnu'} ${time ? ' — ' + time : ''}`;
  div.appendChild(meta);

  return div;
}
