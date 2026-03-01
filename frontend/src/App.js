import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import PlansPage from "./pages/PlansPage";
import CalculatorPage from "./pages/CalculatorPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import { Navigate } from "react-router-dom";
// Category Pages
import EletronicosPage from "./pages/EletronicosPage";
import EletrodomesticosPage from "./pages/EletrodomesticosPage";
import CasaCozinhaPage from "./pages/CasaCozinhaPage";
import VestuarioPageNew from "./pages/VestuarioPageNew";
import BelezaSaudePage from "./pages/BelezaSaudePage";
import PetsPage from "./pages/PetsPage";
import AutomotivosPage from "./pages/AutomotivosPage";
import PromoCopaPage from "./pages/PromoCopaPage";
// Legacy category pages (redirects)
import VestuarioPage from "./pages/VestuarioPage";
import GeladeirasPage from "./pages/GeladeirasPage";
import CozinhaPage from "./pages/CozinhaPage";
import LoginPage, { RegisterPage, ForgotPasswordPage, ResetPasswordPage } from "./pages/AuthPages";
import DashboardLayout, { 
    DashboardOverview, 
    DashboardFavorites, 
    DashboardAlerts, 
    DashboardSettings 
} from "./pages/DashboardPages";

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<HomePage />} />
                                <Route path="/products" element={<ProductsPage />} />
                                
                                {/* Category Routes - New Structure */}
                                <Route path="/categoria/eletronicos" element={<EletronicosPage />} />
                                <Route path="/categoria/eletrodomesticos" element={<EletrodomesticosPage />} />
                                <Route path="/categoria/casa-cozinha" element={<CasaCozinhaPage />} />
                                <Route path="/categoria/vestuario" element={<VestuarioPageNew />} />
                                <Route path="/categoria/beleza-saude" element={<BelezaSaudePage />} />
                                <Route path="/categoria/pets" element={<PetsPage />} />
                                <Route path="/categoria/automotivo" element={<AutomotivosPage />} />
                                
                                {/* Legacy routes - Keep for backwards compatibility */}
                                <Route path="/vestuario" element={<VestuarioPage />} />
                                <Route path="/geladeiras" element={<GeladeirasPage />} />
                                <Route path="/cozinha" element={<CozinhaPage />} />
                                
                                <Route path="/plans" element={<PlansPage />} />
                                <Route path="/calculator" element={<CalculatorPage />} />
                                <Route path="/termos" element={<TermsPage />} />
                                <Route path="/privacidade" element={<PrivacyPage />} />
                                
                                {/* Promo Copa Page */}
                                <Route path="/promocoes-copa" element={<PromoCopaPage />} />
                                
                                {/* Redirect old offers routes to home */}
                                <Route path="/ofertas-amazon" element={<Navigate to="/" replace />} />
                                <Route path="/ofertas" element={<Navigate to="/" replace />} />
                                
                                {/* Auth Routes */}
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/reset-password" element={<ResetPasswordPage />} />
                                
                                {/* Dashboard Routes */}
                                <Route path="/dashboard" element={<DashboardLayout />}>
                                    <Route index element={<DashboardOverview />} />
                                    <Route path="favorites" element={<DashboardFavorites />} />
                                    <Route path="alerts" element={<DashboardAlerts />} />
                                    <Route path="settings" element={<DashboardSettings />} />
                                </Route>
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                    <Toaster position="top-right" richColors />
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
