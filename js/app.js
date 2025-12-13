import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

import {
  collection,doc,setDoc,getDocs,onSnapshot,
  query,where,orderBy,serverTimestamp,addDoc
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const isLogin = document.querySelector(".login-page");

//---------------- LOGIN PAGE ----------------
if (isLogin) {
  document.getElementById("btn-register").onclick = async ()=>{
    const email=document.getElementById("email").value;
    const pass=document.getElementById("password").value;
    const name=document.getElementById("displayName").value;
    if(!email||!pass||!name) return alert("remplis tout");

    const user=await createUserWithEmailAndPassword(auth,email,pass);
    await updateProfile(user.user,{displayName:name});
    await setDoc(doc(db,"users",user.user.uid),{
      uid:user.user.uid,email,name,createdAt:serverTimestamp()
    });
    location="chat.html";
  };

  document.getElementById("btn-login").onclick = async ()=>{
    const email=document.getElementById("email").value;
    const pass=document.getElementById("password").value;
    await signInWithEmailAndPassword(auth,email,pass);
    location="chat.html";
  };
}

//---------------- CHAT PAGE ----------------
if (!isLogin) setupChat();

function setupChat(){
  const chats=document.getElementById("chats-list");
  const messages=document.getElementById("messages");
  const createBtn=document.getElementById("create-chat");
  const logout=document.getElementById("logout");

  let uid=null,chatID=null,stop=null;

  onAuthStateChanged(auth,user=>{
    if(!user){location="index.html";return;}
    uid=user.uid;
    loadChats();
  });

  logout.onclick=()=>signOut(auth);

  async function loadChats(){
    const q=collection(db,"chats");
    onSnapshot(q,snap=>{
      chats.innerHTML="";
      snap.forEach(doc=>{
        const c=doc.data();
        if(!c.members.includes(uid))return;
        let other=c.members.find(x=>x!=uid);
        let li=document.createElement("li");
        li.textContent=other;
        li.onclick=()=>openChat(c.chatId);
        chats.append(li);
      });
    });
  }

  createBtn.onclick=async()=>{
    const email=document.getElementById("new-user-email").value;
    const q=query(collection(db,"users"),where("email","==",email));
    const s=await getDocs(q);
    if(s.empty)return alert("Utilisateur introuvable");
    const to=s.docs[0].data().uid;
    const members=[uid,to].sort();
    const id=members.join("_");
    await setDoc(doc(db,"chats",id),{chatId:id,members,createdAt:serverTimestamp()});
    loadChats();
  };

  async function openChat(id){
    chatID=id; messages.innerHTML="";
    if(stop)stop();
    const q=query(collection(db,"chats",id,"messages"),orderBy("timestamp"));
    stop=onSnapshot(q,snap=>{
      messages.innerHTML="";
      snap.forEach(m=>{
        const d=m.data();
        let div=document.createElement("div");
        div.className="message "+(d.senderId==uid?"me":"them");
        div.textContent=d.content;
        messages.append(div);
      });
      messages.scrollTop=messages.scrollHeight;
    });
  }

  document.getElementById("send").onclick=async()=>{
    let txt=document.getElementById("message-input").value;
    if(!txt||!chatID)return;
    await addDoc(collection(db,"chats",chatID,"messages"),{
      senderId:uid,content:txt,timestamp:serverTimestamp()
    });
    document.getElementById("message-input").value="";
  };
  }
