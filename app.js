import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC2WG-135oKY_s6xf5-nBBhxncNV9UayQ0",
  authDomain: "tresor-ae58e.firebaseapp.com",
  databaseURL: "https://tresor-ae58e-default-rtdb.firebaseio.com",
  projectId: "tresor-ae58e",
  storageBucket: "tresor-ae58e.firebasestorage.app",
  messagingSenderId: "835562519447",
  appId: "1:835562519447:web:e4032e73f7601ba3c522d2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Screens
const loginScreen = document.getElementById('loginScreen');
const registerScreen = document.getElementById('registerScreen');
const homeScreen = document.getElementById('homeScreen');
const chatScreen = document.getElementById('chatScreen');

function showScreen(screen){
  [loginScreen, registerScreen, homeScreen, chatScreen].forEach(s=>s.classList.remove('active'));
  screen.classList.add('active');
}

// Navigation
document.getElementById('goRegister').onclick = ()=>showScreen(registerScreen);
document.getElementById('goLogin').onclick = ()=>showScreen(loginScreen);

// Register
document.getElementById('registerBtn').onclick = async ()=>{
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  try{
    const userCred = await createUserWithEmailAndPassword(auth,email,password);
    await setDoc(doc(db,'users',userCred.user.uid),{name,email});
    showScreen(homeScreen);
    loadUsers();
    loadGroups();
  }catch(e){ alert(e.message);}
};

// Login
document.getElementById('loginBtn').onclick = async ()=>{
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try{
    await signInWithEmailAndPassword(auth,email,password);
    showScreen(homeScreen);
    loadUsers();
    loadGroups();
  }catch(e){ alert(e.message);}
};

// Auth state
onAuthStateChanged(auth,user=>{
  if(user) { showScreen(homeScreen); loadUsers(); loadGroups(); }
});

// Users list
const usersList = document.getElementById('usersList');
async function loadUsers(){
  const q = collection(db,'users');
  onSnapshot(q,snapshot=>{
    usersList.innerHTML='<h3>Utilisateurs :</h3>';
    snapshot.forEach(doc=>{
      if(doc.id!==auth.currentUser.uid){
        const btn=document.createElement('button');
        btn.textContent=doc.data().name;
        btn.onclick=()=>openChat([auth.currentUser.uid, doc.id], doc.data().name);
        usersList.appendChild(btn);
      }
    });
  });
}

// Groups
const groupsList = document.getElementById('groupsList');
document.getElementById('createGroupBtn').onclick = async ()=>{
  const groupName = prompt("Nom du groupe ?");
  if(!groupName) return;
  const docRef = await addDoc(collection(db,'groups'),{
    name:groupName,
    members:[auth.currentUser.uid]
  });
  loadGroups();
};

async function loadGroups(){
  const q = collection(db,'groups');
  onSnapshot(q,snapshot=>{
    groupsList.innerHTML='<h3>Groupes :</h3>';
    snapshot.forEach(doc=>{
      if(doc.data().members.includes(auth.currentUser.uid)){
        const btn=document.createElement('button');
        btn.textContent=doc.data().name;
        btn.onclick=()=>openChat(doc.id, doc.data().name, true);
        groupsList.appendChild(btn);
      }
    });
  });
}

// Chat
const messagesDiv = document.getElementById('messages');
let currentChatId = null;
let isGroupChat = false;

async function openChat(id, name, group=false){
  currentChatId=id;
  isGroupChat=group;
  showScreen(chatScreen);
  document.getElementById('chatTitle').textContent=name;
  messagesDiv.innerHTML='';
  let q;
  if(group){
    q = query(collection(db,'messages'), where('groupId','==',currentChatId), orderBy('createdAt'));
  } else {
    q = query(collection(db,'messages'), where('participants','array-contains',auth.currentUser.uid), orderBy('createdAt'));
  }
  onSnapshot(q,snapshot=>{
    messagesDiv.innerHTML='';
    snapshot.forEach(doc=>{
      const m=doc.data();
      if((!group && m.participants.includes(currentChatId)) || group){
        const div=document.createElement('div');
        div.className='message '+(m.from===auth.currentUser.uid?'me':'other');
        div.textContent=m.text;
        messagesDiv.appendChild(div);
      }
    });
    messagesDiv.scrollTop=messagesDiv.scrollHeight;
  });
}

// Send message
document.getElementById('sendBtn').onclick = async ()=>{
  const text = document.getElementById('newMessage').value;
  if(!text) return;
  if(isGroupChat){
    await addDoc(collection(db,'messages'),{
      text,
      from:auth.currentUser.uid,
      groupId: currentChatId,
      createdAt: serverTimestamp()
    });
  } else {
    await addDoc(collection(db,'messages'),{
      text,
      from:auth.currentUser.uid,
      participants:[auth.currentUser.uid,currentChatId],
      createdAt: serverTimestamp()
    });
  }
  document.getElementById('newMessage').value='';
};

document.getElementById('backHome').onclick=()=>showScreen(homeScreen);
