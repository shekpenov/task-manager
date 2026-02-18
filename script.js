import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc } 
from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpRLrNdVqCoFjAqMxnnV57G3WD-iVm050",
  authDomain: "task-manager-5433f.firebaseapp.com",
  projectId: "task-manager-5433f",
  storageBucket: "task-manager-5433f.firebasestorage.app",
  messagingSenderId: "772668294175",
  appId: "1:772668294175:web:7d50147a47f990d32f812a",
  measurementId: "G-49SJ5XQBLP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// РЕГИСТРАЦИЯ
document.getElementById("registerBtn").onclick = async () => {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    await createUserWithEmailAndPassword(auth, email, password);
    alert("Аккаунт создан");
  } catch (error) {
    alert(error.message);
  }
};

// ВХОД
document.getElementById("loginBtn").onclick = async () => {
  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
};

// ВЫХОД
document.getElementById("logoutBtn").onclick = () => {
  signOut(auth);
};

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadTasks();
  } else {
    document.getElementById("auth").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

// ДОБАВЛЕНИЕ ЗАДАЧИ
document.getElementById("addTaskBtn").onclick = async () => {
  const text = document.getElementById("taskInput").value;
  const deadline = document.getElementById("deadlineInput").value;

  if (!text || !deadline) {
    alert("Заполни все поля");
    return;
  }

  await addDoc(collection(db, "tasks"), {
    text: text,
    deadline: deadline,
    done: false
  });

  document.getElementById("taskInput").value = "";
};

// ЗАГРУЗКА ЗАДАЧ
function loadTasks() {
  const tasksContainer = document.getElementById("tasks");

  onSnapshot(collection(db, "tasks"), (snapshot) => {
    tasksContainer.innerHTML = "";

    snapshot.forEach((docItem) => {
      const task = docItem.data();

      const div = document.createElement("div");
      div.className = "task";

      const deadlineDate = new Date(task.deadline);
      const now = new Date();

      let timeLeft = "";
      const diff = deadlineDate - now;

      if (diff > 0) {
        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        timeLeft = `Осталось: ${hours}ч ${minutes}м`;
      } else {
        timeLeft = "Просрочено ❌";
      }

      div.innerHTML = `
        <h3 ${task.done ? "style='text-decoration:line-through'" : ""}>
          ${task.text}
        </h3>
        <p>До: ${deadlineDate.toLocaleString()}</p>
        <p>${timeLeft}</p>
        <button onclick="markDone('${docItem.id}', ${task.done})">
          ${task.done ? "Вернуть" : "Сделано"}
        </button>
        <button onclick="deleteTask('${docItem.id}')">Удалить</button>
      `;

      tasksContainer.appendChild(div);
    });
  });
}

// СДЕЛАНО
window.markDone = async (id, currentStatus) => {
  await updateDoc(doc(db, "tasks", id), {
    done: !currentStatus
  });
};

// УДАЛЕНИЕ
window.deleteTask = async (id) => {
  await deleteDoc(doc(db, "tasks", id));
};
