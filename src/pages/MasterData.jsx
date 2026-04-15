import React, { useState } from 'react';
import { Plus, Trash2, Tag, Ruler, Database, Users } from 'lucide-react';
import useStore from '../store/useStore';

const MasterData = () => {
  const { masterData, addMasterItem, deleteMasterItem } = useStore();
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newSupplier, setNewSupplier] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory) {
      addMasterItem('categories', newCategory);
      setNewCategory('');
    }
  };

  const handleAddUnit = (e) => {
    e.preventDefault();
    if (newUnit) {
      addMasterItem('units', newUnit);
      setNewUnit('');
    }
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (newSupplier) {
      addMasterItem('suppliers', newSupplier);
      setNewSupplier('');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Pengaturan Master Data</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Kelola daftar pilihan kategori, satuan, dan supplier untuk seluruh aplikasi.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Kategori */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ background: 'var(--primary-light)', padding: 10, borderRadius: 10 }}>
              <Tag size={20} color="var(--primary)" />
            </div>
            <h4 style={{ fontWeight: '700' }}>Kategori Produk</h4>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input 
              type="text" 
              className="form-input" 
              placeholder="Tambah kategori..." 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <Plus size={18} />
            </button>
          </form>

          <div className="table-container" style={{ marginTop: 0, maxHeight: 400, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Nama Kategori</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {masterData.categories.map((cat, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '500' }}>{cat}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteMasterItem('categories', cat)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Satuan */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: 10, borderRadius: 10 }}>
              <Ruler size={20} color="#3b82f6" />
            </div>
            <h4 style={{ fontWeight: '700' }}>Daftar Satuan</h4>
          </div>

          <form onSubmit={handleAddUnit} className="flex gap-2 mb-6">
            <input 
              type="text" 
              className="form-input" 
              placeholder="Tambah satuan..." 
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ background: '#3b82f6' }}>
              <Plus size={18} />
            </button>
          </form>

          <div className="table-container" style={{ marginTop: 0, maxHeight: 400, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Nama Satuan</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {masterData.units.map((unit, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '500' }}>{unit}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteMasterItem('units', unit)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supplier */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 10, borderRadius: 10 }}>
              <Users size={20} color="#10b981" />
            </div>
            <h4 style={{ fontWeight: '700' }}>Master Supplier</h4>
          </div>

          <form onSubmit={handleAddSupplier} className="flex gap-2 mb-6">
            <input 
              type="text" 
              className="form-input" 
              placeholder="Tambah supplier baru..." 
              value={newSupplier}
              onChange={(e) => setNewSupplier(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ background: '#10b981' }}>
              <Plus size={18} />
            </button>
          </form>

          <div className="table-container" style={{ marginTop: 0, maxHeight: 400, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Nama Supplier</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {(masterData.suppliers || []).map((sup, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '500' }}>{sup}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteMasterItem('suppliers', sup)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {(masterData.suppliers || []).length === 0 && (
                  <tr><td colSpan="2" style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Belum ada data supplier</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterData;
