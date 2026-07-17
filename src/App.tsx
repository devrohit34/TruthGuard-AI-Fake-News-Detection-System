import { AuthProvider } from './lib/auth';
import { RouterProvider, useRouter } from './lib/router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DetectPage from './pages/DetectPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function Routes() {
  const { route } = useRouter();
  const path = route.path.split('?')[0];

  const page = (() => {
    switch (path) {
      case '/': return <HomePage />;
      case '/detect': return <DetectPage />;
      case '/history': return <HistoryPage />;
      case '/admin': return <AdminPage />;
      case '/about': return <AboutPage />;
      case '/contact': return <ContactPage />;
      case '/login': return <LoginPage />;
      case '/register': return <RegisterPage />;
      default: return <HomePage />;
    }
  })();

  const hideChrome = path === '/login' || path === '/register';

  return (
    <div className="flex min-h-screen flex-col">
      {!hideChrome && <Navbar />}
      <main className="flex-1">{page}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <Routes />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
