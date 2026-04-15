import React, { useState } from 'react';
import { Package, Plus, Search, Edit3, Trash2, X, Bookmark, TrendingDown, DollarSign } from 'lucide-react';
import useStore from '../store/useStore';

const ProductManagement = () => {
  const { inventory, updateInventoryItem, deleteInventoryItem, masterData } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Produk Jadi',
    price: '', 
    unit: 'Botol',
    costPrice: 0
  });

  // Filter items that are "Produk Jadi" for management
  const managedItems = inventory.filter(i => i.category === 'Produk Jadi');
  
  const filteredItems = managedItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price || '',
        unit: item.unit,
        costPrice: item.costPrice || 0
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', category: 'Produk Jadi', price: '', unit: 'Botol', costPrice: 0 });
    }
    setIsModalOpen(true);
  };

  const handleProductSelect = (name) => {
    const product = inventory.find(i => i.name === name);
    if (product) {
      setFormData({
        ...formData,
        name: product.name,
        category: product.category,
        unit: product.unit,
        costPrice: product.costPrice || 0
      });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Pilih produk terlebih dahulu.');
      return;
    }
    const finalData = { ...formData, price: Number(formData.price) || 0 };
    updateInventoryItem(editingItem ? editingItem.id : inventory.find(i => i.name === formData.name)?.id, finalData);
    setIsModalOpen(false);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-numeric
    setFormData({ ...formData, price: value });
  };

  const formatDisplayPrice = (val) => {
    if (!val) return '';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>Input Harga Produk</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manajemen harga jual berdasarkan HPP produksi.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          <span>Tambah Harga Produk</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-3">
             <DollarSign size={20} color="var(--primary)" />
             <h4 style={{ fontWeight: '700' }}>Daftar Harga Jual</h4>
          </div>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: 300, background: 'var(--bg-main)' }}
            />
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th style={{ textAlign: 'right' }}>Harga HPP</th>
                <th style={{ textAlign: 'right' }}>Harga Jual</th>
                <th style={{ textAlign: 'center' }}>Margin</th>
                <th>Satuan</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Belum ada data produk jadi. Lakukan produksi terlebih dahulu.</td></tr>
              ) : (
                filteredItems.map(item => {
                  const margin = item.price - item.costPrice;
                  const marginPercent = item.costPrice > 0 ? ((margin / item.costPrice) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div style={{ background: 'var(--primary-light)', padding: 8, borderRadius: 8 }}>
                            <Bookmark size={18} color="var(--primary)" />
                          </div>
                          <span style={{ fontWeight: '600' }}>{item.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {item.category}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--primary)' }}>
                        {formatCurrency(item.price)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: margin > 0 ? '#10b981' : 'var(--danger)' }}>
                          {margin > 0 ? '+' : ''}{marginPercent}%
                        </span>
                      </td>
                      <td>{item.unit}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="flex justify-center gap-1">
                           <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(item)}>
                             <Edit3 size={16} color="var(--primary)" />
                           </button>
                           <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => {
                             if(confirm('Hapus harga produk ini?')) deleteInventoryItem(item.id);
                           }}>
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
           <div className="card" style={{ width: '100%', maxWidth: 500, animation: 'slideUp 0.3s ease', border: '1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{editingItem ? 'Update Harga Produk' : 'Tambah Harga Produk Baru'}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tentukan harga jual ideal berdasarkan modal HPP.</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-icon"><X size={24} /></button>
              </div>

              <form onSubmit={handleSave}>
                 <div className="form-group">
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Pilih Nama Produk</label>
                    <select 
                      className="form-input" 
                      required
                      value={formData.name}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      disabled={!!editingItem}
                      style={{ background: editingItem ? 'var(--bg-sidebar)' : 'var(--bg-main)' }}
                    >
                       <option value="">-- Pilih Produk dari Gudang --</option>
                       {managedItems.map(item => (
                         <option key={item.id} value={item.name}>{item.name}</option>
                       ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                       <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Kategori</label>
                       <input 
                         type="text" 
                         className="form-input" 
                         value={formData.category} 
                         disabled 
                         style={{ background: 'var(--bg-sidebar)', color: 'var(--text-muted)' }}
                       />
                    </div>
                    <div className="form-group">
                       <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Satuan</label>
                       <input 
                         type="text" 
                         className="form-input" 
                         value={formData.unit} 
                         disabled 
                         style={{ background: 'var(--bg-sidebar)', color: 'var(--text-muted)' }}
                       />
                    </div>
                 </div>

                 <div className="form-group" style={{ background: 'var(--bg-sidebar)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                    <div className="flex items-center gap-2 mb-2">
                       <TrendingDown size={16} color="var(--danger)" />
                       <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: 0 }}>Harga HPP Produk (Acuan Modal)</label>
                    </div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--danger)' }}>{formatCurrency(formData.costPrice)}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>*Diambil dari harga modal rata-rata saat produksi.</p>
                 </div>

                 <div className="form-group">
                    <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>Tentukan Harga Jual (Rp)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontWeight: '800', fontSize: '0.875rem' }}>Rp</span>
                      <input 
                        type="text" 
                        className="form-input" 
                        required
                        style={{ paddingLeft: '2.5rem', borderColor: 'var(--primary)', fontSize: '1.1rem', fontWeight: '700' }}
                        placeholder="Masukkan harga"
                        value={formatDisplayPrice(formData.price)}
                        onChange={handlePriceChange}
                      />
                    </div>
                 </div>

                 <div className="flex gap-3 mt-8">
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '1rem', fontWeight: '700' }}>
                       {editingItem ? 'Perbarui Harga' : 'Simpan Harga Jual'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProductManagement;
