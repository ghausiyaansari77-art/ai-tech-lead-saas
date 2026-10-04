import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

//const API_BASE_URL = 'http://localhost:8085';
const API_BASE_URL = 'https://ai-tech-lead-saas.onrender.com';

function App() {
  // =========================================================
  // AUTH STATE
  // =========================================================

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Auth storage parse failure:', error);
      localStorage.removeItem('auth_user');
      return null;
    }
  });

  const [authMode, setAuthMode] = useState('login');

  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // =========================================================
  // PROJECT STATE
  // =========================================================

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjInput, setShowNewProjInput] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);

  // =========================================================
  // MAIN APPLICATION STATE
  // =========================================================

  const [activeTab, setActiveTab] = useState('editor');

  const [language, setLanguage] = useState('Java');

  const [code, setCode] = useState(
    '// Submit algorithmic implementation blueprints here...\n'
  );

  const [inputData, setInputData] = useState('');

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);

  const [history, setHistory] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');

  // =========================================================
  // FETCH PROJECTS
  // =========================================================

  const fetchProjects = async () => {
    if (!user || !user.id) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/user/${user.id}`
      );

      if (!response.ok) {
        console.error(
          'Project fetch failed:',
          response.status,
          response.statusText
        );
        return;
      }

      const data = await response.json();

      const projectList = Array.isArray(data) ? data : [];

      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProjectId(
          String(projectList[0].id || projectList[0]._id || '')
        );
      } else {
        setSelectedProjectId('');
      }
    } catch (error) {
      console.error('Project infrastructure load breakdown:', error);
    }
  };

  // =========================================================
  // FETCH HISTORY
  // =========================================================

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/history`
      );

      if (!response.ok) {
        console.error(
          'History fetch failed:',
          response.status,
          response.statusText
        );
        return;
      }

      const data = await response.json();

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Telemetry sync failure:', error);
    }
  };

  // =========================================================
  // INITIAL USER DATA LOAD
  // =========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchProjects();
    fetchHistory();
  }, [user]);

  // =========================================================
  // AUTH FORM CHANGE
  // =========================================================

  const handleAuthChange = (event) => {
    const { name, value } = event.target;

    setAuthForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setAuthError('');
  };

  // =========================================================
  // LOGIN / SIGNUP
  // =========================================================

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    setAuthError('');
    setAuthLoading(true);

    try {
      const endpoint =
        authMode === 'login'
          ? `${API_BASE_URL}/api/auth/login`
          : `${API_BASE_URL}/api/auth/signup`;

      const payload =
        authMode === 'login'
          ? {
              email: authForm.email,
              password: authForm.password
            }
          : {
              email: authForm.email,
              password: authForm.password,
              fullName: authForm.fullName
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Authentication failed with status ${response.status}`
        );
      }

      if (authMode === 'signup') {
        setAuthError('');
        setAuthMode('login');

        setAuthForm({
          email: authForm.email,
          password: '',
          fullName: ''
        });

        alert('Account created successfully. Please login.');
        return;
      }

      const loggedInUser =
        data?.user ||
        data?.data ||
        data;

      if (!loggedInUser || !loggedInUser.id) {
        throw new Error(
          'Login succeeded but user information was not returned by the server.'
        );
      }

      localStorage.setItem(
        'auth_user',
        JSON.stringify(loggedInUser)
      );

      setUser(loggedInUser);

      setAuthForm({
        email: '',
        password: '',
        fullName: ''
      });
    } catch (error) {
      console.error('Authentication failure:', error);

      setAuthError(
        error.message || 'Unable to complete authentication.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem('auth_user');

    setUser(null);
    setResult(null);
    setHistory([]);
    setProjects([]);
    setSelectedProjectId('');
    setErrorMessage('');

    setCode(
      '// Submit algorithmic implementation blueprints here...\n'
    );

    setInputData('');
  };

  // =========================================================
  // CREATE PROJECT
  // =========================================================

  const handleCreateProject = async () => {
    if (!user || !user.id) {
      return;
    }

    const trimmedName = newProjectName.trim();

    if (!trimmedName) {
      return;
    }

    setProjectLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/projects/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            projectName: trimmedName,
            description: 'Dynamic developer tracking zone'
          })
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Project creation failed with status ${response.status}`
        );
      }

      setNewProjectName('');
      setShowNewProjInput(false);

      await fetchProjects();
    } catch (error) {
      console.error('Project creation failure:', error);
      setErrorMessage(
        error.message || 'Unable to create project.'
      );
    } finally {
      setProjectLoading(false);
    }
  };

  // =========================================================
  // ANALYZE CODE
  // =========================================================

  const handleAnalyze = async () => {
    if (!user || !user.id) {
      setErrorMessage('Please login before submitting a review.');
      return;
    }

    if (!code.trim()) {
      setErrorMessage('Please enter some code before analysis.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            language,
            code,
            inputData,
            projectId: selectedProjectId,
            userId: user.id
          })
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Analysis failed with status ${response.status}`
        );
      }

      setResult(data);

      await fetchHistory();
    } catch (error) {
      console.error('Code analysis failure:', error);

      setErrorMessage(
        error.message ||
          'Unable to analyze the submitted code.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DOWNLOAD / PRINT REPORT
  // =========================================================

  const handleDownloadPDF = () => {
    window.print();
  };

  // =========================================================
  // PROJECT FILTERED HISTORY
  // =========================================================

  const filteredHistory = history.filter((item) => {
    if (!selectedProjectId) {
      return true;
    }

    const historyProjectId =
      item?.projectId ??
      item?.project?.id ??
      item?.project?._id ??
      '';

    return (
      String(historyProjectId) ===
      String(selectedProjectId)
    );
  });

  // =========================================================
  // CHART DATA
  // =========================================================

  const chartData = filteredHistory
    .slice()
    .reverse()
    .map((item, index) => {
      const complexity =
        item?.calculatedComplexity ||
        item?.timeComplexity ||
        'O(log N)';

      return {
        name: `Review ${index + 1}`,
        complexity,
        score:
          Number(
            item?.score ??
              item?.qualityScore ??
              item?.reviewScore ??
              0
          ) || 0
      };
    });

  // =========================================================
  // AUTH SCREEN
  // =========================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                    AI
                  </div>

                  <div>
                    <h1 className="text-xl font-bold tracking-tight">
                      AI Tech Lead
                    </h1>

                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">
                      Code Intelligence Platform
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-400 mt-5">
                  Analyze implementation quality, complexity and
                  engineering recommendations.
                </p>
              </div>

              <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                    authMode === 'login'
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  LOGIN
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                    authMode === 'signup'
                      ? 'bg-slate-800 text-amber-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  SIGN UP
                </button>
              </div>

              <form
                onSubmit={handleAuthSubmit}
                className="space-y-4"
              >
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={authForm.fullName}
                      onChange={handleAuthChange}
                      placeholder="Your name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/60"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={authForm.email}
                    onChange={handleAuthChange}
                    placeholder="developer@example.com"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={authForm.password}
                    onChange={handleAuthChange}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500/60"
                  />
                </div>

                {authError && (
                  <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 text-xs text-red-400">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black rounded-xl py-3.5 text-xs uppercase tracking-wider transition"
                >
                  {authLoading
                    ? 'Processing...'
                    : authMode === 'login'
                    ? 'Enter Workspace'
                    : 'Create Account'}
                </button>
              </form>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-600 mt-5 uppercase tracking-wider">
            AI Tech Lead • Developer Intelligence
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="h-16 border-b border-slate-800 bg-slate-950/95 backdrop-blur flex items-center justify-between px-5 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
            AI
          </div>

          <div>
            <h1 className="text-sm font-black tracking-tight">
              AI TECH LEAD
            </h1>

            <p className="text-[8px] uppercase tracking-[0.2em] text-slate-600">
              Engineering Intelligence
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold ${
              activeTab === 'editor'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Code Review
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Analytics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-[10px] uppercase tracking-wider font-bold ${
              activeTab === 'history'
                ? 'bg-slate-800 text-amber-400'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            History
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-300">
              {user?.fullName ||
                user?.name ||
                user?.email ||
                'Developer'}
            </p>

            <p className="text-[9px] text-slate-600">
              {user?.email || 'Authenticated User'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-lg border border-slate-800 text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:text-red-400 hover:border-red-900 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        {/* ===================================================
            PROJECT BAR
        ==================================================== */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600 font-bold mb-1">
                Active Workspace
              </p>

              <h2 className="text-sm font-bold text-slate-200">
                Project Intelligence
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedProjectId}
                onChange={(event) =>
                  setSelectedProjectId(event.target.value)
                }
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none min-w-[220px]"
              >
                <option value="">
                  Select Project
                </option>

                {projects.map((project) => {
                  const projectId =
                    project?.id || project?._id || '';

                  const projectName =
                    project?.projectName ||
                    project?.name ||
                    'Untitled Project';

                  return (
                    <option
                      key={String(projectId)}
                      value={String(projectId)}
                    >
                      {projectName}
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() =>
                  setShowNewProjInput((previous) => !previous)
                }
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-[10px] uppercase font-bold tracking-wider text-amber-400 hover:bg-slate-700"
              >
                + Project
              </button>
            </div>
          </div>

          {showNewProjInput && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(event) =>
                  setNewProjectName(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleCreateProject();
                  }
                }}
                placeholder="Enter new project name..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-amber-500/60"
              />

              <button
                type="button"
                onClick={handleCreateProject}
                disabled={projectLoading}
                className="px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider disabled:opacity-50"
              >
                {projectLoading
                  ? 'Creating...'
                  : 'Create Project'}
              </button>
            </div>
          )}
        </div>

        {/* ===================================================
            ERROR MESSAGE
        ==================================================== */}

        {errorMessage && (
          <div className="mb-5 bg-red-950/30 border border-red-900/60 rounded-xl px-4 py-3 text-xs text-red-400">
            {errorMessage}
          </div>
        )}

        {/* ===================================================
            EDITOR TAB
        ==================================================== */}

        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
            {/* ===============================================
                CODE EDITOR
            ================================================ */}

            <section className="xl:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                    Implementation
                  </span>

                  <select
                    value={language}
                    onChange={(event) =>
                      setLanguage(event.target.value)
                    }
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] text-amber-400 outline-none"
                  >
                    <option value="Java">Java</option>
                    <option value="JavaScript">
                      JavaScript
                    </option>
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="C">C</option>
                    <option value="Go">Go</option>
                    <option value="Kotlin">Kotlin</option>
                  </select>
                </div>

                <span className="text-[9px] text-slate-600 uppercase tracking-wider">
                  {code.length} chars
                </span>
              </div>

              <div className="p-3">
                <textarea
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value)
                  }
                  spellCheck="false"
                  className="w-full h-[500px] resize-none bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs md:text-sm text-slate-300 font-mono leading-relaxed outline-none focus:border-slate-700"
                  placeholder="Write your code here..."
                />
              </div>

              <div className="px-3 pb-3">
                <label className="block text-[9px] uppercase tracking-wider font-bold text-slate-600 mb-2">
                  Input Data
                </label>

                <textarea
                  value={inputData}
                  onChange={(event) =>
                    setInputData(event.target.value)
                  }
                  className="w-full h-24 resize-none bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 font-mono outline-none focus:border-slate-700"
                  placeholder="Optional runtime input..."
                />
              </div>

              <div className="px-3 pb-4">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading
                    ? 'Analyzing Implementation...'
                    : 'Run AI Technical Review'}
                </button>
              </div>
            </section>

            {/* ===============================================
                RESULT PANEL
            ================================================ */}

            <section className="xl:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">
                    Technical Report
                  </span>

                  <span className="ml-2 text-[8px] uppercase tracking-wider text-slate-700">
                    AI Analysis
                  </span>
                </div>

                {result && (
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="text-[9px] uppercase tracking-wider font-bold text-slate-500 hover:text-amber-400"
                  >
                    Print Report
                  </button>
                )}
              </div>

              {!result && !loading && (
                <div className="min-h-[650px] flex items-center justify-center p-8">
                  <div className="text-center max-w-sm">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl mb-5">
                      ◈
                    </div>

                    <h3 className="text-sm font-bold text-slate-300 mb-2">
                      Awaiting Technical Review
                    </h3>

                    <p className="text-xs leading-relaxed text-slate-600">
                      Submit your implementation to generate
                      complexity analysis, review summary,
                      recommendations and compiler telemetry.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="min-h-[650px] flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-slate-700 border-t-amber-400 rounded-full animate-spin mx-auto mb-5" />

                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      AI is reviewing your implementation...
                    </p>

                    <p className="text-[10px] text-slate-700 mt-2">
                      Parsing complexity • architecture • runtime
                    </p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="p-4 space-y-4">
                  {/* =========================================
                      DYNAMIC PARSED REPORTS GRID ROW WINDOWS
                  ========================================== */}

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl">
                      <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider block mb-1">
                        Time Complexity
                      </span>

                      <span className="text-amber-400 font-mono font-bold text-xs">
                        {result?.calculatedComplexity ||
                          'O(log N)'}
                      </span>
                    </div>

                    <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl">
                      <span className="text-slate-500 font-semibold uppercase text-[9px] tracking-wider block mb-1">
                        Space Complexity
                      </span>

                      <span className="text-amber-400 font-mono font-bold text-xs">
                        O(1)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 flex-grow overflow-y-auto max-h-[350px]">
                    {/* REVIEW SUMMARY */}

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                        Review Summary & Recommendations
                      </h4>

                      <pre className="text-xs leading-relaxed text-slate-300 font-mono whitespace-pre-wrap select-text bg-slate-950 p-2 rounded-lg shadow-inner border border-slate-900">
                        {result?.aiFeedback ||
                          result?.feedback ||
                          'System parameters parsed successfully. Standard review guidelines generated above.'}
                      </pre>
                    </div>

                    {/* COMPILER CONSOLE */}

                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                        Compiler Console
                      </h4>

                      <pre className="text-xs leading-relaxed text-emerald-400 font-mono whitespace-pre-wrap select-text bg-slate-950 p-2.5 rounded-lg border border-slate-900 shadow-inner">
                        {result?.compilerConsoleOutput
                          ? result.compilerConsoleOutput
                          : 'Executing stream empty. Process completed with exit status code.'}
                      </pre>
                    </div>
                  </div>

                  {/* RUNTIME / ERROR LOGS */}

                  {(result?.runtimeError ||
                    result?.error ||
                    result?.errorMessage) && (
                    <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-4">
                      <h4 className="text-[10px] uppercase font-bold text-red-400 mb-2 tracking-wider">
                        Runtime / Error Logs
                      </h4>

                      <pre className="text-xs leading-relaxed text-red-300 font-mono whitespace-pre-wrap">
                        {result?.runtimeError ||
                          result?.error ||
                          result?.errorMessage}
                      </pre>
                    </div>
                  )}

                  {/* ADDITIONAL RESULT INFORMATION */}

                  {result?.recommendations && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider">
                        Engineering Recommendations
                      </h4>

                      <pre className="text-xs leading-relaxed text-slate-300 font-mono whitespace-pre-wrap">
                        {typeof result.recommendations ===
                        'string'
                          ? result.recommendations
                          : JSON.stringify(
                              result.recommendations,
                              null,
                              2
                            )}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ===================================================
            ANALYTICS TAB
        ==================================================== */}

        {activeTab === 'analytics' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
                  Total Reviews
                </p>

                <p className="text-3xl font-black text-slate-200 mt-2">
                  {filteredHistory.length}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
                  Active Language
                </p>

                <p className="text-3xl font-black text-amber-400 mt-2">
                  {language}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <p className="text-[9px] uppercase tracking-wider text-slate-600 font-bold">
                  Current Project
                </p>

                <p className="text-lg font-black text-slate-200 mt-3 truncate">
                  {projects.find(
                    (project) =>
                      String(
                        project?.id ||
                          project?._id ||
                          ''
                      ) === String(selectedProjectId)
                  )?.projectName ||
                    projects.find(
                      (project) =>
                        String(
                          project?.id ||
                            project?._id ||
                            ''
                        ) === String(selectedProjectId)
                    )?.name ||
                    'All Projects'}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="mb-5">
                <h3 className="text-sm font-bold text-slate-300">
                  Review Trend
                </h3>

                <p className="text-[10px] text-slate-600 mt-1">
                  Historical review scoring telemetry
                </p>
              </div>

              <div className="h-[350px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                      />

                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={10}
                      />

                      <YAxis
                        stroke="#64748b"
                        fontSize={10}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#020617',
                          border: '1px solid #1e293b',
                          borderRadius: '10px',
                          color: '#e2e8f0'
                        }}
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="score"
                        name="Review Score"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600">
                    No analytics data available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-300 mb-4">
                Complexity Distribution
              </h3>

              {filteredHistory.length === 0 ? (
                <p className="text-xs text-slate-600">
                  No review history available.
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredHistory.map((item, index) => {
                    const complexity =
                      item?.calculatedComplexity ||
                      item?.timeComplexity ||
                      'O(log N)';

                    return (
                      <div
                        key={
                          item?.id ||
                          item?._id ||
                          index
                        }
                        className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3"
                      >
                        <span className="text-xs text-slate-400">
                          Review {index + 1}
                        </span>

                        <span className="font-mono text-xs font-bold text-amber-400">
                          {complexity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================
            HISTORY TAB
        ==================================================== */}

        {activeTab === 'history' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-300">
                  Review History
                </h3>

                <p className="text-[10px] text-slate-600 mt-1">
                  Previous AI technical review records
                </p>
              </div>

              <span className="text-[10px] uppercase tracking-wider text-slate-600">
                {filteredHistory.length} Records
              </span>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-xs text-slate-600">
                  No review history available for this project.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {filteredHistory.map((item, index) => {
                  const complexity =
                    item?.calculatedComplexity ||
                    item?.timeComplexity ||
                    'O(log N)';

                  const summary =
                    item?.aiFeedback ||
                    item?.feedback ||
                    'No review summary available.';

                  const createdAt =
                    item?.createdAt ||
                    item?.timestamp ||
                    item?.date;

                  return (
                    <div
                      key={
                        item?.id ||
                        item?._id ||
                        index
                      }
                      className="p-5 hover:bg-slate-950/60 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-600">
                              Review #{index + 1}
                            </span>

                            <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-[9px] font-mono font-bold">
                              {complexity}
                            </span>

                            <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-500 text-[9px] font-bold">
                              {item?.language ||
                                language}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 mt-3 max-w-3xl whitespace-pre-wrap">
                            {typeof summary ===
                            'string'
                              ? summary.slice(
                                  0,
                                  300
                                )
                              : JSON.stringify(
                                  summary
                                ).slice(0, 300)}
                            {typeof summary ===
                              'string' &&
                              summary.length >
                                300
                              ? '...'
                              : ''}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          {createdAt && (
                            <p className="text-[9px] text-slate-600">
                              {new Date(
                                createdAt
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="border-t border-slate-900 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[9px] uppercase tracking-[0.15em] text-slate-700">
            AI Tech Lead • Developer Intelligence Platform
          </p>

          <p className="text-[9px] text-slate-700">
            Backend: localhost:8085
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;