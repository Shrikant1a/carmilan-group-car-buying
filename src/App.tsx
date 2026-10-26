import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dataService } from './services/dataService';
import { CarBrand, CarModel, BuyerGroup } from './types';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { BrowseCarsPage } from './pages/public/BrowseCarsPage';
import { BuyerGroupsPage } from './pages/public/BuyerGroupsPage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { DealersInfoPage } from './pages/public/DealersInfoPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';
import { AuthPage } from './pages/public/AuthPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Buyer Pages
import { GroupDetailsPage } from './pages/buyer/GroupDetailsPage';
import { CompareOffersPage } from './pages/buyer/CompareOffersPage';
import { CreateGroupPage } from './pages/buyer/CreateGroupPage';
import { BuyerDashboardPage } from './pages/buyer/BuyerDashboardPage';
import { CarDetailsPage } from './pages/buyer/CarDetailsPage';
import { ProfilePage } from './pages/buyer/ProfilePage';


// Dealer & Admin Pages
import { DealerDashboardPage } from './pages/dealer/DealerDashboardPage';
import { DealershipVerificationPage } from './pages/dealer/DealershipVerificationPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { SubmitQuotationModal } from './components/dealer/SubmitQuotationModal';

function MainApp() {
  const { user, role, sessionLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [groups, setGroups] = useState<BuyerGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global submit quotation modal trigger for dealers
  const [quoteGroup, setQuoteGroup] = useState<BuyerGroup | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [b, m, g] = await Promise.all([
      dataService.getCarBrands(),
      dataService.getCarModels(),
      dataService.getBuyerGroups(),
    ]);
    setBrands(b);
    setModels(m);
    setGroups(g);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (sessionLoading) return;

    // 1. Unauthenticated users trying to access protected routes redirect to /login
    const protectedPrefixes = [
      '/dashboard',
      '/buyer',
      '/dealer',
      '/profile',
      '/groups/new',
    ];

    const isProtected = protectedPrefixes.some(
      prefix => currentPath === prefix || currentPath.startsWith(prefix + '/')
    );

    if (isProtected && !user) {
      if (window.location.pathname !== '/login') {
        window.history.pushState({}, '', '/login');
      }
      setCurrentPath('/login');
      return;
    }

    // 2. Unauthenticated admin route access
    if (currentPath.startsWith('/admin') && currentPath !== '/admin/login' && !user) {
      if (window.location.pathname !== '/admin/login') {
        window.history.pushState({}, '', '/admin/login');
      }
      setCurrentPath('/admin/login');
      return;
    }

    // 3. /dashboard redirect based on authenticated user's role
    if (currentPath === '/dashboard' && user) {
      const target = user.role === 'admin' 
        ? '/admin/dashboard' 
        : user.role === 'dealer' 
          ? '/dealer/dashboard' 
          : '/buyer/dashboard';
      if (window.location.pathname !== target) {
        window.history.pushState({}, '', target);
      }
      setCurrentPath(target);
      return;
    }

    // 4. Role isolation: Buyer trying to access dealer route
    if (user && user.role === 'buyer' && currentPath.startsWith('/dealer')) {
      if (window.location.pathname !== '/buyer/dashboard') {
        window.history.pushState({}, '', '/buyer/dashboard');
      }
      setCurrentPath('/buyer/dashboard');
      return;
    }

    // 5. Role isolation: Dealer trying to access buyer group creation
    if (user && user.role === 'dealer' && (currentPath === '/groups/new' || currentPath.startsWith('/buyer'))) {
      if (window.location.pathname !== '/dealer/dashboard') {
        window.history.pushState({}, '', '/dealer/dashboard');
      }
      setCurrentPath('/dealer/dashboard');
      return;
    }
  }, [currentPath, user, sessionLoading]);

  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching helpers
  const isGroupDetails = currentPath.startsWith('/groups/') && currentPath !== '/groups/new';
  const groupId = isGroupDetails ? currentPath.replace('/groups/', '') : '';

  const isCompareOffers = currentPath.startsWith('/offers/');
  const compareGroupId = isCompareOffers ? currentPath.replace('/offers/', '') : '';

  const isCarDetails = currentPath.startsWith('/cars/') && currentPath !== '/cars';
  const carModelId = isCarDetails ? currentPath.replace('/cars/', '') : '';

  // Render current view
  const renderCurrentPage = () => {
    if (currentPath === '/') {
      return (
        <LandingPage
          models={models}
          groups={groups}
          onNavigate={navigateTo}
          onSelectModel={id => navigateTo(`/cars/${id}`)}
          onSelectGroup={id => navigateTo(`/groups/${id}`)}
        />
      );
    }

    if (currentPath === '/cars') {
      return (
        <BrowseCarsPage
          brands={brands}
          models={models}
          groups={groups}
          onSelectModel={id => navigateTo(`/cars/${id}`)}
          onExploreGroups={id => navigateTo(`/groups?modelId=${id}`)}
          onNavigate={navigateTo}
        />
      );
    }

    if (isCarDetails && carModelId) {
      return (
        <CarDetailsPage
          modelId={carModelId}
          onNavigate={navigateTo}
          onSelectGroup={id => navigateTo(`/groups/${id}`)}
        />
      );
    }

    if (currentPath === '/groups') {
      return (
        <BuyerGroupsPage
          groups={groups}
          onSelectGroup={id => navigateTo(`/groups/${id}`)}
          onNavigate={navigateTo}
        />
      );
    }

    if (currentPath === '/groups/new') {
      if (!user) {
        return <AuthPage initialMode="login" onNavigate={navigateTo} />;
      }
      return (
        <CreateGroupPage
          models={models}
          onNavigate={navigateTo}
          onGroupCreated={newId => {
            loadData();
            navigateTo(`/groups/${newId}`);
          }}
        />
      );
    }

    if (isGroupDetails && groupId) {
      return (
        <GroupDetailsPage
          groupId={groupId}
          onNavigate={navigateTo}
          onOpenSubmitQuote={async gId => {
            const grp = await dataService.getBuyerGroupById(gId);
            if (grp) setQuoteGroup(grp);
          }}
        />
      );
    }

    if (isCompareOffers && compareGroupId) {
      return (
        <CompareOffersPage
          groupId={compareGroupId}
          onNavigate={navigateTo}
        />
      );
    }

    if (currentPath === '/dashboard') {
      if (!user) {
        return <AuthPage initialMode="login" onNavigate={navigateTo} />;
      }
      if (role === 'dealer') {
        return (
          <DealerDashboardPage
            onNavigate={navigateTo}
            onSelectGroup={id => navigateTo(`/groups/${id}`)}
          />
        );
      }
      if (role === 'admin') {
        return (
          <AdminDashboardPage
            onNavigate={navigateTo}
            onSelectGroup={id => navigateTo(`/groups/${id}`)}
          />
        );
      }
      return (
        <BuyerDashboardPage
          onNavigate={navigateTo}
          onSelectGroup={id => navigateTo(`/groups/${id}`)}
          onSelectModel={id => navigateTo(`/cars/${id}`)}
        />
      );
    }

    if (currentPath === '/buyer/dashboard' || currentPath === '/buyer/saved') {
      if (!user) {
        return <AuthPage initialMode="login" onNavigate={navigateTo} />;
      }
      return (
        <BuyerDashboardPage
          onNavigate={navigateTo}
          onSelectGroup={id => navigateTo(`/groups/${id}`)}
          onSelectModel={id => navigateTo(`/cars/${id}`)}
        />
      );
    }

    if (currentPath === '/profile') {
      if (!user) {
        return <AuthPage initialMode="login" onNavigate={navigateTo} />;
      }
      return <ProfilePage onNavigate={navigateTo} />;
    }

    if (currentPath === '/dealer/dashboard' || currentPath === '/dealer/requests') {
      if (!user) {
        return <AuthPage initialMode="login" onNavigate={navigateTo} />;
      }
      return (
        <DealerDashboardPage
          onNavigate={navigateTo}
          onSelectGroup={id => navigateTo(`/groups/${id}`)}
        />
      );
    }

    if (currentPath === '/dealer/verification') {
      if (!user) {
        return <AuthPage initialMode="login" onNavigate={navigateTo} />;
      }
      return <DealershipVerificationPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/admin/login') {
      return <AdminLoginPage onNavigate={navigateTo} />;
    }

    if (currentPath.startsWith('/admin')) {
      if (!user) {
        return <AdminLoginPage onNavigate={navigateTo} />;
      }
      return (
        <AdminDashboardPage
          onNavigate={navigateTo}
          onSelectGroup={id => navigateTo(`/groups/${id}`)}
        />
      );
    }

    if (currentPath === '/how-it-works') {
      return <HowItWorksPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/dealers-info') {
      return <DealersInfoPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage onNavigate={navigateTo} />;
    }

    if (currentPath === '/privacy') {
      return <PrivacyPolicyPage />;
    }

    if (currentPath === '/terms') {
      return <TermsPage />;
    }

    if (currentPath === '/login') {
      return <AuthPage initialMode="login" onNavigate={navigateTo} />;
    }

    if (currentPath === '/register') {
      return <AuthPage initialMode="register" onNavigate={navigateTo} />;
    }

    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage onNavigate={navigateTo} />;
    }

    // Default fallback to LandingPage
    return (
      <LandingPage
        models={models}
        groups={groups}
        onNavigate={navigateTo}
        onSelectModel={id => navigateTo(`/cars/${id}`)}
        onSelectGroup={id => navigateTo(`/groups/${id}`)}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Main Navbar */}
      <Navbar currentPath={currentPath} onNavigate={navigateTo} />

      {/* Page Content */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Global Dealer Submit Quote Modal */}
      {quoteGroup && (
        <SubmitQuotationModal
          group={quoteGroup}
          isOpen={Boolean(quoteGroup)}
          onClose={() => setQuoteGroup(null)}
          onSuccess={() => {
            alert('Quotation submitted successfully!');
            loadData();
          }}
        />
      )}

      {/* Footer */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
