import React, { useState, useEffect } from "react";
import "./DeliveryForm.css";
import { supabase } from "./supabaseClient";

function DeliveryForm({ onNavigate }) {
  const [formData, setFormData] = useState({
    deliveredDate: "",
    dcNumber: "",
    itemType: "",
    productName: "",
    customerName: "",
    cylinderNumber: "",
    cylinderType: "",
    count: "1"
  });
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [cylinderTypes, setCylinderTypes] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, deliveredDate: today }));
    fetchCustomers();
    fetchProducts();
  }, []);
  
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('VSRCUSTOMERDATA')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
      } else {
        setCustomers(data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('VSRPRODUCTS')
        .select('*')
        .order('type', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
      } else {
        setProducts(data || []);
        // Extract unique item types
        const types = [...new Set((data || []).map(p => p.type))];
        setItemTypes(types);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCylinderTypes = async (productName) => {
    try {
      const { data, error } = await supabase
        .from('VSRPRODUCTS')
        .select('cylinder_type')
        .eq('product_name', productName)
        .eq('type', 'Cylinder');
      
      if (error) {
        console.error('Supabase error:', error);
        setCylinderTypes([]);
      } else {
        // Extract unique cylinder types and filter out null/empty values
        const types = [...new Set((data || []).map(p => p.cylinder_type))].filter(t => t);
        setCylinderTypes(types);
      }
    } catch (error) {
      console.error('Error fetching cylinder types:', error);
      setCylinderTypes([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'itemType') {
      setFormData({ ...formData, itemType: value, productName: '', cylinderNumber: '', cylinderType: '', count: '1' });
      setCylinderTypes([]);
      return;
    }
    
    if (name === 'productName') {
      setFormData({ ...formData, productName: value, cylinderType: '' });
      // Fetch cylinder types when product name is selected
      if (formData.itemType === 'Cylinder' && value) {
        fetchCylinderTypes(value);
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let records;
      
      // For cylinder type, handle LPG separately or split multiple cylinder numbers
      if (formData.itemType === 'Cylinder') {
        // Check if this is an LPG cylinder (typically tracked by count, not individual numbers)
        const isLPGType = formData.productName.toUpperCase().includes('LPG') || 
                         formData.cylinderType.toUpperCase().includes('LPG');
        
        if (isLPGType) {
          // Use count for LPG products that don't track individual cylinder numbers
          const productCount = parseInt(formData.count) || 1;
          records = [{
            delivered_date: formData.deliveredDate,
            dc_number: formData.dcNumber,
            product_type: formData.itemType,
            product_name: formData.productName,
            customer_name: formData.customerName,
            cylinder_number: null,
            cylinder_type: formData.cylinderType,
            count: productCount,
            type: 'delivery',
            created_at: new Date().toISOString()
          }];
        } else {
          // For other cylinder types, handle multiple cylinder numbers
          // Split cylinder numbers by comma and trim whitespace
          const cylinderNumbers = formData.cylinderNumber
            .split(',')
            .map(num => num.trim())
            .filter(num => num.length > 0);
          
          if (cylinderNumbers.length === 0) {
            alert('Please enter at least one cylinder number');
            return;
          }
          
          // Create an array of records (one for each cylinder number)
          records = cylinderNumbers.map((cylinderNum) => ({
            delivered_date: formData.deliveredDate,
            dc_number: formData.dcNumber,
            product_type: formData.itemType,
            product_name: formData.productName,
            customer_name: formData.customerName,
            cylinder_number: cylinderNum,
            cylinder_type: formData.cylinderType,
            type: 'delivery',
            created_at: new Date().toISOString()
          }));
        }
      } else {
        // For non-cylinder products, create a single record without cylinder number
        const productCount = parseInt(formData.count) || 1;
        records = [{
          delivered_date: formData.deliveredDate,
          dc_number: formData.dcNumber,
          product_type: formData.itemType,
          product_name: formData.productName,
          customer_name: formData.customerName,
          cylinder_number: null,
          cylinder_type: null,
          count: productCount,
          type: 'delivery',
          created_at: new Date().toISOString()
        }];
      }
      
      const { data, error } = await supabase
        .from('VSRCYLINDERDATA')
        .insert(records);
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error saving delivery: ${error.message}`);
      } else {
        console.log('Saved to Supabase:', data);
        const recordCount = records.length;
        const recordType = formData.itemType === 'Cylinder' ? 'cylinder delivery' : 'delivery';
        alert(`${recordCount} ${recordType} record(s) saved successfully!`);
        
        // Preserve date and customer name
        const preservedDate = formData.deliveredDate;
        const preservedCustomer = formData.customerName;
        
        setFormData({
          deliveredDate: preservedDate,
          dcNumber: "",
          itemType: "",
          productName: "",
          customerName: preservedCustomer,
          cylinderNumber: "",
          cylinderType: "",
          count: "1"
        });
        setCylinderTypes([]);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error saving delivery details: ${error.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">Delivered Details</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Delivered Date</label>
          <input type="date" name="deliveredDate" value={formData.deliveredDate} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>DC Number</label>
          <input
            type="text"
            name="dcNumber"
            placeholder="DC-001"
            value={formData.dcNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Customer Name</label>
          <select name="customerName" value={formData.customerName} onChange={handleChange} required>
            <option value="">Select Customer</option>
            {customers.map((customer, index) => (
              <option key={index} value={customer.name}>{customer.name}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Product Type</label>
          <select name="itemType" value={formData.itemType} onChange={handleChange} required>
            <option value="">Select Product Type</option>
            {itemTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {formData.itemType && (
          <div className="input-group">
            <label>Product Name</label>
            <select name="productName" value={formData.productName} onChange={handleChange} required>
              <option value="">Select Product</option>
              {[...new Set(products.filter(p => p.type === formData.itemType).map(p => p.product_name))].map((productName, index) => (
                <option key={index} value={productName}>
                  {productName}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.itemType === 'Cylinder' && (
          <>
            <div className="input-group">
              <label>Cylinder Type</label>
              <select name="cylinderType" value={formData.cylinderType} onChange={handleChange} required>
                <option value="">Select Cylinder Type</option>
                {cylinderTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {formData.cylinderType && !(formData.productName.toUpperCase().includes('LPG') || formData.cylinderType.toUpperCase().includes('LPG')) && (
              <div className="input-group">
                <label>Cylinder Number(s) <small>(separate multiple with commas)</small></label>
                <input
                  type="text"
                  name="cylinderNumber"
                  placeholder="CYL-1001, CYL-1002, CYL-1003"
                  value={formData.cylinderNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            {formData.cylinderType && (formData.productName.toUpperCase().includes('LPG') || formData.cylinderType.toUpperCase().includes('LPG')) && (
              <div className="input-group">
                <label>Count/Quantity</label>
                <input
                  type="number"
                  name="count"
                  placeholder="1"
                  min="1"
                  value={formData.count}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
          </>
        )}

        {formData.itemType && formData.itemType !== 'Cylinder' && (
          <div className="input-group">
            <label>Count/Quantity</label>
            <input
              type="number"
              name="count"
              placeholder="1"
              min="1"
              value={formData.count}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <button type="submit">Save Entry</button>
      </form>
      </div>
    </div>
  );
}

export default DeliveryForm;
