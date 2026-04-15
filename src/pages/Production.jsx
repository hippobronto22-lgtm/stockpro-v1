import React, { useState } from 'react';
import { Factory, Plus, Trash2, Edit3, Save, History, X, Package, Hash, Tag, CheckCircle2, Search, Clock, TrendingUp } from 'lucide-react';
import useStore from '../store/useStore';

const Production = () => {
  const { inventory, production, masterData, addProduction, deleteProduction, updateProduction } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState(null);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    outputName: '',
    outputAmount: 0,
    outputUnit: '',
    outputCategory: 'Produk Jadi',
    inputs: [{ id: '', name: '', amount: 0, unit: '', maxStock: 0 }]
  });

  const materials = inventory.filter(i => i.category === 'Bahan Baku');

  const handleAddInput = () => {
    setFormData({
      ...formData,
      inputs: [...formData.inputs, { id: '', name: '', amount: 0, unit: '', maxStock: 0 }]
    });
  };

  const handleRemoveInput = (index) => {
    const newInputs = formData.inputs.filter((_, i) => i !== index);
    setFormData({ ...formData, inputs: newInputs });
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...formData.inputs];
    
    if (field === 'id') {
      const item = materials.find(m => m.id === value);
      if (item) {
        newInputs[index] = { 
          ...newInputs[index], 
          id: item.id, 
          name: item.name, 
          unit: item.unit, 
          maxStock: item.stock 
        };
      }
    } else {
      newInputs[index][field] = value;
    }
    
    setFormData({ ...formData, inputs: newInputs });
  };

  const calculateTotalCost = () => {
    return formData.inputs.reduce((sum, input) => {
      const item = inventory.find(i => i.id === input.id);
      return sum + ((item?.costPrice || 0) * (input.amount || 0));
    }, 0);
  };

   const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    const shortIngredients = formData.inputs.filter(inp => inp.id && inp.amount > inp.maxStock);
    
    if (!formData.outputName || formData.outputAmount <= 0 || !formData.outputUnit) {
      alert('Mohon lengkapi data produk hasil produksi.');
      return;
    }

    if (formData.inputs.some(inp => !inp.id || inp.amount <= 0)) {
      alert('Mohon lengkapi data bahan baku dengan benar.');
      return;
    }

    if (shortIngredients.length > 0) {
      const names = shortIngredients.map(i => i.name).join(', ');
      alert(`Stok tidak mencukupi untuk bahan: ${names}. Silakan sesuaikan jumlah atau cek stok inventaris.`);
      return;
    }

    const payload = {
      id: editingProd ? editingProd.id : `PROD-${Date.now()}`,
      date: editingProd ? editingProd.date : new Date().toISOString().split('T')[0],
      // Batch ID remains fixed during edit, auto-generated for new records
      batchId: editingProd ? editingProd.batchId : `B-${Math.floor(Date.now() / 10000).toString().slice(-4)}`,
      inputs: formData.inputs.map(({ id, name, amount, unit }) => ({ id, name, amount, unit })),
      outputs: [{ name: formData.outputName, amount: formData.outputAmount, unit: formData.outputUnit, category: formData.outputCategory }]
    };

    if (editingProd) {
      updateProduction(editingProd.id, payload);
      alert('Produksi berhasil diperbarui! Stok telah disesuaikan ulang.');
    } else {
      addProduction(payload);
      alert('Produksi berhasil dicatat! Stok produk telah ditambahkan ke gudang.');
    }
    
    setIsModalOpen(false);
    setEditingProd(null);
    setFormData({ outputName: '', outputAmount: 0, outputUnit: '', outputCategory: 'Produk Jadi', inputs: [{ id: '', name: '', amount: 0, unit: '', maxStock: 0 }] });
  };

  const handleEdit = (item) => {
    setEditingProd(item);
    setFormData({
      outputName: item.outputs[0]?.name || '',
      outputAmount: item.outputs[0]?.amount || 0,
      outputUnit: item.outputs[0]?.unit || '',
      outputCategory: item.outputs[0]?.category || 'Produk Jadi',
      inputs: item.inputs.map(inp => {
        const invItem = inventory.find(i => i.id === inp.id);
        return {
          ...inp,
          maxStock: (invItem?.stock || 0) + inp.amount // Available = Current + Used in this batch
        };
      })
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus data produksi ini? Stok bahan baku akan dikembalikan dan stok produk akan dikurangi.')) {
      deleteProduction(id);
      alert('Data produksi telah dihapus dan stok telah disesuaikan.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>Manajemen Produksi</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Analisis biaya produksi dan efisiensi bahan baku.</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingProd(null);
          setFormData({ outputName: '', outputAmount: 0, outputUnit: '', outputCategory: 'Produk Jadi', inputs: [{ id: '', name: '', amount: 0, unit: '', maxStock: 0 }] });
          setIsModalOpen(true);
        }}>
          <Plus size={18} />
          <span>Tambah Pencatatan Produksi</span>
        </button>
      </div>

      {/* History Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-2">
            <Clock size={18} color="var(--primary)" />
            <h4 style={{ fontWeight: '700' }}>Riwayat Produksi & Biaya</h4>
          </div>
          <div style={{ position: 'relative' }}>
             <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
             <input 
              type="text" 
              placeholder="Cari Batch ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.5rem 1rem 0.5rem 2.2rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: 8, color: 'white', fontSize: '0.875rem', width: 220 }}
            />
          </div>
        </div>

        <div className="table-container" style={{ marginTop: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Tanggal</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Bahan Baku</th>
                <th>Jumlah</th>
                <th style={{ textAlign: 'right' }}>Total Biaya</th>
                <th style={{ textAlign: 'right' }}>Harga BEP</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {production.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Belum ada aktivitas produksi</td></tr>
              ) : (
                production.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.85rem' }}>#{item.batchId}</td>
                    <td style={{ fontSize: '0.85rem' }}>{item.date}</td>
                    <td>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{item.outputs[0]?.name}</span>
                    </td>
                    <td>
                      <span className={`badge ${item.outputs[0]?.category === 'Produk Jadi' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                        {item.outputs[0]?.category}
                      </span>
                    </td>
                    <td>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.inputs.map(i => i.name).join(', ')}>
                        {item.inputs.map(i => i.name).join(', ')}
                      </p>
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                      {item.outputs[0]?.amount} {item.outputs[0]?.unit}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--text-main)', fontSize: '0.85rem' }}>{formatCurrency(item.totalCost)}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: '#10b981', fontSize: '0.85rem' }}>{formatCurrency(item.bep)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="flex justify-center gap-1">
                        <button 
                          className="btn btn-ghost btn-icon" 
                          title="Lihat Detail"
                          onClick={() => {
                            setSelectedProd(item);
                            setIsPreviewOpen(true);
                          }}
                        >
                          <Package size={16} />
                        </button>
                        <button 
                          className="btn btn-ghost btn-icon" 
                          title="Edit Produksi"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit3 size={16} color="var(--primary)" />
                        </button>
                        <button 
                          className="btn btn-ghost btn-icon" 
                          title="Hapus Produksi"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={16} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Optimized Modal Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
           <div className="card" style={{ width: '100%', maxWidth: 900, maxHeight: '94vh', overflowY: 'auto', animation: 'slideUp 0.3s ease', padding: 0, border: '1px solid var(--border)' }}>
              
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{editingProd ? 'Edit Pencatatan Produksi' : 'Catat Produksi Baru'}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{editingProd ? `Memperbarui Batch #${editingProd.batchId}` : 'Proses pengolahan bahan baku menjadi produk siap jual.'}</p>
                 </div>
                 <button onClick={() => { setIsModalOpen(false); setEditingProd(null); }} style={{ color: 'var(--text-muted)' }} className="btn btn-ghost btn-icon"><X size={24} /></button>
              </div>

              <form onSubmit={handleSave} style={{ padding: '1.5rem' }}>
                 {/* Baris 1: Nama Produk & Kategori */}
                 <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="form-group mb-0">
                       <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Nama Produk yang Dihasilkan</label>
                       <input 
                         type="text" 
                         className="form-input" 
                         placeholder="Masukkan nama hasil produksi..." 
                         required 
                         list="output-suggestions"
                         value={formData.outputName}
                         onChange={(e) => setFormData({ ...formData, outputName: e.target.value })}
                       />
                       <datalist id="output-suggestions">
                          {inventory.filter(i => i.category !== 'Bahan Baku').map(g => <option key={g.id} value={g.name} />)}
                       </datalist>
                    </div>
                    <div className="form-group mb-0">
                       <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Kategori Produk</label>
                       <select 
                         className="form-input" 
                         required
                         value={formData.outputCategory}
                         onChange={(e) => setFormData({ ...formData, outputCategory: e.target.value })}
                       >
                         {masterData.categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>

                 {/* Baris 2: Bahan Baku (Bahan Baku Section) */}
                 <div className="flex justify-between items-center mb-4 px-1">
                    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)' }}>Bahan Baku yang Digunakan</span>
                    <button type="button" className="btn btn-ghost" onClick={handleAddInput} style={{ color: 'var(--primary)', fontWeight: '600' }}>
                       <Plus size={16} />
                       <span>Tambah Baris Bahan</span>
                    </button>
                 </div>

                 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 40px', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-sidebar)', border: '1px solid var(--border)', borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Material</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Jumlah Pakai</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sisa Stok</span>
                    <span></span>
                 </div>

                 <div style={{ border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', marginBottom: '2rem' }}>
                    {formData.inputs.map((input, index) => {
                      const mat = materials.find(m => m.id === input.id);
                      return (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 40px', gap: '1rem', padding: '0.75rem 1rem', alignItems: 'center', borderBottom: index === formData.inputs.length - 1 ? 'none' : '1px solid var(--border)' }}>
                           <select 
                             className="form-input" 
                             required
                             value={input.id}
                             onChange={(e) => handleInputChange(index, 'id', e.target.value)}
                             style={{ padding: '0.5rem' }}
                           >
                              <option value="">Pilih Bahan...</option>
                              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                           </select>
                           <div className="flex flex-col gap-1 w-full">
                              <div className="flex items-center gap-2">
                                 <input 
                                   type="number" 
                                   className={`form-input ${input.amount > input.maxStock ? 'border-danger' : ''}`}
                                   required 
                                   min="0.1" 
                                   step="0.01"
                                   value={input.amount}
                                   onChange={(e) => handleInputChange(index, 'amount', Number(e.target.value))}
                                   style={{ padding: '0.5rem' }}
                                 />
                                 <span style={{ fontSize: '0.8rem', minWidth: 40 }}>{input.unit}</span>
                              </div>
                              {input.id && input.amount > input.maxStock && (
                                <span style={{ color: 'var(--danger)', fontSize: '0.65rem', fontWeight: '600' }}>
                                   Stok kurang ({input.maxStock} tersedia)
                                </span>
                              )}
                           </div>
                           <span style={{ fontSize: '0.875rem', color: input.amount > input.maxStock ? 'var(--danger)' : 'var(--text-muted)', fontWeight: '600' }}>
                              {mat ? `${mat.stock} ${mat.unit}` : '-'}
                           </span>
                           <button type="button" onClick={() => handleRemoveInput(index)} style={{ color: 'var(--danger)' }}><Trash2 size={18} /></button>
                        </div>
                      );
                    })}
                 </div>

                 {/* Baris 3: Jumlah Hasil Produksi */}
                 <div className="grid grid-cols-2 gap-6 mb-8" style={{ background: 'var(--bg-sidebar)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div className="form-group mb-0">
                       <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Jumlah Hasil Produksi</label>
                       <input 
                         type="number" 
                         className="form-input" 
                         required 
                         min="0.1" 
                         step="0.01"
                         value={formData.outputAmount}
                         onChange={(e) => setFormData({ ...formData, outputAmount: Number(e.target.value) })}
                       />
                    </div>
                    <div className="form-group mb-0">
                       <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Satuan Produk</label>
                       <select 
                         className="form-input" 
                         required
                         value={formData.outputUnit}
                         onChange={(e) => setFormData({ ...formData, outputUnit: e.target.value })}
                       >
                          <option value="">-- Pilih Satuan --</option>
                          {masterData.units.map(u => <option key={u} value={u}>{u}</option>)}
                       </select>
                    </div>
                 </div>

                 {/* Financial Summary & Save */}
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <TrendingUp size={16} color="#10b981" />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimasi Biaya Produksi</span>
                       </div>
                       <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>{formatCurrency(calculateTotalCost())}</h4>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 3rem' }}>
                       <Save size={20} />
                       <span>{editingProd ? 'Perbarui Data' : 'Simpan & Update Stok'}</span>
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && selectedProd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1.5rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', animation: 'slideUp 0.3s ease', padding: 0, border: '1px solid var(--border)' }}>
             <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: '800' }}>#{selectedProd.batchId}</span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedProd.date}</span>
                   </div>
                   <h4 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Detail Riwayat Produksi</h4>
                </div>
                <button onClick={() => setIsPreviewOpen(false)} className="btn btn-ghost btn-icon"><X size={24} /></button>
             </div>

             <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                   <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>Hasil Produksi</label>
                   <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                         <h5 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.25rem' }}>{selectedProd.outputs[0]?.name}</h5>
                         <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Kategori: {selectedProd.outputs[0]?.category}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                         <h5 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>{selectedProd.outputs[0]?.amount} {selectedProd.outputs[0]?.unit}</h5>
                         <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Kuantitas</span>
                      </div>
                   </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                   <label style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>Bahan Baku yang Digunakan</label>
                   <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                      <table style={{ margin: 0 }}>
                         <thead style={{ background: 'var(--bg-sidebar)' }}>
                            <tr>
                               <th style={{ fontSize: '0.7rem' }}>Material</th>
                               <th style={{ fontSize: '0.7rem', textAlign: 'right' }}>Jumlah</th>
                               <th style={{ fontSize: '0.7rem', textAlign: 'right' }}>Biaya Satuan</th>
                               <th style={{ fontSize: '0.7rem', textAlign: 'right' }}>Subtotal</th>
                            </tr>
                         </thead>
                         <tbody>
                            {(selectedProd.inputs || []).map((input, idx) => (
                               <tr key={idx}>
                                  <td style={{ fontSize: '0.875rem', fontWeight: '600' }}>{input.name}</td>
                                  <td style={{ textAlign: 'right', fontSize: '0.875rem' }}>{input.amount} {input.unit}</td>
                                  <td style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{formatCurrency(input.unitCost)}</td>
                                  <td style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: '600' }}>{formatCurrency((input.amount || 0) * (input.unitCost || 0))}</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                   <div style={{ background: 'var(--bg-sidebar)', padding: '1rem', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Total Biaya Produksi</span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{formatCurrency(selectedProd.totalCost)}</h4>
                   </div>
                   <div style={{ background: '#10b98115', padding: '1rem', borderRadius: 12, border: '1px solid #10b98130' }}>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'block', marginBottom: '4px' }}>Harga BEP / Unit</span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>{formatCurrency(selectedProd.bep)}</h4>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .border-danger {
          border-color: var(--danger) !important;
        }
      `}</style>
    </div>
  );
};

export default Production;
