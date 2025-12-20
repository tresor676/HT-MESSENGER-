// Messages temps réel
const chatDb = firebase.firestore();

document.getElementById('messageForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = document.getElementById('messageInput').value;
    // TODO: envoyer message
});
