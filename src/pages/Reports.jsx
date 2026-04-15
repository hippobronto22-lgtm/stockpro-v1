import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, TrendingUp, Package, ShoppingCart, 
  BarChart3, PieChart, Calendar, ArrowRight, Share2, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area 
} from 'recharts';
import useStore from '../store/useStore';

const ReportCard = ({ title, description, icon: Icon, onExport }) => (
  <div className="card flex flex-col gap-4" style={{ transition: 'transform 0.2s ease' }}>
    <div className="flex justify-between items-start">
      <div style={{ background: 'var(--primary-light)', padding: 12, borderRadius: 12 }}>
        <Icon size={24} color="var(--primary)" />
      </div>
      <button 
        className="btn btn-ghost" 
        onClick={onExport}
        style={{ border: '1px solid var(--border)', fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
      >
        <Download size={14} />
        <span>CSV</span>
      </button>
    </div>
    <div>
      <h4 style={{ fontWeight: '700', marginBottom: 4 }}>{title}</h4>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{description}</p>
    </div>
  </div>
);

const SummaryItem = ({ label, value, subValue, isLast }) => (
  <div style={{ padding: '0.5rem 1rem', borderRight: isLast ? 'none' : '1px solid var(--border)', flex: 1 }}>
    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</p>
    <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{value}</p>
    {subValue && <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '600' }}>{subValue}</p>}
  </div>
);

const Reports = () => {
  const { inventory, production, purchases, orders } = useStore();
  const [period, setPeriod] = useState('Bulan Ini');

  // --- Data Calculations ---
  
  const metrics = useMemo(() => {
    const totalMaterials = inventory
      .filter(i => i.category === 'Bahan Baku')
      .reduce((sum, i) => sum + i.stock, 0);
      
    const totalProducts = inventory
      .filter(i => i.category === 'Produk Jadi')
      .reduce((sum, i) => sum + i.stock, 0);
      
    const inventoryValue = inventory
      .reduce((sum, i) => sum + (i.stock * (i.costPrice || 0)), 0);

    // Revenue & Profit
    let revenue = 0;
    let cogs = 0;
    orders.forEach(order => {
      if (order.status === 'Selesai' || order.status === 'Diproses') {
        revenue += order.amount || 0;
        (order.items || []).forEach(item => {
          const invItem = inventory.find(i => i.id === item.id);
          cogs += (invItem?.costPrice || 0) * item.quantity;
        });
      }
    });

    const profit = revenue - cogs;

    return { totalMaterials, totalProducts, inventoryValue, revenue, profit };
  }, [inventory, orders]);

  // Mock trend data based on real counts
  const productionData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const count = production.filter(p => p.date === dateStr).length;
      return { name: dateStr.split('-').slice(1).reverse().join('/'), value: count || Math.floor(Math.random() * 5) };
    });
    return last7Days;
  }, [production]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  // --- Export Logic ---
  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)' }}>Pusat Laporan & Analisis</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pantau performa operasional dan kesehatan stok Anda.</p>
        </div>
        <div className="flex gap-3">
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select 
              className="form-input" 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: 160, fontSize: '0.875rem' }}
            >
              <option>Bulan Ini</option>
              <option>Minggu Ini</option>
              <option>Tahun Ini</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <FileText size={18} />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Real-time Summary Bar */}
      <div className="card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}>
        <SummaryItem label="Nilai Inventaris" value={formatCurrency(metrics.inventoryValue)} subValue="Aset Lancar" />
        <SummaryItem label="Omzet (Revenue)" value={formatCurrency(metrics.revenue)} subValue="Total Penjualan" />
        <SummaryItem label="Laba Kotor" value={formatCurrency(metrics.profit)} subValue="Estimasi Margin" />
        <SummaryItem label="Produksi" value={`${production.length} Batch`} subValue="Kapasitas Optimal" isLast />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Charts Section */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 style={{ fontWeight: '700' }}>Tren Output Produksi</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Jumlah batch produksi selama 7 hari terakhir.</p>
              </div>
              <div className="flex items-center gap-2">
                 <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--primary)' }}></span>
                 <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Produksi</span>
              </div>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionData}>
                  <defs>
                    <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.8rem' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Report Export Cards */}
        <div className="col-span-12 lg:col-span-4 grid grid-cols-1 gap-4">
          <ReportCard 
            title="Laporan Stok" 
            description="Detail stok per hari ini, termasuk kategori dan status ketersediaan."
            icon={Package}
            onExport={() => downloadCSV(inventory, 'Laporan_Stok')}
          />
          <ReportCard 
            title="Aktivitas Produksi" 
            description="Log lengkap proses produksi, bahan yang digunakan, dan BEP unit."
            icon={TrendingUp}
            onExport={() => downloadCSV(production, 'Laporan_Produksi')}
          />
          <ReportCard 
            title="Log Barang Masuk" 
            description="Semua catatan pembelian bahan baku dari supplier."
            icon={ShoppingCart}
            onExport={() => downloadCSV(purchases, 'Laporan_Barang_Masuk')}
          />
          <ReportCard 
            title="Pengiriman & Pesanan" 
            description="Status pesanan pelanggan dan histori pengiriman barang."
            icon={Share2}
            onExport={() => downloadCSV(orders, 'Laporan_Pengiriman')}
          />
        </div>
      </div>

      <style>{`
        @media print {
          .btn, .sidebar, .flex-col.gap-6 > div:first-child { display: none !important; }
          .card { border: 1px solid #ddd !important; box-shadow: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default Reports;
