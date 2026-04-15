import React, { useState } from 'react';
import { Package, Search, Filter, Edit3, Trash2, X } from 'lucide-react';
import useStore from '../store/useStore';

const Inventory = () => {
  const { inventory, updateInventoryItem, deleteInventoryItem, masterData } = useStore();
  const [filter, setFilter] = useState('Bahan Baku');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    price: 0
  });

  const filteredItems = inventory.filter(item => {
    const matchesFilter = filter === 'Semua' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      price: item.price || 0
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateInventoryItem(editingItem.id, formData);
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Tersedia': return <span className="badge badge-success">Tersedia</span>;
      case 'Menipis': return <span className="badge badge-warning">Menipis</span>;
      case 'Habis': return <span className="badge badge-danger">Habis</span>;
      default: return null;
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['Bahan Baku', 'Produk Jadi'].map(cat => (
            <button 
              key={cat}
              className={`btn ${filter === cat ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(cat)}
              style={{ padding: '0.5rem 1rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'between' }} className="justify-between">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Ringkasan Stok & Material</h3>
          <div className="flex gap-2">
             <div style={{ position: 'relative' }}>
               <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
               <input 
                type="text" 
                placeholder="Cari barang..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 6, color: 'white', fontSize: '0.875rem' }}
              />
             </div>
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Stok Fisik</th>
                <th>Dipesan</th>
                <th>Satuan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div style={{ background: 'var(--bg-main)', padding: 8, borderRadius: 8 }}>
                        <Package size={18} color="var(--primary)" />
                      </div>
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                    </div>
                  </td>
                  <td><span style={{ color: 'var(--text-muted)' }}>{item.category}</span></td>
                  <td style={{ fontWeight: '600' }}>{item.stock}</td>
                  <td style={{ fontWeight: '600', color: 'var(--warning)' }}>{item.reserved || 0}</td>
                  <td>{item.unit}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(item)}>
                        <Edit3 size={16} />
                      </button>
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => {
                        if(confirm('Hapus data barang ini?')) deleteInventoryItem(item.id);
                      }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal (Synchronized with Product Management style) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
           <div className="card" style={{ width: '100%', maxWidth: 500 }}>
              <div className="flex justify-between items-center mb-6">
                 <h4 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Edit Data: {editingItem?.name}</h4>
                 <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleSave}>
                 <div className="form-group">
                    <label>Nama Barang</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                       <label>Kategori</label>
                       <select 
                         className="form-input"
                         value={formData.category}
                         onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                       >
                          {masterData.categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                       </select>
                    </div>
                    <div className="form-group">
                       <label>Satuan</label>
                       <select 
                         className="form-input"
                         value={formData.unit}
                         onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                       >
                          {masterData.units.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 {formData.category === 'Produk Jadi' && (
                    <div className="form-group">
                       <label>Harga Jual (Rp)</label>
                       <input 
                         type="number" 
                         className="form-input" 
                         required
                         value={formData.price}
                         onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                       />
                    </div>
                 )}

                 <div className="flex gap-3 mt-8">
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Update Data</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
