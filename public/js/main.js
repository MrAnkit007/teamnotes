const socket = io();

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const tabs = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
const addNoteBtn = document.getElementById('add-note-btn');
const noteModal = document.getElementById('note-modal');
const closeModal = document.querySelector('.close-button');
const noteForm = document.getElementById('note-form');
const noteId = document.getElementById('note-id');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const noteUrgency = document.getElementById('note-urgency');
const noteStatus = document.getElementById('note-status');
const noteAssignee = document.getElementById('note-assignee');
const teamNotesGrid = document.querySelector('#team-notes .notes-grid');
const personalNotesGrid = document.querySelector('#personal-notes .notes-grid');

let currentUser;

const fetchNotes = async () => {
  const res = await fetch('/api/notes');
  const notes = await res.json();
  renderNotes(notes);
};

const renderNotes = (notes) => {
  teamNotesGrid.innerHTML = '';
  personalNotesGrid.innerHTML = '';
  notes.forEach(note => {
    const noteEl = createNoteElement(note);
    if (note.type === 'personal') {
      personalNotesGrid.appendChild(noteEl);
    } else {
      teamNotesGrid.appendChild(noteEl);
    }
  });
};

const createNoteElement = (note) => {
  const noteEl = document.createElement('div');
  noteEl.classList.add('note', note.urgency);
  noteEl.dataset.id = note.id;
  noteEl.innerHTML = `
    <h3>${note.title}</h3>
    <p>${note.status}</p>
  `;
  noteEl.addEventListener('click', () => openModal(note));
  return noteEl;
};

const openModal = (note = {}) => {
  noteId.value = note.id || '';
  noteTitle.value = note.title || '';
  noteContent.value = note.content || '';
  noteUrgency.value = note.urgency || 'normal';
  noteStatus.value = note.status || 'pending';
  noteAssignee.value = note.assignedTo || '';
  noteModal.style.display = 'block';
};

const closeModalHandler = () => {
  noteModal.style.display = 'none';
};

const noteType = document.getElementById('note-type');

const handleFormSubmit = async (e) => {
  e.preventDefault();
  const id = noteId.value;
  const note = {
    title: noteTitle.value,
    content: noteContent.value,
    urgency: noteUrgency.value,
    status: noteStatus.value,
    assignedTo: noteAssignee.value,
    type: noteType.value,
  };

  if (id) {
    const res = await fetch(`/api/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    const updatedNote = await res.json();
    socket.emit('update note', updatedNote);
  } else {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    const newNote = await res.json();
    socket.emit('new note', newNote);
  }
  closeModalHandler();
  fetchNotes();
};

const fetchUsers = async () => {
  // This is a placeholder. In a real app, you'd fetch users from an API.
  const users = ['user1', 'user2', 'user3'];
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user;
    option.textContent = user;
    noteAssignee.appendChild(option);
  });
};

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
});

(async () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    body.classList.add('dark-mode');
  }
  // This is a placeholder. In a real app, you'd get the current user from the session.
  currentUser = { username: 'user1' };
  await fetchUsers();
  await fetchNotes();
})();

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    tabContents.forEach(c => c.classList.remove('active'));
    document.getElementById(tab.dataset.tab + '-notes').classList.add('active');
  });
});

addNoteBtn.addEventListener('click', () => openModal());
closeModal.addEventListener('click', closeModalHandler);
noteForm.addEventListener('submit', handleFormSubmit);

socket.on('note created', (note) => {
  const noteEl = createNoteElement(note);
  if (note.assignedTo === currentUser.username) {
    personalNotesGrid.appendChild(noteEl);
    showNotification();
  } else {
    teamNotesGrid.appendChild(noteEl);
  }
});

const showNotification = () => {
  const notificationCount = document.querySelector('.notification-count');
  const currentCount = parseInt(notificationCount.textContent);
  notificationCount.textContent = currentCount + 1;
  notificationCount.style.display = 'block';
  document.querySelector('.notification-bell').classList.add('animate');
  setTimeout(() => {
    document.querySelector('.notification-bell').classList.remove('animate');
  }, 1000);
};

document.querySelector('.notification-bell').addEventListener('click', () => {
  const notificationCount = document.querySelector('.notification-count');
  notificationCount.textContent = '0';
  notificationCount.style.display = 'none';
});

socket.on('note updated', (note) => {
  const noteEl = document.querySelector(`.note[data-id='${note.id}']`);
  if (noteEl) {
    noteEl.classList.remove('normal', 'urgent');
    noteEl.classList.add(note.urgency);
    noteEl.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.status}</p>
    `;
  }
});

socket.on('note deleted', (id) => {
  const noteEl = document.querySelector(`.note[data-id='${id}']`);
  if (noteEl) {
    noteEl.remove();
  }
});

(async () => {
  // This is a placeholder. In a real app, you'd get the current user from the session.
  currentUser = { username: 'user1' };
  await fetchUsers();
  await fetchNotes();
})();
