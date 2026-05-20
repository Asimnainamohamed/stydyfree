import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ session, loading }) {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400" />
      </div>
    );
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
