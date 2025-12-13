import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  collection, addDoc, setDoc, doc,
  query, where, onSnapshot, getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

let userId = null;
let chatId = null;

// ---------- AUTH ----------
window.register = async () => {
  const email = email.value;
  const pass = password.value;
  const name = document.getElementById("name").value;
  const u = await createUserWithEmailAndPassword(auth,email,pass);
  await setDoc(doc(db,"users",u.user.uid),{email,name});
};

window.login = async () => {
  await signInWithEmailAndPassword(auth,email.value,password.value);
};

window.logout = async () => {
  await signOut(auth);
  location="index.html";
};

onAuthStateChanged(auth,u=>{
  if(!u && location.pathname.includes("chat")) location="index.html";
  if(u && location.pathname.includes("index")) location="chat.html";
  if(u) userId=u.uid, loadChats();
});

// ---------- CHAT ----------
async function loadChats(){
  const q = query(collection(db,"chats"), where("members","array-contains",userId));
  onSnapshot(q,snap=>{
    chats.innerHTML="";
    snap.forEach(d=>{
      const li=document.createElement("li");
      li.innerText=d.id;
      li.onclick=()=>openChat(d.id);
      chats.append(li);
    });
  });
}

window.createChat = async ()=>{
  const email=document.getElementById("friendEmail").value;
  const q=query(collection(db,"users"),where("email","==",email));
  const s=await getDocs(q);
  if(s.empty)return alert("Introuvable");
  const other=s.docs[0].id;
  await addDoc(collection(db,"chats"),{
    members:[userId,other],
    created:serverTimestamp()
  });
};

function openChat(id){
  chatId=id;
  onSnapshot(collection(db,"chats",id,"messages"),snap=>{
    messages.innerHTML="";
    snap.forEach(m=>{
      const d=m.data();
      const div=document.createElement("div");
      div.className=d.sender==userId?"me":"other";
      div.innerText=d.text;
      messages.append(div);
    });
  });
}

window.send = async ()=>{
  const text=document.getElementById("msg").value;
  if(!text||!chatId)return;
  await addDoc(collection(db,"chats",chatId,"messages"),{
    sender:userId,text,created:serverTimestamp()
  });
  msg.value="";
};
