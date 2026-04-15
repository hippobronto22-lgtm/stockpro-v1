import React, { useState } from 'react';
import { Package, Plus, Truck, Calendar, X, Save, Trash2, Edit3, User, ShoppingBag, Search, Tag, Wallet, Hash, ChevronRight, Clock } from 'lucide-react';
import useStore from '../store/useStore';

const Purchasing = () => {
  const { purchases, inventory, masterData, addPurchase } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    supplier: '',
    items: [{ name: '', quantity: 0, unit: '', price: 0 }]
  });

  const materialsList = (inventory || []).filter(i => i && i.category === 'Bahan Baku');

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 0, unit: '', price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (newItems[index]) {
      newItems[index][field] = value;
      
      // Auto-fill unit if existing product matches
      if (field === 'name' && value) {
        const selectedProduct = (inventory || []).find(p => p && p.name && p.name.toLowerCase() === value.toLowerCase());
        if (selectedProduct) {
          newItems[index].unit = selectedProduct.unit || '';
        }
      }
      
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotal = () => {
    return (formData.items || []).reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.supplier || !formData.items || formData.items.length === 0) {
      alert('Lengkapi data supplier dan minimal satu barang.');
      return;
    }

    const total = calculateTotal();
    const payload = {
      id: `IN-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...formData,
      total
    };

    addPurchase(payload);
    alert('Bahan baku berhasil diinput! Stok gudang telah diperbarui.');
    setIsModalOpen(false);
    setFormData({ supplier: '', items: [{ name: '', quantity: 0, unit: '', price: 0 }] });
  };

  const filteredPurchases = (purchases || []).filter(p => p && (
    (p.supplier || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.id || '').toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>Input Bahan Baku</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Kelola pencatatan barang masuk dari pemasok.</p>
        </div>
        <button className="btn btn-primary shadow-lg shadow-primary/20" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          <span>Tambah Bahan Baku</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-2">
            <Clock size={18} color="var(--primary)" />
            <h4 style={{ fontWeight: '700' }}>Riwayat Masuk Barang</h4>
          </div>
          <div style={{ position: 'relative' }}>
             <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
             <input 
              type="text" 
              placeholder="Cari transaksi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, color: 'white', fontSize: '0.875rem', width: 280 }}
            />
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Pemasok</th>
                <th>Rincian Barang</th>
                <th style={{ textAlign: 'right' }}>Total Biaya</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Belum ada riwayat pemasukan bahan baku</td></tr>
              ) : (
                filteredPurchases.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>#{p.id}</td>
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} color="var(--text-muted)" />
                        <span>{p.date}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{p.supplier}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {(p.items || []).filter(it => it).map((item, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Package size={12} color="var(--primary)" />
                            {item.name} ({item.quantity} {item.unit})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#10b981' }}>{formatCurrency(p.total || 0)}</td>
                    <td style={{ textAlign: 'center' }}>
                       <button 
                         className="btn btn-ghost btn-icon" 
                         title="Lihat Detail Transaksi"
                         onClick={() => {
                           setSelectedPurchase(p);
                           setIsPreviewOpen(true);
                         }}
                       >
                          <Search size={16} />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Overhauled Modal Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
           <div className="card" style={{ width: '100%', maxWidth: 900, maxHeight: '92vh', overflowY: 'auto', animation: 'slideUp 0.3s ease', padding: 0, border: '1px solid var(--border)' }}>
              
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Tambah Bahan Baku</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Catat penerimaan stok dan biaya dari pemasok.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)', padding: '0.5rem' }} className="btn btn-ghost btn-icon"><X size={24} /></button>
              </div>

              <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
                 {/* Supplier Selection */}
                 <div className="form-group" style={{ maxWidth: 400, marginBottom: '2rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Pilih Supplier</label>
                    <select 
                      className="form-input" 
                      required
                      value={formData.supplier || ''}
                      onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    >
                      <option value="">Pilih Supplier...</option>
                      {(masterData.suppliers || []).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                 </div>

                 {/* Items Table-like Header */}
                 <div style={{ background: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: '8px 8px 0 0', border: '1px solid var(--border)', borderBottom: 'none', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 40px', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Nama Bahan / Barang</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Jumlah</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Satuan</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Harga Satuan</span>
                    <span></span>
                 </div>

                 {/* Items List */}
                 <div style={{ border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                    {formData.items.map((item, index) => (
                      <div key={index} style={{ padding: '0.75rem 1rem', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', borderBottom: index === formData.items.length - 1 ? 'none' : '1px solid var(--border)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 40px', gap: '1rem', alignItems: 'center' }}>
                         <input 
                           type="text"
                           className="form-input"
                           placeholder="Ketik nama bahan..."
                           required
                           list="material-suggestions"
                           value={item.name || ''}
                           onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                           style={{ padding: '0.5rem 0.75rem' }}
                         />
                         <input 
                           type="number" 
                           className="form-input" 
                           required
                           min="1"
                           value={item.quantity || 0}
                           onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                           style={{ padding: '0.5rem 0.75rem' }}
                         />
                         <select 
                           className="form-input"
                           required
                           value={item.unit || ''}
                           onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                           style={{ padding: '0.5rem 0.75rem' }}
                         >
                            <option value="">Pilih...</option>
                            {(masterData.units || []).map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                         </select>
                         <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rp</span>
                            <input 
                              type="number" 
                              className="form-input" 
                              required
                              min="0"
                              value={item.price || 0}
                              onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                              style={{ padding: '0.5rem 0.75rem 0.5rem 1.75rem' }}
                            />
                         </div>
                         <button type="button" className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)', padding: 0 }} onClick={() => handleRemoveItem(index)}>
                            <Trash2 size={18} />
                         </button>
                      </div>
                    ))}
                 </div>

                 <button type="button" className="btn btn-ghost" onClick={handleAddItem} style={{ color: 'var(--primary)', marginBottom: '2rem' }}>
                    <Plus size={18} />
                    <span>Tambah Baris Bahan</span>
                 </button>

                 {/* Footer / Summary */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ textAlign: 'right', flex: 1, marginRight: '2rem' }}>
                       <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '1rem' }}>Total Estimasi Biaya:</span>
                       <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>{formatCurrency(calculateTotal())}</span>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                       <Save size={20} />
                       <span>Simpan & Update Stok</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Datalist */}
      <datalist id="material-suggestions">
         {materialsList.map(m => (
           m && <option key={m.id} value={m.name} />
         ))}
      </datalist>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Purchasing;
