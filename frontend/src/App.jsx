import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://employeehub-vubc.onrender.com";

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      onLogin(username);
    } catch (error) {
      setError(
        "Login failed. Check your credentials, login endpoint, and backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>EmployeeHub</h1>
        <p>Employee Management System</p>

        {error && <p className="error-message">{error}</p>}

        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ setPage }) {
  return (
    <section>
      <h1>Dashboard</h1>
      <p>Welcome to EmployeeHub Management System.</p>

      <div className="dashboard-cards">
        <button onClick={() => setPage("employees")} className="dashboard-card">
          <h2>Employees</h2>
          <p>Manage employee information</p>
        </button>

        <button onClick={() => setPage("departments")} className="dashboard-card">
          <h2>Departments</h2>
          <p>View departments</p>
        </button>

        <button onClick={() => setPage("salary")} className="dashboard-card">
          <h2>Salary</h2>
          <p>View salary records</p>
        </button>
      </div>
    </section>
  );
}

function Employees() {
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    designation: "",
  };

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadEmployees() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/employees");
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(
        "Cannot load employees. Check backend availability, CORS, and ADMIN login."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function editEmployee(employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      designation: employee.designation || "",
    });
    setError("");
    setNotice("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const editing = editingId !== null;

      await apiRequest(
        editing ? `/api/employees/${editingId}` : "/api/employees",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(form),
        }
      );

      setNotice(
        editing
          ? "Employee updated successfully."
          : "Employee added successfully."
      );

      cancelEdit();
      await loadEmployees();
    } catch (error) {
      setError(`Unable to save employee: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(id) {
    if (!window.confirm("Delete this employee?")) return;

    setError("");
    setNotice("");

    try {
      await apiRequest(`/api/employees/${id}`, { method: "DELETE" });
      setNotice("Employee deleted successfully.");
      await loadEmployees();
    } catch (error) {
      setError(`Unable to delete employee: ${error.message}`);
    }
  }

  return (
    <section>
      <h1>Employee Management</h1>
      <p>Add and manage employee information.</p>

      {error && <p className="error-message">{error}</p>}
      {notice && <p className="success-message">{notice}</p>}

      <form className="employee-form" onSubmit={handleSubmit}>
        <h2>{editingId !== null ? "Edit Employee" : "Add Employee"}</h2>

        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={updateField}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={updateField}
          required
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={updateField}
        />

        <input
          name="designation"
          placeholder="Designation"
          value={form.designation}
          onChange={updateField}
        />

        <button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId !== null
              ? "Update Employee"
              : "Add Employee"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            className="secondary-button"
            onClick={cancelEdit}
          >
            Cancel
          </button>
        )}
      </form>

      <h2>Employee List</h2>

      {loading ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.phone || "-"}</td>
                  <td>{employee.designation || "-"}</td>
                  <td>
                    <button onClick={() => editEmployee(employee)}>
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => deleteEmployee(employee.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DataTable({ title, endpoint }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest(endpoint)
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, [endpoint]);

  return (
    <section>
      <h1>{title}</h1>

      {error && <p className="error-message">Unable to load records: {error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {Object.keys(items[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id ?? index}>
                  {Object.keys(items[0]).map((key) => (
                    <td key={key}>{String(item[key] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  async function logout() {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    setLoggedIn(false);
    setUsername("");
    setPage("dashboard");
  }

  if (!loggedIn) {
    return (
      <Login
        onLogin={(name) => {
          setUsername(name);
          setLoggedIn(true);
          setPage("dashboard");
        }}
      />
    );
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>EmployeeHub</h2>
        <p>Management System</p>
        <p>Welcome, {username}</p>

        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("employees")}>Employees</button>
        <button onClick={() => setPage("departments")}>Departments</button>
        <button onClick={() => setPage("salary")}>Salary</button>
        <button className="logout-button" onClick={logout}>Logout</button>
      </aside>

      <main className="main-content">
        {page === "dashboard" && <Dashboard setPage={setPage} />}
        {page === "employees" && <Employees />}
        {page === "departments" && (
          <DataTable title="Departments" endpoint="/api/departments" />
        )}
        {page === "salary" && (
          <DataTable title="Salary Management" endpoint="/api/salaries" />
        )}
      </main>
    </div>
  );
}