import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  // Try to parse JSON error nicely
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const msg =
      (data && (data.detail || data.message)) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export default function App() {
  // ===== Employees =====
  const [employees, setEmployees] = useState([]);
  const [empLoading, setEmpLoading] = useState(true);
  const [empError, setEmpError] = useState("");

  const [newEmp, setNewEmp] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });
  const [addEmpLoading, setAddEmpLoading] = useState(false);
  const [addEmpMsg, setAddEmpMsg] = useState("");
  const [addEmpErr, setAddEmpErr] = useState("");

  // ===== Attendance (Mark) =====
  const [attForm, setAttForm] = useState({
    employee_id: "",
    date: "",
    status: "",
  });
  const [markLoading, setMarkLoading] = useState(false);
  const [markMsg, setMarkMsg] = useState("");
  const [markErr, setMarkErr] = useState("");

  // ===== Attendance (View) =====
  const [selectedEmp, setSelectedEmp] = useState("");
  const [attRecords, setAttRecords] = useState([]);
  const [attLoading, setAttLoading] = useState(false);
  const [attError, setAttError] = useState("");

  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // -------- Helpers --------
  const presentCount = useMemo(() => {
    return (attRecords || []).filter(
      (r) => String(r.status).toLowerCase() === "present"
    ).length;
  }, [attRecords]);

  const filteredAttendance = useMemo(() => {
    if (!attRecords) return [];
    if (!filterFrom && !filterTo) return attRecords;

    const from = filterFrom ? new Date(filterFrom) : null;
    const to = filterTo ? new Date(filterTo) : null;

    return attRecords.filter((r) => {
      const d = new Date(r.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [attRecords, filterFrom, filterTo]);

  // -------- API Calls --------
  async function loadEmployees() {
    setEmpLoading(true);
    setEmpError("");
    try {
      const data = await api("/employees");
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      setEmpError(e.message);
    } finally {
      setEmpLoading(false);
    }
  }

  async function addEmployee(e) {
    e.preventDefault();
    setAddEmpLoading(true);
    setAddEmpErr("");
    setAddEmpMsg("");

    try {
      const payload = {
        employee_id: newEmp.employee_id.trim(),
        full_name: newEmp.full_name.trim(),
        email: newEmp.email.trim(),
        department: newEmp.department.trim(),
      };

      await api("/employees", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setAddEmpMsg("✅ Employee added successfully");
      setNewEmp({ employee_id: "", full_name: "", email: "", department: "" });
      await loadEmployees();
    } catch (e2) {
      setAddEmpErr(e2.message);
    } finally {
      setAddEmpLoading(false);
    }
  }

  async function deleteEmployee(empId) {
    const ok = confirm(`Delete employee ${empId}?`);
    if (!ok) return;

    try {
      await api(`/employees/${encodeURIComponent(empId)}`, {
        method: "DELETE",
      });

      // Also clear selections if deleted
      if (selectedEmp === empId) {
        setSelectedEmp("");
        setAttRecords([]);
      }
      if (attForm.employee_id === empId) {
        setAttForm((p) => ({ ...p, employee_id: "" }));
      }

      await loadEmployees();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  async function markAttendance(e) {
    e.preventDefault();
    setMarkLoading(true);
    setMarkErr("");
    setMarkMsg("");

    try {
      const payload = {
        employee_id: attForm.employee_id.trim(),
        date: attForm.date, // yyyy-mm-dd
        status: attForm.status, // Present / Absent
      };

      await api("/attendance", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setMarkMsg("✅ Attendance marked");
      setAttForm({ employee_id: "", date: "", status: "" });

      // If viewing same employee, refresh list
      if (selectedEmp && selectedEmp === payload.employee_id) {
        await loadAttendance(selectedEmp);
      }
    } catch (e2) {
      setMarkErr(e2.message);
    } finally {
      setMarkLoading(false);
    }
  }

  // NOTE: some backends use /attendance/{emp_id} ; some use /attendance?employee_id=
  async function loadAttendance(empId) {
    if (!empId) return;
    setAttLoading(true);
    setAttError("");
    setAttRecords([]);

    try {
      let data = null;
      try {
        data = await api(`/attendance/${encodeURIComponent(empId)}`);
      } catch {
        // fallback
        data = await api(`/attendance?employee_id=${encodeURIComponent(empId)}`);
      }
      setAttRecords(Array.isArray(data) ? data : []);
    } catch (e) {
      setAttError(e.message);
    } finally {
      setAttLoading(false);
    }
  }

  // -------- Effects --------
  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmp) loadAttendance(selectedEmp);
  }, [selectedEmp]);

  // -------- UI --------
  return (
    <div className="page">
      <header className="header">
        <div className="logo">🏢</div>
        <div>
          <h1>HRMS Lite</h1>
          <p className="sub">Employee + Attendance Management</p>
        </div>
        <div className="right">
          <span className="pill">API: {API_BASE}</span>
        </div>
      </header>

      <div className="grid">
        {/* ===== Add Employee ===== */}
        <section className="card">
          <h2>Add Employee</h2>

          <form onSubmit={addEmployee} className="form">
            <label>
              Employee ID
              <input
                value={newEmp.employee_id}
                onChange={(e) =>
                  setNewEmp((p) => ({ ...p, employee_id: e.target.value }))
                }
                placeholder="EMP001"
              />
            </label>

            <label>
              Full Name
              <input
                value={newEmp.full_name}
                onChange={(e) =>
                  setNewEmp((p) => ({ ...p, full_name: e.target.value }))
                }
                placeholder="Aman Verma"
              />
            </label>

            <label>
              Email
              <input
                value={newEmp.email}
                onChange={(e) =>
                  setNewEmp((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="aman@gmail.com"
              />
            </label>

            <label>
              Department
              <input
                value={newEmp.department}
                onChange={(e) =>
                  setNewEmp((p) => ({ ...p, department: e.target.value }))
                }
                placeholder="IT / HR"
              />
            </label>

            <button className="btn" disabled={addEmpLoading}>
              {addEmpLoading ? "Adding..." : "Add Employee"}
            </button>

            {addEmpMsg ? <div className="ok">{addEmpMsg}</div> : null}
            {addEmpErr ? <div className="err">❌ {addEmpErr}</div> : null}
          </form>
        </section>

        {/* ===== Employee List ===== */}
        <section className="card">
          <div className="row">
            <h2>Employee List</h2>
            <button className="btn ghost" onClick={loadEmployees}>
              Refresh
            </button>
          </div>

          {empLoading ? (
            <div className="muted">Loading employees...</div>
          ) : empError ? (
            <div className="err">❌ {empError}</div>
          ) : employees.length === 0 ? (
            <div className="muted">No employees yet. Add one from left.</div>
          ) : (
            <ul className="list">
              {employees.map((e) => (
                <li key={e.employee_id} className="listItem">
                  <div className="listMain">
                    <div className="strong">{e.employee_id}</div>
                    <div className="muted">
                      {e.full_name} • {e.department} • {e.email}
                    </div>
                  </div>

                  <div className="actions">
                    <button
                      className="btn tiny"
                      onClick={() => setSelectedEmp(e.employee_id)}
                      title="View attendance"
                    >
                      Attendance
                    </button>
                    <button
                      className="btn danger tiny"
                      onClick={() => deleteEmployee(e.employee_id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ===== Mark Attendance ===== */}
        <section className="card">
          <h2>Mark Attendance</h2>

          <form onSubmit={markAttendance} className="form">
            <label>
              Employee ID
              <input
                value={attForm.employee_id}
                onChange={(e) =>
                  setAttForm((p) => ({ ...p, employee_id: e.target.value }))
                }
                placeholder="EMP001"
              />
            </label>

            <label>
              Date
              <input
                type="date"
                value={attForm.date}
                onChange={(e) =>
                  setAttForm((p) => ({ ...p, date: e.target.value }))
                }
              />
            </label>

            <label>
              Status
              <select
                value={attForm.status}
                onChange={(e) =>
                  setAttForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="">Select Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </label>

            <button className="btn" disabled={markLoading}>
              {markLoading ? "Marking..." : "Mark Attendance"}
            </button>

            <div className="hint">
              Note: same employee + same date dobara mark karoge to duplicate error aayega.
            </div>

            {markMsg ? <div className="ok">{markMsg}</div> : null}
            {markErr ? <div className="err">❌ {markErr}</div> : null}
          </form>
        </section>

        {/* ===== View Attendance ===== */}
        <section className="card">
          <div className="row">
            <h2>Attendance Records</h2>
          </div>

          <div className="form">
            <label>
              Select Employee
              <select
                value={selectedEmp}
                onChange={(e) => setSelectedEmp(e.target.value)}
              >
                <option value="">-- Select --</option>
                {employees.map((e) => (
                  <option key={e.employee_id} value={e.employee_id}>
                    {e.employee_id} • {e.full_name}
                  </option>
                ))}
              </select>
            </label>

            <div className="two">
              <label>
                From (optional)
                <input
                  type="date"
                  value={filterFrom}
                  onChange={(e) => setFilterFrom(e.target.value)}
                />
              </label>

              <label>
                To (optional)
                <input
                  type="date"
                  value={filterTo}
                  onChange={(e) => setFilterTo(e.target.value)}
                />
              </label>
            </div>

            <div className="row">
              <div className="pill">
                Total Present: <b>{presentCount}</b>
              </div>
              <button
                className="btn ghost"
                onClick={() => selectedEmp && loadAttendance(selectedEmp)}
                disabled={!selectedEmp}
              >
                Refresh Attendance
              </button>
            </div>
          </div>

          {!selectedEmp ? (
            <div className="muted">Select an employee to view attendance.</div>
          ) : attLoading ? (
            <div className="muted">Loading attendance...</div>
          ) : attError ? (
            <div className="err">❌ {attError}</div>
          ) : filteredAttendance.length === 0 ? (
            <div className="muted">No attendance records found.</div>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance
                    .slice()
                    .sort((a, b) => (a.date > b.date ? -1 : 1))
                    .map((r) => (
                      <tr key={`${r.employee_id}-${r.date}`}>
                        <td>{r.date}</td>
                        <td>
                          <span
                            className={
                              String(r.status).toLowerCase() === "present"
                                ? "tag okTag"
                                : "tag badTag"
                            }
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <footer className="footer">
        <span className="muted">HRMS Lite • FastAPI + React</span>
      </footer>
    </div>
  );
}
