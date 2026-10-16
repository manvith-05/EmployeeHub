
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";
import "./App.css";

const API = "/api/employees";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>EmployeeHub</h2>
        <p className="sidebar-subtitle">Management System</p>
        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/employees">Employees</Link>
          <Link to="/departments">Departments</Link>
          <Link to="/salary">Salary</Link>
          <Link to="/login">Login</Link>
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}

function Dashboard() {
  return (
    <Layout>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to EmployeeHub</p>
      </header>
      <div className="dashboard-grid">
        <Link className="dashboard-card" to="/employees">
          <h3>Employee Management</h3>
          <p>Add, view, update and delete employees.</p>
        </Link>
        <Link className="dashboard-card" to="/departments">
          <h3>Department Management</h3>
          <p>Manage company departments.</p>
        </Link>
        <Link className="dashboard-card" to="/salary">
          <h3>Salary Management</h3>
          <p>View and manage salary details.</p>
        </Link>
      </div>
    </Layout>
  );
}

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API, {
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        setError("Access denied. Please log in using your ADMIN account.");
        setEmployees([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to load employees.");
      }

      const data = await response.json();
      setEmployees(data);
    } catch {
      setError("Cannot connect to the backend. Check that Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const url = editingId === null ? API : `${API}/${editingId}`;
    const method = editingId === null ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Access denied. Log in using an ADMIN account.");
      }

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || "Unable to save employee.");
      }

      setMessage(editingId === null
        ? "Employee added successfully."
        : "Employee updated successfully.");

      setForm({
        name: "",
        email: "",
        phone: "",
        designation: ""
      });
      setEditingId(null);
      await loadEmployees();
    } catch (err) {
      setError(err.message || "Unable to save employee.");
    }
  }

  function handleEdit(employee) {
    setEditingId(employee.id);
    setForm({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      designation: employee.designation || ""
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("Access denied. Log in using an ADMIN account.");
      }

      if (!response.ok) {
        throw new Error("Unable to delete employee.");
      }

      setMessage("Employee deleted successfully.");
      await loadEmployees();
    } catch (err) {
      setError(err.message || "Unable to delete employee.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      designation: ""
    });
    setError("");
    setMessage("");
  }

  return (
    <Layout>
      <header className="page-header">
        <h1>Employee Management</h1>
        <p>Add and manage employee information</p>
      </header>

      <section className="panel">
        <h2>{editingId === null ? "Add Employee" : "Update Employee"}</h2>

        <form className="employee-form" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Employee Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <input
            name="designation"
            placeholder="Designation"
            value={form.designation}
            onChange={handleChange}
            required
          />

          <div className="form-actions">
            <button type="submit">
              {editingId === null ? "Add Employee" : "Update Employee"}
            </button>

            {editingId !== null && (
              <button type="button" className="secondary-button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}

      <section className="panel">
        <h2>Employee List</h2>

        {loading ? (
          <p>Loading employees...</p>
        ) : employees.length === 0 ? (
          <p>No employees found.</p>
        ) : (
          <div className="table-wrapper">
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
                    <td>{employee.phone}</td>
                    <td>{employee.designation}</td>
                    <td className="action-buttons">
                      <button type="button" onClick={() => handleEdit(employee)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDelete(employee.id)}
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
    </Layout>
  );
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error("Login failed. Check your username, password and ADMIN role.");
      }

      navigate("/employees");
    } catch (err) {
      setError(err.message || "Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form className="panel login-panel" onSubmit={handleLogin}>
        <h1>EmployeeHub</h1>
        <p>Admin Login</p>

        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Enter username"
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          required
        />

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        <Link className="back-link" to="/">
          Back to Dashboard
        </Link>
      </form>
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <Layout>
      <header className="page-header">
        <h1>{title}</h1>
        <p>This section is ready for further development.</p>
      </header>
      <section className="panel">
        <p>The {title.toLowerCase()} page is not connected to its backend yet.</p>
      </section>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/employees" element={<Employees />} />
        <Route
          path="/departments"
          element={<ComingSoon title="Department Management" />}
        />
        <Route
          path="/salary"
          element={<ComingSoon title="Salary Management" />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
