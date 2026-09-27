// =====================================================
// TASKFLOW PRO - SUPABASE
// FINAL VERSION
// =====================================================


// =====================================================
// SUPABASE CONFIG
// =====================================================

const SUPABASE_URL =
    "https://egwnaazrhdyozkndafeb.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_GjK8ch16B1rA4P3RqhQzdw_0GjBipJg";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =====================================================
// DOM ELEMENTS
// =====================================================

// Auth
const authSection =
    document.getElementById("authSection");

const appSection =
    document.getElementById("appSection");

const loginBox =
    document.getElementById("loginBox");

const registerBox =
    document.getElementById("registerBox");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const showRegisterBtn =
    document.getElementById("showRegisterBtn");

const showLoginBtn =
    document.getElementById("showLoginBtn");

const loginMessage =
    document.getElementById("loginMessage");

const registerMessage =
    document.getElementById("registerMessage");


// Register
const firstNameInput =
    document.getElementById("firstName");

const lastNameInput =
    document.getElementById("lastName");

const registerEmailInput =
    document.getElementById("registerEmail");

const registerPasswordInput =
    document.getElementById("registerPassword");

const confirmPasswordInput =
    document.getElementById("confirmPassword");


// Login
const loginEmailInput =
    document.getElementById("loginEmail");

const loginPasswordInput =
    document.getElementById("loginPassword");


// App
const userName =
    document.getElementById("userName");

const logoutBtn =
    document.getElementById("logoutBtn");


// Tasks
const taskInput =
    document.getElementById("taskInput");

const priorityInput =
    document.getElementById("priority");

const dueDateInput =
    document.getElementById("dueDate");

const addBtn =
    document.getElementById("addBtn");

const searchInput =
    document.getElementById("searchInput");

const clearBtn =
    document.getElementById("clearBtn");

const taskList =
    document.getElementById("taskList");


// Stats
const totalTask =
    document.getElementById("totalTask");

const completedTask =
    document.getElementById("completedTask");

const pendingTask =
    document.getElementById("pendingTask");


// =====================================================
// STATE
// =====================================================

let currentUser = null;

let allTasks = [];


// =====================================================
// MESSAGE
// =====================================================

function showMessage(
    element,
    message,
    type = ""
) {

    element.textContent = message;

    element.className = "form-message";

    if (type) {
        element.classList.add(type);
    }

}


function clearMessages() {

    showMessage(
        loginMessage,
        ""
    );

    showMessage(
        registerMessage,
        ""
    );

}


// =====================================================
// LOGIN / REGISTER SWITCH
// =====================================================

showRegisterBtn.addEventListener(
    "click",
    function () {

        clearMessages();

        loginBox.classList.add(
            "hidden"
        );

        registerBox.classList.remove(
            "hidden"
        );

    }
);


showLoginBtn.addEventListener(
    "click",
    function () {

        clearMessages();

        registerBox.classList.add(
            "hidden"
        );

        loginBox.classList.remove(
            "hidden"
        );

    }
);


// =====================================================
// REGISTER
// =====================================================

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessages();


        const firstName =
            firstNameInput.value.trim();

        const lastName =
            lastNameInput.value.trim();

        const email =
            registerEmailInput.value.trim();

        const password =
            registerPasswordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;


        // Validation

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            showMessage(
                registerMessage,
                "Please fill in all fields.",
                "error"
            );

            return;

        }


        if (password.length < 6) {

            showMessage(
                registerMessage,
                "Password must be at least 6 characters.",
                "error"
            );

            return;

        }


        if (
            password !== confirmPassword
        ) {

            showMessage(
                registerMessage,
                "Passwords do not match.",
                "error"
            );

            return;

        }


        const submitButton =
            registerForm.querySelector(
                'button[type="submit"]'
            );


        submitButton.disabled = true;

        submitButton.querySelector(
            "span"
        ).textContent =
            "Creating account...";


        try {

            // Create Auth User

            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({

                    email: email,

                    password: password,

                    options: {

                        data: {

                            first_name:
                                firstName,

                            last_name:
                                lastName

                        }

                    }

                });


            if (error) {
                throw error;
            }


            if (!data.user) {

                throw new Error(
                    "Account could not be created."
                );

            }


            // Create Profile

            const {
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .insert({

                        id: data.user.id,

                        first_name:
                            firstName,

                        last_name:
                            lastName,

                        email:
                            email

                    });


            if (profileError) {
                throw profileError;
            }


            showMessage(
                registerMessage,
                "Account created successfully!",
                "success"
            );


            registerForm.reset();


            setTimeout(
                function () {

                    registerBox.classList.add(
                        "hidden"
                    );

                    loginBox.classList.remove(
                        "hidden"
                    );

                    loginEmailInput.value =
                        email;

                },
                1000
            );


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            showMessage(
                registerMessage,
                error.message ||
                "Registration failed.",
                "error"
            );

        } finally {

            submitButton.disabled =
                false;

            submitButton.querySelector(
                "span"
            ).textContent =
                "Create account";

        }

    }
);


// =====================================================
// LOGIN
// =====================================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearMessages();


        const email =
            loginEmailInput.value.trim();

        const password =
            loginPasswordInput.value;


        if (!email || !password) {

            showMessage(
                loginMessage,
                "Please enter email and password.",
                "error"
            );

            return;

        }


        const submitButton =
            loginForm.querySelector(
                'button[type="submit"]'
            );


        submitButton.disabled = true;

        submitButton.querySelector(
            "span"
        ).textContent =
            "Signing in...";


        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email:
                            email,

                        password:
                            password

                    });


            if (error) {
                throw error;
            }


            if (!data.user) {

                throw new Error(
                    "Login failed."
                );

            }


            currentUser =
                data.user;


            await showApp();


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            showMessage(
                loginMessage,
                error.message ||
                "Login failed.",
                "error"
            );

        } finally {

            submitButton.disabled =
                false;

            submitButton.querySelector(
                "span"
            ).textContent =
                "Sign in";

        }

    }
);


// =====================================================
// SHOW APP
// =====================================================

async function showApp() {

    authSection.classList.add(
        "hidden"
    );

    appSection.classList.remove(
        "hidden"
    );


    await loadProfile();

    await loadTasks();

}


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile() {

    if (!currentUser) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "first_name, last_name"
                )
                .eq(
                    "id",
                    currentUser.id
                )
                .single();


        if (error) {
            throw error;
        }


        if (data) {

            const fullName =
                `${data.first_name} ${data.last_name}`
                    .trim();


            userName.textContent =
                fullName ||
                "User";

        }


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );


        userName.textContent =
            currentUser.email ||
            "User";

    }

}


// =====================================================
// LOAD TASKS
// =====================================================

async function loadTasks() {

    if (!currentUser) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("tasks")
                .select("*")
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                );


        if (error) {
            throw error;
        }


        allTasks =
            data || [];


        renderTasks(
            allTasks
        );

        updateStats();


    } catch (error) {

        console.error(
            "Task loading error:",
            error
        );


        taskList.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Could not load tasks</h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>

        `;

    }

}


// =====================================================
// ADD TASK
// =====================================================

addBtn.addEventListener(
    "click",
    addTask
);


taskInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            addTask();

        }

    }
);


async function addTask() {

    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;

    }


    const title =
        taskInput.value.trim();

    const priority =
        priorityInput.value;

    const dueDate =
        dueDateInput.value;


    if (!title) {

        alert(
            "Please enter a task."
        );

        taskInput.focus();

        return;

    }


    addBtn.disabled =
        true;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("tasks")
                .insert({

                    user_id:
                        currentUser.id,

                    title:
                        title,

                    description:
                        "",

                    completed:
                        false,

                    priority:
                        priority,

                    due_date:
                        dueDate ||
                        null

                })
                .select()
                .single();


        if (error) {
            throw error;
        }


        allTasks.unshift(
            data
        );


        taskInput.value =
            "";

        dueDateInput.value =
            "";

        priorityInput.value =
            "Medium";


        renderTasks(
            getFilteredTasks()
        );

        updateStats();


        taskInput.focus();


    } catch (error) {

        console.error(
            "Add task error:",
            error
        );


        alert(
            "Could not add task:\n\n" +
            error.message
        );

    } finally {

        addBtn.disabled =
            false;

    }

}


// =====================================================
// RENDER TASKS
// =====================================================

function renderTasks(tasks) {

    if (
        !tasks ||
        tasks.length === 0
    ) {

        taskList.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-clipboard"></i>

                <h3>No tasks found</h3>

                <p>
                    Add a task to start managing your work.
                </p>

            </div>

        `;

        return;

    }


    taskList.innerHTML =
        tasks.map(
            function (task) {

                const completed =
                    Boolean(
                        task.completed
                    );


                const priority =
                    task.priority ||
                    "Medium";


                const priorityClass =
                    priority.toLowerCase();


                let dueText =
                    "";


                if (
                    task.due_date
                ) {

                    dueText = `

                        <span>

                            <i class="fa-regular fa-calendar"></i>

                            ${formatDate(
                                task.due_date
                            )}

                        </span>

                    `;

                }


                return `

                    <div
                        class="task-item ${
                            completed
                                ? "completed"
                                : ""
                        }"
                        data-id="${task.id}"
                    >

                        <button
                            class="task-check-btn"
                            onclick="toggleTask(
                                '${task.id}',
                                ${!completed}
                            )"
                            aria-label="Complete task"
                        >

                            ${
                                completed
                                    ? '<i class="fa-solid fa-check"></i>'
                                    : ""
                            }

                        </button>


                        <div class="task-content">

                            <h3>
                                ${escapeHTML(
                                    task.title
                                )}
                            </h3>


                            <div class="task-meta">

                                <span
                                    class="priority-badge ${priorityClass}"
                                >
                                    ${escapeHTML(
                                        priority
                                    )}
                                </span>

                                ${dueText}

                            </div>

                        </div>


                        <div class="task-actions">

                            <button
                                class="task-edit-btn"
                                onclick="editTask(
                                    '${task.id}'
                                )"
                                aria-label="Edit task"
                            >

                                <i class="fa-regular fa-pen-to-square"></i>

                            </button>


                            <button
                                class="task-delete-btn"
                                onclick="deleteTask(
                                    '${task.id}'
                                )"
                                aria-label="Delete task"
                            >

                                <i class="fa-regular fa-trash-can"></i>

                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// =====================================================
// EDIT TASK
// =====================================================

async function editTask(
    taskId
) {

    const task =
        allTasks.find(
            function (item) {

                return item.id === taskId;

            }
        );


    if (!task) {
        return;
    }


    const newTitle =
        prompt(
            "Edit task title:",
            task.title
        );


    if (newTitle === null) {
        return;
    }


    const title =
        newTitle.trim();


    if (!title) {

        alert(
            "Task title cannot be empty."
        );

        return;

    }


    const newPriority =
        prompt(
            "Priority: Low / Medium / High",
            task.priority ||
            "Medium"
        );


    if (newPriority === null) {
        return;
    }


    const priority =
        newPriority.trim();


    if (
        ![
            "Low",
            "Medium",
            "High"
        ].includes(priority)
    ) {

        alert(
            "Priority must be Low, Medium, or High."
        );

        return;

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("tasks")
                .update({

                    title:
                        title,

                    priority:
                        priority

                })
                .eq(
                    "id",
                    taskId
                )
                .eq(
                    "user_id",
                    currentUser.id
                )
                .select()
                .single();


        if (error) {
            throw error;
        }


        const index =
            allTasks.findIndex(
                function (item) {

                    return item.id === taskId;

                }
            );


        if (index !== -1) {

            allTasks[index] =
                data;

        }


        renderTasks(
            getFilteredTasks()
        );

        updateStats();


    } catch (error) {

        console.error(
            "Edit task error:",
            error
        );


        alert(
            "Could not edit task:\n\n" +
            error.message
        );

    }

}


// =====================================================
// TOGGLE TASK
// =====================================================

async function toggleTask(
    taskId,
    completed
) {

    try {

        const {
            error
        } =
            await supabaseClient
                .from("tasks")
                .update({

                    completed:
                        completed

                })
                .eq(
                    "id",
                    taskId
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {
            throw error;
        }


        const task =
            allTasks.find(
                function (item) {

                    return item.id === taskId;

                }
            );


        if (task) {

            task.completed =
                completed;

        }


        renderTasks(
            getFilteredTasks()
        );

        updateStats();


    } catch (error) {

        console.error(
            "Toggle task error:",
            error
        );


        alert(
            "Could not update task:\n\n" +
            error.message
        );

    }

}


// =====================================================
// DELETE TASK
// =====================================================

async function deleteTask(
    taskId
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("tasks")
                .delete()
                .eq(
                    "id",
                    taskId
                )
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {
            throw error;
        }


        allTasks =
            allTasks.filter(
                function (task) {

                    return task.id !== taskId;

                }
            );


        renderTasks(
            getFilteredTasks()
        );

        updateStats();


    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );


        alert(
            "Could not delete task:\n\n" +
            error.message
        );

    }

}


// =====================================================
// CLEAR ALL
// =====================================================

clearBtn.addEventListener(
    "click",
    clearAllTasks
);


async function clearAllTasks() {

    if (!currentUser) {
        return;
    }


    if (
        allTasks.length === 0
    ) {

        alert(
            "There are no tasks to clear."
        );

        return;

    }


    const confirmClear =
        confirm(
            "Are you sure you want to delete ALL your tasks?"
        );


    if (!confirmClear) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("tasks")
                .delete()
                .eq(
                    "user_id",
                    currentUser.id
                );


        if (error) {
            throw error;
        }


        allTasks = [];


        renderTasks(
            allTasks
        );

        updateStats();


    } catch (error) {

        console.error(
            "Clear tasks error:",
            error
        );


        alert(
            "Could not clear tasks:\n\n" +
            error.message
        );

    }

}


// =====================================================
// SEARCH
// =====================================================

searchInput.addEventListener(
    "input",
    function () {

        renderTasks(
            getFilteredTasks()
        );

    }
);


function getFilteredTasks() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!searchTerm) {

        return allTasks;

    }


    return allTasks.filter(
        function (task) {

            const title =
                (
                    task.title ||
                    ""
                ).toLowerCase();


            const description =
                (
                    task.description ||
                    ""
                ).toLowerCase();


            const priority =
                (
                    task.priority ||
                    ""
                ).toLowerCase();


            return (
                title.includes(
                    searchTerm
                ) ||

                description.includes(
                    searchTerm
                ) ||

                priority.includes(
                    searchTerm
                )
            );

        }
    );

}


// =====================================================
// UPDATE STATS
// =====================================================

function updateStats() {

    const total =
        allTasks.length;


    const completed =
        allTasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    const pending =
        total -
        completed;


    totalTask.textContent =
        total;

    completedTask.textContent =
        completed;

    pendingTask.textContent =
        pending;

}


// =====================================================
// LOGOUT
// =====================================================

logoutBtn.addEventListener(
    "click",
    logout
);


async function logout() {

    try {

        const {
            error
        } =
            await supabaseClient.auth
                .signOut();


        if (error) {
            throw error;
        }


        currentUser =
            null;

        allTasks =
            [];


        appSection.classList.add(
            "hidden"
        );

        authSection.classList.remove(
            "hidden"
        );


        loginForm.reset();

        registerForm.reset();


        loginBox.classList.remove(
            "hidden"
        );

        registerBox.classList.add(
            "hidden"
        );


        clearMessages();


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        alert(
            "Could not logout:\n\n" +
            error.message
        );

    }

}


// =====================================================
// SESSION CHECK
// =====================================================

async function checkSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {
            throw error;
        }


        if (data.session) {

            currentUser =
                data.session.user;


            await showApp();

        }

    } catch (error) {

        console.error(
            "Session error:",
            error
        );

    }

}


// =====================================================
// AUTH STATE CHANGE
// =====================================================

supabaseClient.auth
    .onAuthStateChange(
        function (
            event,
            session
        ) {

            if (
                event ===
                    "SIGNED_IN" &&
                session
            ) {

                currentUser =
                    session.user;

            }


            if (
                event ===
                "SIGNED_OUT"
            ) {

                currentUser =
                    null;

            }

        }
    );


// =====================================================
// HELPERS
// =====================================================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-US",
        {

            month: "short",

            day: "numeric",

            year: "numeric"

        }
    );

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// START APP
// =====================================================

checkSession();