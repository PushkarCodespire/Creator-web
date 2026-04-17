import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Package, Dumbbell, ExternalLink, Tag } from 'lucide-react';
import { programApi } from '../../services/api';

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ede8e3',
  borderRadius: 16,
  padding: 24,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #ede8e3',
  fontSize: 14, outline: 'none', background: '#fff', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase',
  letterSpacing: '0.05em', marginBottom: 4, display: 'block',
};

const FITNESS_CATEGORIES = [
  'Fat Loss', 'Muscle Gain', 'PCOS', 'Gut Health', 'Yoga', 'Nutrition',
  'Strength Training', 'Calisthenics', 'CrossFit', 'Sports Performance',
  'Mental Wellness', "Women's Fitness",
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

type _ItemType = 'product' | 'program';

const emptyProductForm = { name: '', description: '', price: '', link: '', promoCode: '', imageUrl: '' };
const emptyProgramForm = { name: '', description: '', price: '', duration: '', level: '', category: '', link: '', promoCode: '' };

const CreatorProducts = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [savingProduct, setSavingProduct] = useState(false);

  // Program form
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState(emptyProgramForm);
  const [savingProgram, setSavingProgram] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await programApi.getAll();
      setItems(res.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  // Separate products from programs by category prefix
  const products = items.filter(i => i.category === '__product__');
  const programs = items.filter(i => i.category !== '__product__');

  // ---- Product CRUD ----
  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) return;
    setSavingProduct(true);
    try {
      const data = {
        name: productForm.name,
        description: JSON.stringify({ type: 'product', link: productForm.link, promoCode: productForm.promoCode, imageUrl: productForm.imageUrl, desc: productForm.description }),
        price: parseFloat(productForm.price) || 0,
        category: '__product__',
      };
      if (editingProductId) {
        await programApi.update(editingProductId, data);
      } else {
        await programApi.create(data);
      }
      setShowProductForm(false);
      setEditingProductId(null);
      setProductForm(emptyProductForm);
      await fetchItems();
    } catch {}
    finally { setSavingProduct(false); }
  };

  const handleEditProduct = (p: { id: string; name: string; description?: string; price?: number }) => {
    let parsed: Record<string, string> = {};
    try { parsed = JSON.parse(p.description || '{}'); } catch { parsed = { desc: p.description || '' }; }
    setProductForm({
      name: p.name,
      description: parsed.desc || parsed.description || '',
      price: String(p.price || 0),
      link: parsed.link || '',
      promoCode: parsed.promoCode || '',
      imageUrl: parsed.imageUrl || '',
    });
    setEditingProductId(p.id);
    setShowProductForm(true);
  };

  // ---- Program CRUD ----
  const handleSaveProgram = async () => {
    if (!programForm.name.trim()) return;
    setSavingProgram(true);
    try {
      const data = {
        name: programForm.name,
        description: JSON.stringify({ type: 'program', desc: programForm.description, duration: programForm.duration, level: programForm.level, link: programForm.link, promoCode: programForm.promoCode }),
        price: parseFloat(programForm.price) || 0,
        category: programForm.category || 'General',
      };
      if (editingProgramId) {
        await programApi.update(editingProgramId, data);
      } else {
        await programApi.create(data);
      }
      setShowProgramForm(false);
      setEditingProgramId(null);
      setProgramForm(emptyProgramForm);
      await fetchItems();
    } catch {}
    finally { setSavingProgram(false); }
  };

  const handleEditProgram = (p: { id: string; name: string; description?: string; price?: number; category?: string }) => {
    let parsed: Record<string, string> = {};
    try { parsed = JSON.parse(p.description || '{}'); } catch { parsed = { desc: p.description || '' }; }
    setProgramForm({
      name: p.name,
      description: parsed.desc || parsed.description || '',
      price: String(p.price || 0),
      duration: parsed.duration || '',
      level: parsed.level || '',
      category: p.category || '',
      link: parsed.link || '',
      promoCode: parsed.promoCode || '',
    });
    setEditingProgramId(p.id);
    setShowProgramForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await programApi.delete(id);
      setItems(prev => prev.filter(p => p.id !== id));
    } catch {}
  };

  const parseDesc = (item: { description?: string }) => {
    try { return JSON.parse(item.description || '{}'); } catch { return { desc: item.description }; }
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#9ca3af', fontSize: 15 }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#111827', margin: 0 }}>Products & Programs</h1>
      <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4, marginBottom: 24 }}>Manage your affiliate products and fitness programs</p>

      {/* ========== PRODUCTS SECTION ========== */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff3e48' }}><Package size={18} /></div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Products</h2>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Affiliate products, supplements, equipment</p>
            </div>
          </div>
          <button type="button" onClick={() => { setShowProductForm(true); setEditingProductId(null); setProductForm(emptyProductForm); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <Plus size={14} /> Add Product
          </button>
        </div>

        {/* Product Form */}
        {showProductForm && (
          <div style={{ ...card, marginBottom: 16, border: '2px solid #ff3e48' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{editingProductId ? 'Edit Product' : 'New Product'}</h3>
              <button type="button" onClick={() => { setShowProductForm(false); setEditingProductId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Whey Protein Isolate" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Price (₹)</label>
                <input type="number" value={productForm.price} onChange={(e) => setProductForm(f => ({ ...f, price: e.target.value }))} placeholder="999" min="0" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Product Link (URL)</label>
                <input type="url" value={productForm.link} onChange={(e) => setProductForm(f => ({ ...f, link: e.target.value }))} placeholder="https://amazon.in/..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Promo Code</label>
                <input type="text" value={productForm.promoCode} onChange={(e) => setProductForm(f => ({ ...f, promoCode: e.target.value }))} placeholder="e.g. FIT20" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Description</label>
              <input type="text" value={productForm.description} onChange={(e) => setProductForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the product" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Image URL (optional)</label>
              <input type="url" value={productForm.imageUrl} onChange={(e) => setProductForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleSaveProduct} disabled={savingProduct} style={{ padding: '10px 24px', borderRadius: 8, background: '#ff3e48', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {savingProduct ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={() => { setShowProductForm(false); setEditingProductId(null); }} style={{ padding: '10px 24px', borderRadius: 8, background: '#fff', color: '#6b7280', fontSize: 13, fontWeight: 600, border: '1px solid #ede8e3', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Product Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {products.length === 0 && !showProductForm && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '36px 0', color: '#9ca3af', fontSize: 13, ...card }}>
              No products yet. Add your first product!
            </div>
          )}
          {products.map((p) => {
            const d = parseDesc(p);
            return (
              <div key={p.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{p.name}</div>
                    {d.desc && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>{d.desc}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button type="button" onClick={() => handleEditProduct(p)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #ede8e3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af' }}><Pencil size={13} /></button>
                    <button type="button" onClick={() => handleDelete(p.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ff3e48' }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: 18 }}>₹{Number(p.price || 0).toFixed(0)}</span>
                  {d.promoCode && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600 }}>
                      <Tag size={10} /> {d.promoCode}
                    </span>
                  )}
                  {d.link && (
                    <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#3b82f6', fontSize: 12 }}>
                      <ExternalLink size={12} /> Visit
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========== PROGRAMS SECTION ========== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}><Dumbbell size={18} /></div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Fitness Programs</h2>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Your training programs and courses</p>
            </div>
          </div>
          <button type="button" onClick={() => { setShowProgramForm(true); setEditingProgramId(null); setProgramForm(emptyProgramForm); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#111827', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <Plus size={14} /> Add Program
          </button>
        </div>

        {/* Program Form */}
        {showProgramForm && (
          <div style={{ ...card, marginBottom: 16, border: '2px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>{editingProgramId ? 'Edit Program' : 'New Program'}</h3>
              <button type="button" onClick={() => { setShowProgramForm(false); setEditingProgramId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Program Name *</label>
                <input type="text" value={programForm.name} onChange={(e) => setProgramForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 12-Week Fat Loss Challenge" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Price (₹)</label>
                <input type="number" value={programForm.price} onChange={(e) => setProgramForm(f => ({ ...f, price: e.target.value }))} placeholder="4999" min="0" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Duration</label>
                <input type="text" value={programForm.duration} onChange={(e) => setProgramForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 12 Weeks" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Level</label>
                <select value={programForm.level} onChange={(e) => setProgramForm(f => ({ ...f, level: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select level</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={programForm.category} onChange={(e) => setProgramForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select category</option>
                  {FITNESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Description</label>
              <textarea value={programForm.description} onChange={(e) => setProgramForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe what this program includes, who it's for, expected results..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Program Link (URL)</label>
                <input type="url" value={programForm.link} onChange={(e) => setProgramForm(f => ({ ...f, link: e.target.value }))} placeholder="https://yoursite.com/program" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Promo Code (optional)</label>
                <input type="text" value={programForm.promoCode} onChange={(e) => setProgramForm(f => ({ ...f, promoCode: e.target.value }))} placeholder="e.g. FIT20" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" onClick={handleSaveProgram} disabled={savingProgram} style={{ padding: '10px 24px', borderRadius: 8, background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {savingProgram ? 'Saving...' : editingProgramId ? 'Update Program' : 'Create Program'}
              </button>
              <button type="button" onClick={() => { setShowProgramForm(false); setEditingProgramId(null); }} style={{ padding: '10px 24px', borderRadius: 8, background: '#fff', color: '#6b7280', fontSize: 13, fontWeight: 600, border: '1px solid #ede8e3', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Program Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {programs.length === 0 && !showProgramForm && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '36px 0', color: '#9ca3af', fontSize: 13, ...card }}>
              No programs yet. Create your first fitness program!
            </div>
          )}
          {programs.map((p) => {
            const d = parseDesc(p);
            return (
              <div key={p.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{p.name}</div>
                    {d.desc && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.5 }}>{d.desc}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button type="button" onClick={() => handleEditProgram(p)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #ede8e3', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9ca3af' }}><Pencil size={13} /></button>
                    <button type="button" onClick={() => handleDelete(p.id)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fecaca', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ff3e48' }}><Trash2 size={13} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: 18 }}>₹{Number(p.price || 0).toFixed(0)}</span>
                  {d.duration && (
                    <span style={{ padding: '2px 10px', borderRadius: 6, background: '#eff6ff', color: '#3b82f6', fontSize: 11, fontWeight: 600 }}>{d.duration}</span>
                  )}
                  {d.level && (
                    <span style={{ padding: '2px 10px', borderRadius: 6, background: '#f0fdf4', color: '#10b981', fontSize: 11, fontWeight: 600 }}>{d.level}</span>
                  )}
                  {p.category && p.category !== '__product__' && (
                    <span style={{ padding: '2px 10px', borderRadius: 6, background: '#f5f3ff', color: '#8b5cf6', fontSize: 11, fontWeight: 600 }}>{p.category}</span>
                  )}
                  {d.promoCode && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 6, background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 600 }}><Tag size={10} /> {d.promoCode}</span>
                  )}
                  {d.link && (
                    <a href={d.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#3b82f6', fontSize: 12 }}><ExternalLink size={12} /> Link</a>
                  )}
                </div>
                {(p.salesCount > 0 || p.revenue > 0) && (
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid #f3f0ec' }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Sales</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{p.salesCount || 0}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Revenue</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#ff3e48' }}>₹{Number(p.revenue || 0).toFixed(0)}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CreatorProducts;
