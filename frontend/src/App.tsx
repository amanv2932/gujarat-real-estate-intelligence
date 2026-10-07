import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import PropertyAnalyzer from './pages/PropertyAnalyzer';
import Valuation from './pages/Valuation';
import MarketIntelligence from './pages/MarketIntelligence';
import DevelopmentIntelligence from './pages/DevelopmentIntelligence';
import InvestmentIntelligence from './pages/InvestmentIntelligence';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="property-analyzer" element={<PropertyAnalyzer />} />
          <Route path="analyzer" element={<Navigate to="/property-analyzer" replace />} />
          <Route path="valuation" element={<Valuation />} />
          <Route path="market-intelligence" element={<MarketIntelligence />} />
          <Route path="development-intelligence" element={<DevelopmentIntelligence />} />
          <Route path="investment-intelligence" element={<InvestmentIntelligence />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
