import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <style>{`
        .loading-screen { 
          height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; 
        }
        .spinner { 
          width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; 
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
  
  if (!token) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <div className="app-container">
                {/* Sidebar will go here */}
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* Add more routes as modules are built */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
