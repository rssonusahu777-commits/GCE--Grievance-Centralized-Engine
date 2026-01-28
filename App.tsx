
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import GrievanceForm from './components/GrievanceForm';
import GrievanceList from './components/GrievanceList';
import Dashboard from './components/Dashboard';
import KYCVerification from './components/KYCVerification';
import LandingPage from './components/LandingPage';
import GrievanceTracker from './components/GrievanceTracker';
import AdminDashboard from './components/AdminDashboard';
import PublicFeed from './components/PublicFeed';
import UserProfile from './components/UserProfile';
import { User, UserRole, KYCStatus } from './types';
import { ArrowLeft, Users, Loader2 } from 'lucide-react';
import './services/i18n'; 
import { WATERMARK_TEXT } from './constants';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing'); 
  const [isLoading, setIsLoading] = useState(true);

  // --- Logic 1: Auth Persistence & Splash Screen ---
  useEffect(() => {
    const checkAuth = async () => {
      // Simulate checking Firebase Auth State
      const storedUser = localStorage.getItem('gce_user');
      
      // Simulate network delay for Splash Screen effect
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        handleRedirect(parsedUser);
      } else {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // --- Logic 2: Smart Redirection ---
  const handleRedirect = (loggedInUser: User) => {
    if (loggedInUser.role === UserRole.ADMIN) {
        setCurrentView('admin-dashboard');
    } else if (loggedInUser.role === UserRole.OFFICER) {
        setCurrentView('dashboard');
    } else if (loggedInUser.role === UserRole.CITIZEN) {
        if (loggedInUser.kycStatus === KYCStatus.VERIFIED) {
            // Citizen Verified -> Grievance Profile
            setCurrentView('new-grievance');
        } else {
            // Citizen Not Verified -> KYC
            setCurrentView('kyc');
        }
    }
    setIsLoading(false);
  };

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem('gce_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    handleRedirect(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('gce_user');
    setUser(null);
    setCurrentView('landing');
  };

  const handleKYCVerified = (updatedUser: User) => {
    localStorage.setItem('gce_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setCurrentView('new-grievance');
  };

  // --- Visual 3: Splash Screen ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-navyBlue flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <h1 className="text-[25vw] font-black text-white opacity-[0.05] animate-pulse">{WATERMARK_TEXT}</h1>
            </div>
            <div className="z-10 text-center">
                <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-white text-2xl font-bold tracking-widest">GCE</h2>
                <p className="text-blue-200 text-sm mt-2">Authenticating Secure Node...</p>
            </div>
        </div>
    );
  }

  const renderContent = () => {
    // Unauthenticated Views
    if (!user) {
      if (currentView === 'landing') {
        return <LandingPage 
            onLogin={() => setCurrentView('login')} 
            onTrack={() => setCurrentView('tracking')}
            onViewFeed={() => setCurrentView('community')}
        />;
      }
      if (currentView === 'login') {
        return <Login onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
      }
      if (currentView === 'tracking') {
        return <GrievanceTracker onBack={() => setCurrentView('landing')} />;
      }
      if (currentView === 'community') {
        return (
            <div className="min-h-screen bg-softWhite">
                 <header className="bg-navyBlue p-4 shadow-md sticky top-0 z-50">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-white">
                             <Users size={24} className="text-saffron" />
                             <span className="font-bold text-xl tracking-tight">GCE Community</span>
                        </div>
                        <button 
                            onClick={() => setCurrentView('landing')} 
                            className="flex items-center space-x-2 text-white/80 hover:text-white text-sm font-bold bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span>Home</span>
                        </button>
                    </div>
                </header>
                <div className="max-w-4xl mx-auto p-4 md:p-8">
                    <PublicFeed user={null} />
                </div>
            </div>
        );
      }
      return <Login onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
    }

    // Authenticated Views (Wrapped in Layout)
    switch (currentView) {
      case 'dashboard':
        return user.role !== UserRole.CITIZEN ? (
          <Dashboard user={user} />
        ) : (
          <div className="text-center p-10">Access Denied</div>
        );
      case 'admin-dashboard':
        return user.role === UserRole.ADMIN ? (
            <AdminDashboard />
        ) : (
            <div className="text-center p-10">Restricted Access</div>
        );
      case 'kyc':
        return (
          <KYCVerification 
            user={user} 
            onVerified={handleKYCVerified}
            onSkip={() => setCurrentView('new-grievance')}
          />
        );
      case 'new-grievance':
        return (
          <GrievanceForm 
            user={user} 
            onSuccess={() => setCurrentView('list')} 
          />
        );
      case 'list':
        return <GrievanceList user={user} />;
      case 'community':
        return <PublicFeed user={user} />;
      case 'tracking':
        return <GrievanceTracker onBack={() => setCurrentView('new-grievance')} />;
      case 'profile':
        return <UserProfile user={user} onLogout={handleLogout} onBack={() => setCurrentView('list')} />;
      default:
        return <GrievanceList user={user} />;
    }
  };

  if (user) {
    return (
      <Layout 
        user={user} 
        onLogout={handleLogout} 
        currentView={currentView} 
        onChangeView={setCurrentView}
      >
        {renderContent()}
      </Layout>
    );
  }

  return renderContent();
}

export default App;
