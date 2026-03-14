import React, { useState } from "react";
import "./DeliveryForm.css";
import "./CustomerForm.css";
import { supabase } from './supabaseClient';

function AddCustomer() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gstNumber: "",
    address: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('VSRCUSTOMERDATA')
        .insert({
          name: formData.name,
          phone: formData.phone,
          gst_number: formData.gstNumber,
          address: formData.address,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error adding customer: ${error.message}`);
      } else {
        console.log('Saved to Supabase:', data);
        alert("Customer added successfully!");
        setFormData({
          name: "",
          phone: "",
          gstNumber: "",
          address: ""
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error adding customer: ${error.message}`);
    }
  };

  return (
    <div className="customer-container">
      <div className="customer-form-card">
        <h2 className="customer-form-title">Add New Customer</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Customer Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter customer name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              pattern="[0-9]{10}"
              required
            />
          </div>

          <div className="input-group">
            <label>GST Number</label>
            <input
              type="text"
              name="gstNumber"
              placeholder="Enter GST number (optional)"
              value={formData.gstNumber}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Address *</label>
            <textarea
              name="address"
              placeholder="Enter complete address"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <button type="submit">Add Customer</button>
        </form>
      </div>
    </div>
  );
}

export default AddCustomer;
