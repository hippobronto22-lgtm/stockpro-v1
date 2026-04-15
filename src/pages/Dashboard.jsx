import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { 
  ShoppingBag, 
  Activity, 
  PackageCheck, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import useStore from '../store/useStore';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="card stat-card">
    <div className="flex justify-between items-start mb-2">
      <div style={{ background: `${color}20`, padding: 10, borderRadius: 12 }}>
        <Icon size={24} color={color} />
      </div>
      <div className="flex items-center gap-1" style={{ color: trend > 0 ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: '600' }}>
        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(trend)}%
      </div>
    </div>
    <div className="value">{value}</div>
    <div className="label">{title}</div>
  </div>
);

const Dashboard = () => {
  const { inventory, orders, production, purchases } = useStore();

  // Dynamic Data for "Aktivitas Produksi" (Last 7 Days)
  const dataProduksi = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = production.filter(p => p.date === dateStr).length;
      return { 
        name: d.toLocaleDateString('id-ID', { weekday: 'short' }), 
        hasil: count 
      };
    });
  }, [production]);

  // Dynamic Data for "Pergerakan Stok" (Current Stock of Top 7 Products)
  const dataStok = useMemo(() => {
    return inventory
      .slice(0, 7)
      .map(item => ({
        name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
        stok: item.stock
      }));
  }, [inventory]);
  
  const totalOrders = orders.length;
  // Calculate active production as production in the last 7 days for a more dynamic feel
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const activeProduction = production.filter(p => new Date(p.date) >= sevenDaysAgo).length;

  const availableStock = inventory.filter(i => i.stock > 0).length;
  const lowStock = inventory.filter(i => i.status === 'Menipis').length;

  // Financial Analytics
  const { totalRevenue, totalCOGS } = useMemo(() => {
    let rev = 0;
    let cogs = 0;
    orders.forEach(order => {
      if (order.status === 'Selesai' || order.status === 'Diproses') {
        rev += order.amount || 0;
        (order.items || []).forEach(item => {
          const invItem = inventory.find(i => i.id === item.id);
          cogs += (invItem?.costPrice || 0) * item.quantity;
        });
      }
    });
    return { totalRevenue: rev, totalCOGS: cogs };
  }, [orders, inventory]);

  const grossProfit = totalRevenue - totalCOGS;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  // Combine all activities for the recent feed
  const recentActivities = useMemo(() => {
    return [
      ...orders.map(o => ({ 
        id: o.id, 
        text: `Pesanan Baru #${o.id} dari ${o.customer}`, 
        date: o.date, 
        category: 'Pesanan', 
        status: o.status,
        timestamp: new Date(o.date).getTime()
      })),
      ...production.map(p => ({ 
        id: p.id, 
        text: `Produksi BATCH-${p.batchId} Selesai (${p.outputs[0]?.amount} ${p.outputs[0]?.unit} ${p.outputs[0]?.name})`, 
        date: p.date, 
        category: 'Produksi', 
        status: 'Selesai',
        timestamp: new Date(p.date).getTime()
      })),
      ...purchases.map(pur => ({ 
        id: pur.id, 
        text: `Barang Masuk dari ${pur.supplier} (#${pur.id})`, 
        date: pur.date, 
        category: 'Stok', 
        status: 'Diterima',
        timestamp: new Date(pur.date).getTime()
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  }, [orders, production, purchases]);

  const getStatusBadge = (category, status) => {
    if (category === 'Pesanan') {
      if (status === 'Selesai') return <span className="badge badge-success">Selesai</span>;
      if (status === 'Diproses') return <span className="badge badge-info">Diproses</span>;
      return <span className="badge badge-warning">{status}</span>;
    }
    if (category === 'Produksi') return <span className="badge badge-success">Selesai</span>;
    if (category === 'Stok') return <span className="badge badge-info">Diterima</span>;
    return <span className="badge badge-info">{status}</span>;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Grid */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard title="Omzet (Revenue)" value={formatCurrency(totalRevenue)} icon={ShoppingBag} trend={12} color="#3b82f6" />
        <StatCard title="Estimasi Laba Kotor" value={formatCurrency(grossProfit)} icon={TrendingUp} trend={8} color="#10b981" />
        <StatCard title="Produksi (7 Hari)" value={activeProduction} icon={Activity} trend={5} color="#8b5cf6" />
        <StatCard title="Stok Menipis" value={lowStock} icon={AlertTriangle} trend={15} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Charts */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '600' }}>Pergerakan Stok</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataStok}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line type="monotone" dataKey="stok" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '600' }}>Aktivitas Produksi</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataProduksi}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="hasil" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', fontWeight: '600' }}>Aktivitas Terbaru</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Aktivitas</th>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivities.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada aktivitas terbaru</td></tr>
              ) : (
                recentActivities.map(activity => (
                  <tr key={activity.id}>
                    <td style={{ fontWeight: '500' }}>{activity.text}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{activity.date}</td>
                    <td>{activity.category}</td>
                    <td>{getStatusBadge(activity.category, activity.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  );
};

export default Dashboard;
