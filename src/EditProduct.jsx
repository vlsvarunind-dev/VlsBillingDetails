import React, { useState, useEffect } from "react";
import "./DeliveryForm.css";
import "./ProductForm.css";
import { supabase } from "./supabaseClient";

function EditProduct() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productTypes, setProductTypes] = useState([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newType, setNewType] = useState("");
  const [formData, setFormData] = useState({
    productName: "",
    type: "",
    cylinderType: "",
    defaultPrice: "",
    hsnCode: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchProductTypes();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('VSRPRODUCTS')
        .select('*')
        .order('product_name', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('VSRPRODUCTS')
        .select('type');
      
      if (error) {
        console.error('Supabase error:', error);
        setProductTypes([]);
      } else {
        // Get distinct types
        const uniqueTypes = [...new Set(data.map(item => item.type))].filter(type => type);
        setProductTypes(uniqueTypes.sort());
      }
    } catch (error) {
      console.error('Error fetching product types:', error);
      setProductTypes([]);
    }
  };

  const handleAddType = (e) => {
    e.preventDefault();
    if (!newType.trim()) return;

    // Check if type already exists
    if (productTypes.includes(newType.trim())) {
      alert("This product type already exists!");
      return;
    }

    // Add the new type to the list
    setProductTypes([...productTypes, newType.trim()].sort());
    setFormData({ ...formData, type: newType.trim() });
    alert("Product type added to the list!");
    setNewType("");
    setShowTypeModal(false);
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    
    if (!productId) {
      setSelectedProduct(null);
      setFormData({ productName: "", type: "", cylinderType: "", defaultPrice: "", hsnCode: "" });
      return;
    }

    const product = products.find(p => p.id.toString() === productId);
    if (product) {
      setSelectedProduct(product);
      setFormData({
        productName: product.product_name,
        type: product.type,
        cylinderType: product.cylinder_type || "",
        defaultPrice: product.default_price || "",
        hsnCode: product.hsn_code || ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('VSRPRODUCTS')
        .update({
          product_name: formData.productName,
          type: formData.type,
          cylinder_type: formData.type === 'Cylinder' ? formData.cylinderType : null,
          default_price: formData.defaultPrice ? parseFloat(formData.defaultPrice) : null,
          hsn_code: formData.hsnCode || null
        })
        .eq('id', selectedProduct.id);
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error updating product: ${error.message}`);
      } else {
        alert("Product updated successfully!");
        setSelectedProduct(null);
        setFormData({ productName: "", type: "", cylinderType: "", defaultPrice: "", hsnCode: "" });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error updating product: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { data, error } = await supabase
        .from('VSRPRODUCTS')
        .delete()
        .eq('id', selectedProduct.id);
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error deleting product: ${error.message}`);
      } else {
        alert("Product deleted successfully!");
        setSelectedProduct(null);
        setFormData({ productName: "", type: "", cylinderType: "", defaultPrice: "", hsnCode: "" });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error deleting product: ${error.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">Edit Product</h2>

        {!selectedProduct ? (
          <div className="select-product-section">
            <div className="input-group">
              <label>Select Product</label>
              <select
                onChange={handleProductSelect}
                value={selectedProduct?.id || ""}
                className="product-select"
              >
                <option value="">-- Select a Product --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name} - {product.type}
                    {product.cylinder_type && ` (${product.cylinder_type})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              >
                <option value="">-- Select Product Type --</option>
                {productTypes.map((type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowTypeModal(true)}
                className="add-type-button"
              >
                + Add Product Type
              </button>
            </div>

            {formData.type === 'Cylinder' && (
              <>
                <div className="input-group">
                  <label>Cylinder Type *</label>
                  <input
                    type="text"
                    name="cylinderType"
                    placeholder="Enter cylinder type (e.g., 7 Kg, 19 Kg, 47.5 Kg)"
                    value={formData.cylinderType}
                    onChange={handleChange}
                    required={formData.type === 'Cylinder'}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label>HSN Code</label>
              <input
                type="text"
                name="hsnCode"
                placeholder="Enter HSN code (e.g., 9973)"
                value={formData.hsnCode}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Default Price</label>
              <input
                type="number"
                name="defaultPrice"
                value={formData.defaultPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>

            <button type="submit">Update Product</button>
            
            <div className="edit-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setSelectedProduct(null);
                  setFormData({ productName: "", type: "", cylinderType: "", defaultPrice: "", hsnCode: "" });
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="delete-button"
                onClick={handleDelete}
              >
                Delete Product
              </button>
            </div>
          </form>
        )}
      </div>

      {showTypeModal && (
        <div className="type-modal-overlay" onClick={() => setShowTypeModal(false)}>
          <div className="type-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="type-modal-header">
              <h3>Add New Product Type</h3>
              <button className="close-button" onClick={() => setShowTypeModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddType} style={{ padding: '20px' }}>
              <div className="input-group">
                <label>Type Name *</label>
                <input
                  type="text"
                  placeholder="Enter product type name"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Add Type
                </button>
                <button type="button" onClick={() => setShowTypeModal(false)} style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProduct;
