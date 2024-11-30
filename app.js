// Base URL for the backend API
const BASE_URL = "http://localhost:5000/api";

// Token storage
let authToken = null;

// DOM elements
const authSection = document.getElementById("auth-section");
const taskSection = document.getElementById("task-section");
const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");
const taskForm = document.getElementById("task-form");
const taskList = document.getElementById("task-list");
const searchBar = document.getElementById("search-bar");
const filterPriority = document.getElementById("filter-priority");
const tabButtons = document.getElementById("tab-buttons");
const updateTaskForm = document.getElementById("update-task-form");
const updateTaskSection = document.getElementById("update-task-section");
const cancelUpdateBtn = document.getElementById("cancel-update");
const rightSection = document.getElementById("right-section");
const logoutBtn = document.getElementById("logout-btn");
const logoutSection = document.getElementById("logout-section");

// Store the ID of the task being updated
let taskToUpdate = null;

// Display tasks
const displayTasks = (tasks) => {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item";
    taskItem.innerHTML = `
      <h3>${task.title} (${task.priority})</h3>
      <p>${task.description}</p>
      <p>Deadline: ${new Date(task.deadline).toDateString()}</p>
      <button onclick="deleteTask('${task._id}')">Delete</button>
      <button onclick="showUpdateTask('${task._id}', '${task.title}', '${
      task.description
    }', '${task.deadline}', '${task.priority}')">Update</button>
    `;
    taskList.appendChild(taskItem);
  });
};

// Fetch tasks
const fetchTasks = async () => {
  if (!authToken) {
    console.error("No auth token found!");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!res.ok) throw new Error("Failed to fetch tasks");

    const tasks = await res.json();
    displayTasks(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

// Register user
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = {
    username: document.getElementById("reg-username").value,
    email: document.getElementById("reg-email").value,
    password: document.getElementById("reg-password").value,
  };
  console.log("Form data:", formData);

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    alert(data.message || "Registered successfully!");
    document.getElementById("reg-username").value = "";
    document.getElementById("reg-email").value = "";
    document.getElementById("reg-password").value = "";
  } catch (error) {
    console.error(error);
  }
});

// Login user
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Please fill in both email and password.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log("Login response:", data); // Debugging
    if (res.ok && data.token) {
      authToken = data.token;
      authSection.style.display = "none";
      tabButtons.style.display = "none";
      taskSection.style.display = "flex";
      taskSection.style.gap = "40px";
      logoutSection.style.display = "block";
      fetchTasks();
    } else {
      alert(data.message || "Login failed!");
    }
  } catch (error) {
    console.error("Login error:", error);
  }
});

// Logout function
logoutBtn.addEventListener("click", async () => {
  try {
    // Make an API call to logout if necessary
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Clear token or session storage
      localStorage.removeItem("token");

      // Hide task section and logout button
      taskSection.style.display = "none";
      logoutSection.style.display = "none";

      // Show auth section
      authSection.style.display = "block";
      tabButtons.style.display = "block";
      alert("You have been logged out.");
    } else {
      console.error("Failed to logout");
      alert("Logout failed. Please try again.");
    }
  } catch (error) {
    console.error("Logout error:", error);
    alert("An error occurred while logging out.");
  }
});

// Create task
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-desc").value;
  const deadline = document.getElementById("task-deadline").value;
  const priority = document.getElementById("task-priority").value;

  try {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ title, description, deadline, priority }),
    });
    const task = await res.json();
    fetchTasks(); // Refresh tasks
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-deadline").value = "";
    document.getElementById("task-priority").value = "";
  } catch (error) {
    console.error(error);
  }
});

// Show Update Task Form
const showUpdateTask = (taskId, title, description, deadline, priority) => {
  taskToUpdate = taskId; // Save task ID

  // Prefill the update form
  document.getElementById("update-task-title").value = title;
  document.getElementById("update-task-desc").value = description;
  document.getElementById("update-task-deadline").value =
    deadline.split("T")[0]; // Ensure the date format is compatible
  document.getElementById("update-task-priority").value = priority;

  // Show update form and hide other sections
  updateTaskSection.style.display = "block";
  taskList.style.display = "none";
};

// Hide Update Task Form
cancelUpdateBtn.addEventListener("click", () => {
  updateTaskSection.style.display = "none";
  taskList.style.display = "block";
});

// Submit Update Task Form
updateTaskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedData = {
    title: document.getElementById("update-task-title").value,
    description: document.getElementById("update-task-desc").value,
    deadline: document.getElementById("update-task-deadline").value,
    priority: document.getElementById("update-task-priority").value,
  };

  try {
    const res = await fetch(`${BASE_URL}/tasks/${taskToUpdate}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || "Task updated successfully!");
      fetchTasks(); // Refresh the task list
      updateTaskSection.style.display = "none";
      taskList.style.display = "block";
    } else {
      alert(data.message || "Failed to update task!");
    }
  } catch (error) {
    console.error("Error updating task:", error);
    alert("An error occurred while updating the task.");
  }
});

// Delete task
const deleteTask = async (taskId) => {
  try {
    await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    fetchTasks(); // Refresh tasks
  } catch (error) {
    console.error(error);
  }
};

// Search and filter
searchBar.addEventListener("input", async () => {
  const searchValue = searchBar.value.toLowerCase();
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const tasks = await res.json();
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchValue) ||
      task.description.toLowerCase().includes(searchValue)
  );
  displayTasks(filteredTasks);
});

filterPriority.addEventListener("change", async () => {
  const priorityValue = filterPriority.value;
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  const tasks = await res.json();
  const filteredTasks = priorityValue
    ? tasks.filter((task) => task.priority === priorityValue)
    : tasks;
  displayTasks(filteredTasks);
});
