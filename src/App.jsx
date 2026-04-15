import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Warehouse, 
  Factory, 
  Truck, 
  BarChart3,
  Search,
  Plus,
  Bell,
  User,
  Sun,
  Moon,
  Database
} from 'lucide-react';
import useStore from './store/useStore';
import { useEffect } from 'react';

// Components
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Purchasing from './pages/Purchasing';
import Inventory from './pages/Inventory';
import Production from './pages/Production';
import Outgoing from './pages/Outgoing';
import Reports from './pages/Reports';
import ProductManagement from './pages/ProductManagement';
import MasterData from './pages/MasterData';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    className={`btn btn-ghost flex items-center gap-4 w-full justify-start p-3 rounded-lg mb-1 ${active ? 'active-sidebar-item' : ''}`}
    onClick={onClick}
    style={{ color: active ? 'var(--primary)' : 'var(--text-muted)', background: active ? 'var(--primary-light)' : 'none' }}
  >
    <Icon size={20} />
    <span style={{ fontWeight: active ? '600' : '400' }}>{label}</span>
  </button>
);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, toggleTheme, initFirebaseSync } = useStore();
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Initialize Firebase listeners
    const unsubscribe = initFirebaseSync();
    return () => unsubscribe();
  }, [theme, initFirebaseSync]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'products': return <ProductManagement />;
      case 'orders': return <Orders />;
      case 'purchasing': return <Purchasing />;
      case 'inventory': return <Inventory />;
      case 'production': return <Production />;
      case 'outgoing': return <Outgoing />;
      case 'reports': return <Reports />;
      case 'master': return <MasterData />;
      default: return <Dashboard />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { type: 'divider' },
    { id: 'orders', label: 'Manajemen Pesanan', icon: ShoppingCart },
    { id: 'products', label: 'Input Harga Produk', icon: Package },
    { type: 'divider' },
    { id: 'production', label: 'Produksi', icon: Factory },
    { type: 'divider' },
    { id: 'inventory', label: 'Manajemen Gudang', icon: Warehouse },
    { id: 'purchasing', label: 'Input Bahan Baku', icon: Package },
    { id: 'outgoing', label: 'Pengeluaran Barang', icon: Truck },
    { type: 'divider' },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
    { id: 'master', label: 'Master Data', icon: Database },
  ];

  return (
    <div className="app-wrapper">
      {/* Sidebar */}
      <aside style={{ width: 'var(--sidebar-width)', background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div className="flex items-center gap-3 px-2" style={{ marginBottom: '3rem' }}>
          <div style={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 15L20 10L30 15L20 20L10 15Z" fill="#1E40AF" />
              <path d="M10 15V25L20 30V20L10 15Z" fill="#1D4ED8" />
              <path d="M20 20V30L30 25V15L20 20Z" fill="#2563EB" />
              <path d="M22 28L28 32V24L22 20V28Z" fill="#166534" />
              <path d="M28 32L34 28V20L28 24V32Z" fill="#22C55E" />
              <path d="M22 20L28 16L34 20L28 24L22 20Z" fill="#15803D" />
              <path d="M12 28C14 26 22 18 30 14" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M26 12L30 14L28 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#1E40AF' }}>Stok</span>
              <span style={{ color: '#22C55E' }}>Pro</span>
            </h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Smart Inventory Solutions
            </span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item, index) => (
            item.type === 'divider' ? (
              <div key={`div-${index}`} style={{ height: 1, background: 'var(--border)', margin: '1rem 0', opacity: 0.5 }}></div>
            ) : (
              <SidebarItem 
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            )
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-2">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={20} color="var(--text-muted)" />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Admin Gudang</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Business Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header style={{ height: 'var(--header-height)', marginBottom: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'between', display: 'flex' }} className="justify-between">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Minyak Essence & Fragrance Management</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="btn btn-ghost btn-icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
          {renderContent()}
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;
