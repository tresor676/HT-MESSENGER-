// === CONFIG FIREBASE ===
// Remplace par ta config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2WG-135oKY_s6xf5-nBBhxncNV9UayQ0",
  authDomain: "tresor-ae58e.firebaseapp.com",
  projectId: "tresor-ae58e",
  storageBucket: "tresor-ae58e.firebasestorage.app",
  messagingSenderId: "835562519447",
  appId: "1:835562519447:web:e4032e73f7601ba3c522d2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// UI refs
const authArea = document.getElementById('auth-area');
const emailIn = document.getElementById('email');
const pwIn = document.getElementById('password');
const dnIn = document.getElementById('displayName');
const signupBtn = document.getElementById('signup-btn');
const signinBtn = document.getElementById('signin-btn');
const signoutBtn = document.getElementById('signout-btn');
const authMsg = document.getElementById('auth-msg');

const meName = document.getElementById('me-name');
const meEmail = document.getElementById('me-email');
const myAvatar = document.getElementById('my-avatar');

const tabs = document.querySelectorAll('.tab');
const tabContents = {
  chats: document.getElementById('tab-chats'),
  friends: document.getElementById('tab-friends'),
  requests: document.getElementById('tab-requests')
};
const chatsList = document.getElementById('chats-list');
const friendsList = document.getElementById('friends-list');
const requestsList = document.getElementById('requests-list');
const btnAddFriend = document.getElementById('btn-add-friend');
const friendEmailIn = document.getElementById('friend-email');
const btnNewChat = document.getElementById('btn-new-chat');
const btnNewGroup = document.getElementById('btn-new-group');

const chatArea = document.getElementById('chat-area');
const emptyState = document.getElementById('empty');
const chatTitle = document.getElementById('chat-title');
const chatSub = document.getElementById('chat-sub');
const chatAvatar = document.getElementById('chat-avatar');
const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let currentUser = null;
let currentChatId = null;
let unsubChats = null;
let unsubMessages = null;

// --- Auth actions ---
signupBtn.onclick = async () => {
  try {
    authMsg.textContent = '';
    const email = emailIn.value.trim();
    const pw = pwIn.value;
    const displayName = dnIn.value.trim() || null;
    if (!email || !pw) { authMsg.textContent = 'Email et mot de passe requis.'; return; }
    const cred = await auth.createUserWithEmailAndPassword(email, pw);
    const uid = cred.user.uid;
    // create user doc
    await db.collection('users').doc(uid).set({
      email,
      displayName: displayName || email.split('@')[0],
      avatarUrl: null,
      friends: []
    });
  } catch (e) { authMsg.textContent = e.message; }
};

signinBtn.onclick = async () => {
  try {
    authMsg.textContent = '';
    await auth.signInWithEmailAndPassword(emailIn.value.trim(), pwIn.value);
  } catch (e) { authMsg.textContent = e.message; }
};

signoutBtn.onclick = () => auth.signOut();

// --- Tab switching ---
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  const tab = t.dataset.tab;
  Object.keys(tabContents).forEach(k => tabContents[k].classList.toggle('hidden', k !== tab));
}));

// --- Auth state ---
auth.onAuthStateChanged(async user => {
  currentUser = user;
  if (user) {
    authArea.classList.add('hidden');
    signoutBtn.classList.remove('hidden');
    meEmail.textContent = user.email;
    // load profile
    const snap = await db.collection('users').doc(user.uid).get();
    const data = snap.exists ? snap.data() : null;
    meName.textContent = data?.displayName || user.email.split('@')[0];
    myAvatar.textContent = (data?.displayName || '?')[0].toUpperCase();
    startChatsListener();
    startRequestsListener();
    loadFriends();
  } else {
    authArea.classList.remove('hidden');
    signoutBtn.classList.add('hidden');
    meName.textContent = 'Invité';
    meEmail.textContent = '—';
    myAvatar.textContent = '?';
    if (unsubChats) { unsubChats(); unsubChats = null; }
    if (unsubMessages) { unsubMessages(); unsubMessages = null; messagesDiv.innerHTML = ''; }
    chatsList.innerHTML = '';
    friendsList.innerHTML = '';
    requestsList.innerHTML = '';
    chatArea.classList.add('hidden');
    emptyState.classList.remove('hidden');
  }
});

// --- Chats listener (liste de conversations où je suis participant) ---
function startChatsListener(){
  const uid = currentUser.uid;
  if (unsubChats) unsubChats();
  unsubChats = db.collection('chats')
    .where('participants', 'array-contains', uid)
    .orderBy('lastUpdated', 'desc')
    .onSnapshot(snap => {
      chatsList.innerHTML = '';
      snap.forEach(doc => {
        const d = doc.data();
        const li = document.createElement('li');
        const title = d.name || (d.isPrivate ? d.participantEmails?.filter(e=>e!==currentUser.email)[0] : 'Groupe');
        li.innerHTML = `<div style="flex:1"><strong>${escapeHtml(title)}</strong><div class="muted" style="font-size:12px">${escapeHtml(d.lastMessage||'—')}</div></div>`;
        li.onclick = () => openChat(doc.id, d);
        chatsList.appendChild(li);
      });
    });
}

// --- Open chat and listen messages ---
async function openChat(chatId, chatData){
  currentChatId = chatId;
  chatArea.classList.remove('hidden');
  emptyState.classList.add('hidden');
  chatTitle.textContent = chatData.name || (chatData.isPrivate ? 'Conversation privée' : 'Groupe');
  chatSub.textContent = (chatData.isPrivate ? ('Privé — ' + chatData.participantEmails.join(', ')) : ('Groupe — ' + (chatData.participantEmails||[]).join(', ')));
  chatAvatar.textContent = (chatData.isPrivate ? (chatData.participantEmails.filter(e=>e!==currentUser.email)[0]||'?')[0].toUpperCase() : 'G');

  // unsubscribe previous
  if (unsubMessages) unsubMessages();
  messagesDiv.innerHTML = '';

  unsubMessages = db.collection('chats').doc(chatId).collection('messages')
    .orderBy('createdAt')
    .onSnapshot(snap => {
      messagesDiv.innerHTML = '';
      snap.forEach(mdoc => {
        const m = mdoc.data();
        const div = document.createElement('div');
        div.className = 'message-bubble ' + (m.uid === currentUser.uid ? 'me' : 'other');
        div.innerHTML = `<div>${escapeHtml(m.text)}</div><div class="message-meta">${escapeHtml(m.email)} • ${formatTime(m.createdAt)}</div>`;
        messagesDiv.appendChild(div);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// --- Send message ---
messageForm.onsubmit = async e => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !currentChatId) return;
  await db.collection('chats').doc(currentChatId).collection('messages').add({
    text,
    uid: currentUser.uid,
    email: currentUser.email,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  // update chat last message + timestamp
  await db.collection('chats').doc(currentChatId).update({
    lastMessage: text,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  });
  messageInput.value = '';
};

// --- Friends: send request by e-mail ---
btnAddFriend.onclick = async () => {
  const email = friendEmailIn.value.trim().toLowerCase();
  if (!email || !currentUser) return alert('Email requis.');
  if (email === currentUser.email) return alert("Tu ne peux pas t'ajouter toi-même.");
  // find user by email
  const q = await db.collection('users').where('email', '==', email).get();
  if (q.empty) return alert("Utilisateur introuvable.");
  const otherId = q.docs[0].id;
  // create friend request doc in recipient subcollection
  await db.collection('users').doc(otherId).collection('friendRequests').add({
    fromUid: currentUser.uid,
    fromEmail: currentUser.email,
    fromName: meName.textContent,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  });
  alert('Demande envoyée.');
  friendEmailIn.value = '';
};

// --- Listen friend requests (received) ---
function startRequestsListener(){
  if (!currentUser) return;
  db.collection('users').doc(currentUser.uid).collection('friendRequests')
    .where('status', '==', 'pending')
    .onSnapshot(snap => {
      requestsList.innerHTML = '';
      snap.forEach(doc => {
        const r = doc.data();
        const li = document.createElement('li');
        li.innerHTML = `<div style="flex:1"><strong>${escapeHtml(r.fromEmail)}</strong><div class="muted">${formatTime(r.createdAt)}</div></div>
                        <div style="display:flex;gap:6px">
                          <button class="btn accept">Accepter</button>
                          <button class="btn small reject" style="background:#ddd;color:#111">Refuser</button>
                        </div>`;
        // actions
        li.querySelector('.accept').onclick = async () => {
          // 1) mark request accepted
          await doc.ref.update({ status: 'accepted', respondedAt: firebase.firestore.FieldValue.serverTimestamp() });
          // 2) add each other as friends (push uids into friends arrays)
          const meRef = db.collection('users').doc(currentUser.uid);
          const otherRef = db.collection('users').doc(r.fromUid);
          await meRef.update({ friends: firebase.firestore.FieldValue.arrayUnion(r.fromUid) });
          await otherRef.update({ friends: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) });
          // 3) create or open a private chat between the two (unique by sorted uids)
          await createOrOpenPrivateChat(currentUser.uid, r.fromUid);
        };
        li.querySelector('.reject').onclick = async () => {
          await doc.ref.update({ status: 'rejected', respondedAt: firebase.firestore.FieldValue.serverTimestamp() });
        };
        requestsList.appendChild(li);
      });
    });
}

// --- Load friends list ---
async function loadFriends(){
  if (!currentUser) return;
  const snap = await db.collection('users').doc(currentUser.uid).get();
  const d = snap.data() || {};
  friendsList.innerHTML = '';
  const friends = d.friends || [];
  if (friends.length === 0) {
    friendsList.innerHTML = '<li class="muted">Aucun ami</li>';
    return;
  }
  // fetch friend docs
  const batches = [];
  for (const uid of friends) batches.push(db.collection('users').doc(uid).get());
  const rows = await Promise.all(batches);
  rows.forEach(snap => {
    if (!snap.exists) return;
    const u = snap.data();
    const li = document.createElement('li');
    li.innerHTML = `<div style="flex:1"><strong>${escapeHtml(u.displayName||u.email)}</strong><div class="muted">${escapeHtml(u.email)}</div></div>
                    <button class="btn small start">Chat</button>`;
    li.querySelector('.start').onclick = async () => {
      // ensure private chat exists and open it
      await createOrOpenPrivateChat(currentUser.uid, snap.id);
    };
    friendsList.appendChild(li);
  });
}

// --- Create or open private chat for two uids (unique) ---
async function createOrOpenPrivateChat(uidA, uidB){
  // Make deterministic id by sorting uids
  const participants = [uidA, uidB].sort();
  // find existing chat with same two participants and isPrivate=true
  const q = await db.collection('chats')
    .where('isPrivate','==',true)
    .where('participants','==',participants)
    .limit(1)
    .get();
  if (!q.empty) {
    // open it
    const doc = q.docs[0];
    openChat(doc.id, doc.data());
    return;
  }
  // else create chat doc
  // get participant emails (for UI)
  const snapA = await db.collection('users').doc(uidA).get();
  const snapB = await db.collection('users').doc(uidB).get();
  const emails = [snapA.data().email, snapB.data().email];
  const name = emails.filter(e=>e!==currentUser.email)[0] || emails[0];
  const newChat = await db.collection('chats').add({
    participants,
    participantEmails: emails,
    isPrivate: true,
    name,
    lastMessage: null,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  });
  openChat(newChat.id, {
    participants,
    participantEmails: emails,
    isPrivate: true,
    name
  });
}

// --- Utility: start chat button (new chat prompts email) ---
btnNewChat.onclick = async () => {
  const email = prompt("Email du destinataire pour chat privé:");
  if (!email) return;
  const q = await db.collection('users').where('email','==',email).get();
  if (q.empty) return alert("Utilisateur non trouvé.");
  const otherId = q.docs[0].id;
  await createOrOpenPrivateChat(currentUser.uid, otherId);
};

// new group (quick)
btnNewGroup.onclick = async () => {
  const raw = prompt("Emails séparés par virgule pour le groupe:");
  if (!raw) return;
  const emails = raw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  // find uids
  const uids = [];
  for (const e of emails) {
    const q = await db.collection('users').where('email','==',e).get();
    if (!q.empty) uids.push(q.docs[0].id);
  }
  // include self
  uids.push(currentUser.uid);
  const participantEmails = emails; // best-effort
  const chat = await db.collection('chats').add({
    participants: Array.from(new Set(uids)),
    participantEmails,
    isPrivate: false,
    name: prompt("Nom du groupe:") || "Groupe",
    lastMessage: null,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  });
  openChat(chat.id, { participants: Array.from(new Set(uids)), participantEmails, isPrivate: false, name: chat.name });
};

// --- Helpers ---
function formatTime(ts){
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  } catch (e) { return ''; }
}
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
