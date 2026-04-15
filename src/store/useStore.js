import { create } from 'zustand';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';

const useStore = create((set, get) => ({
  // Local State (kept in sync with Firebase)
  inventory: [],
  masterData: {
    categories: ['Produk Jadi', 'Bahan Baku'],
    units: ['Botol', 'ml', 'g', 'pcs', 'pack'],
    suppliers: []
  },
  orders: [],
  purchases: [],
  production: [],
  outgoing: [],
  theme: 'dark',
  loading: true,

  // Firebase Real-time Synchronization
  initFirebaseSync: () => {
    const collections = [
      { name: 'inventory', stateKey: 'inventory' },
      { name: 'orders', stateKey: 'orders' },
      { name: 'purchases', stateKey: 'purchases' },
      { name: 'production', stateKey: 'production', sortField: 'date' },
      { name: 'outgoing', stateKey: 'outgoing' }
    ];

    const unsubscribes = collections.map(({ name, stateKey, sortField }) => {
      const q = sortField 
        ? query(collection(db, name), orderBy(sortField, 'desc'))
        : collection(db, name);

      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set({ [stateKey]: data, loading: false });
      });
    });

    // Sync Master Data (one doc)
    const masterUnsub = onSnapshot(doc(db, 'settings', 'masterData'), (snapshot) => {
      if (snapshot.exists()) {
        set({ masterData: snapshot.data() });
      } else {
        // Initialize master data if it doesn't exist
        setDoc(doc(db, 'settings', 'masterData'), get().masterData);
      }
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
      masterUnsub();
    };
  },

  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    return { theme: newTheme };
  }),

  // Actions (Updated to write to Firestore)
  addOrder: async (order) => {
    // 1. Prepare inventory updates
    const batch = writeBatch(db);
    const { inventory } = get();

    order.items?.forEach(orderItem => {
      const item = inventory.find(i => i.id === orderItem.id);
      if (item) {
        const newReserved = (item.reserved || 0) + orderItem.quantity;
        batch.update(doc(db, 'inventory', item.id), { reserved: newReserved });
      }
    });

    // 2. Save Order
    const initializedOrder = {
      ...order,
      items: order.items.map(item => ({ ...item, shippedQuantity: 0 })),
      createdAt: new Date().toISOString()
    };
    
    // Remove temporary ID before saving to let Firestore generate one
    const { id, ...orderToSave } = initializedOrder;
    await addDoc(collection(db, 'orders'), orderToSave);
    await batch.commit();
  },

  updateOrderStatus: async (id, status) => {
    await updateDoc(doc(db, 'orders', id), { status });
  },

  updateOrder: async (id, updates) => {
    await updateDoc(doc(db, 'orders', id), updates);
  },

  deleteOrder: async (id) => {
    await deleteDoc(doc(db, 'orders', id));
  },

  addPurchase: async (purchase) => {
    const batch = writeBatch(db);
    const { inventory } = get();

    purchase.items?.forEach(purchaseItem => {
      const item = inventory.find(i => i.name === purchaseItem.name);
      if (item) {
        const newStock = item.stock + purchaseItem.quantity;
        let status = 'Tersedia';
        if (newStock <= 0) status = 'Habis';
        else if (newStock < 5) status = 'Menipis';
        
        batch.update(doc(db, 'inventory', item.id), { 
          stock: newStock, 
          status, 
          costPrice: purchaseItem.price || item.costPrice 
        });
      }
    });

    await addDoc(collection(db, 'purchases'), { ...purchase, createdAt: new Date().toISOString() });
    await batch.commit();
  },

  completePurchase: async (id) => {
    await updateDoc(doc(db, 'purchases', id), { status: 'Diterima' });
  },

  addProduction: async (record) => {
    const batch = writeBatch(db);
    const { inventory } = get();
    let totalCost = 0;
    
    // 1. Process Inputs
    const inputsWithCosts = record.inputs.map(input => {
      const item = inventory.find(i => i.id === input.id);
      if (item) {
        const itemCost = item.costPrice || 0;
        totalCost += itemCost * input.amount;
        const newStock = Math.max(0, item.stock - input.amount);
        
        let status = 'Tersedia';
        if (newStock <= 0) status = 'Habis';
        else if (newStock < 5) status = 'Menipis';
        
        batch.update(doc(db, 'inventory', item.id), { stock: newStock, status });
        return { ...input, unitCost: itemCost };
      }
      return input;
    });

    const finalizedRecord = { ...record, inputs: inputsWithCosts, totalCost };

    // 2. Process Outputs
    finalizedRecord.outputs.forEach(output => {
      const item = inventory.find(i => i.name.trim().toLowerCase() === output.name.trim().toLowerCase());
      const bep = output.amount > 0 ? (totalCost / output.amount) : 0;
      
      if (item) {
        const newStock = item.stock + output.amount;
        let status = 'Tersedia';
        if (newStock <= 0) status = 'Habis';
        else if (newStock < 5) status = 'Menipis';
        
        batch.update(doc(db, 'inventory', item.id), { 
          stock: newStock, 
          status, 
          costPrice: bep, 
          category: output.category || item.category 
        });
      } else {
        // Create new inventory item document
        const newId = `ITEM-${Date.now()}`;
        batch.set(doc(db, 'inventory', newId), {
          id: newId,
          name: output.name,
          category: output.category || 'Produk Jadi',
          stock: output.amount,
          reserved: 0,
          unit: output.unit,
          costPrice: bep,
          price: 0,
          status: output.amount > 0 ? 'Tersedia' : 'Habis'
        });
      }
      finalizedRecord.bep = bep;
    });

    // Remove temp id
    const { id, ...prodToSave } = finalizedRecord;
    await addDoc(collection(db, 'production'), prodToSave);
    await batch.commit();
  },

  deleteProduction: async (id) => {
    const { production, inventory } = get();
    const record = production.find(p => p.id === id);
    if (!record) return;

    const batch = writeBatch(db);

    // Revert Stocks
    record.inputs.forEach(input => {
      const item = inventory.find(i => i.id === input.id);
      if (item) {
        const newStock = item.stock + input.amount;
        let status = 'Tersedia';
        if (newStock <= 0) status = 'Habis';
        else if (newStock < 5) status = 'Menipis';
        batch.update(doc(db, 'inventory', item.id), { stock: newStock, status });
      }
    });

    record.outputs.forEach(output => {
      const item = inventory.find(i => i.name.trim().toLowerCase() === output.name.trim().toLowerCase());
      if (item) {
        const newStock = Math.max(0, item.stock - output.amount);
        let status = 'Tersedia';
        if (newStock <= 0) status = 'Habis';
        else if (newStock < 5) status = 'Menipis';
        batch.update(doc(db, 'inventory', item.id), { stock: newStock, status });
      }
    });

    batch.delete(doc(db, 'production', id));
    await batch.commit();
  },

  updateProduction: async (id, newRecord) => {
    const { deleteProduction, addProduction } = get();
    await deleteProduction(id);
    await addProduction(newRecord);
  },

  addOutgoing: async (record) => {
    const batch = writeBatch(db);
    const { inventory, orders } = get();

    // Update Inventory
    const item = inventory.find(i => i.name === record.product);
    if (item) {
      const newStock = item.stock - record.quantity;
      const newReserved = Math.max(0, (item.reserved || 0) - record.quantity);
      let status = 'Tersedia';
      if (newStock <= 0) status = 'Habis';
      else if (newStock < 5) status = 'Menipis';
      batch.update(doc(db, 'inventory', item.id), { stock: newStock, reserved: newReserved, status });
    }

    // Update Order
    const order = orders.find(o => o.id === record.orderId);
    if (order) {
      const updatedItems = order.items.map(oi => {
        if (oi.name === record.product) {
          return { ...oi, shippedQuantity: (oi.shippedQuantity || 0) + record.quantity };
        }
        return oi;
      });
      const allShipped = updatedItems.every(oi => (oi.shippedQuantity || 0) >= oi.quantity);
      batch.update(doc(db, 'orders', order.id), { 
        items: updatedItems, 
        status: allShipped ? 'Selesai' : order.status 
      });
    }

    await addDoc(collection(db, 'outgoing'), { ...record, createdAt: new Date().toISOString() });
    await batch.commit();
  },

  // Master Data Actions
  addInventoryItem: async (item) => {
    const newId = Date.now().toString();
    await setDoc(doc(db, 'inventory', newId), { ...item, id: newId, stock: 0, reserved: 0, status: 'Habis' });
  },

  updateInventoryItem: async (id, updates) => {
    await updateDoc(doc(db, 'inventory', id), updates);
  },

  deleteInventoryItem: async (id) => {
    await deleteDoc(doc(db, 'inventory', id));
  },

  addMasterItem: async (type, item) => {
    const { masterData } = get();
    const newData = {
      ...masterData,
      [type]: [...(masterData[type] || []), item]
    };
    await setDoc(doc(db, 'settings', 'masterData'), newData);
  },

  deleteMasterItem: async (type, item) => {
    const { masterData } = get();
    const newData = {
      ...masterData,
      [type]: (masterData[type] || []).filter(i => i !== item)
    };
    await setDoc(doc(db, 'settings', 'masterData'), newData);
  }
}));

export default useStore;
