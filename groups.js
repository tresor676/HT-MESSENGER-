// Gestion des groupes
const groupsDb = firebase.firestore();

document.getElementById('createGroupForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const groupName = document.getElementById('groupName').value;
    // TODO: créer groupe dans Firestore
});
