import React, { useState, useEffect } from "react";
import "./DeliveryForm.css";
import "./CustomerForm.css";
import { supabase } from "./supabaseClient";

function EditCustomer() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gstNumber: "",
    address: ""
  });

  useEffect(() => {
    fetchCustomers();
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

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    
    if (!customerId) {
      setSelectedCustomer(null);
      setFormData({ name: "", phone: "", gstNumber: "", address: "" });
      return;
    }

    const customer = customers.find(c => c.id.toString() === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        gstNumber: customer.gst_number || "",
        address: customer.address
      });
    }
  };

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
        .update({
          name: formData.name,
          phone: formData.phone,
          gst_number: formData.gstNumber,
          address: formData.address
        })
        .eq('id', selectedCustomer.id);
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error updating customer: ${error.message}`);
      } else {
        alert("Customer updated successfully!");
        setSelectedCustomer(null);
        setFormData({ name: "", phone: "", gstNumber: "", address: "" });
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error updating customer: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      const { data, error } = await supabase
        .from('VSRCUSTOMERDATA')
        .delete()
        .eq('id', selectedCustomer.id);
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error deleting customer: ${error.message}`);
      } else {
        alert("Customer deleted successfully!");
        setSelectedCustomer(null);
        setFormData({ name: "", phone: "", gstNumber: "", address: "" });
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error deleting customer: ${error.message}`);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">Edit Customer</h2>

        {!selectedCustomer ? (
          <div className="select-customer-section">
            <div className="input-group">
              <label>Select Customer</label>
              <select
                onChange={handleCustomerSelect}
                value={selectedCustomer?.id || ""}
                className="customer-select"
              >
                <option value="">-- Select a Customer --</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Customer Name *</label>
              <input
                type="text"
                name="name"
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
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Address *</label>
              <textarea
                name="address"
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

            <button type="submit">Update Customer</button>
            
            <div className="edit-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setFormData({ name: "", phone: "", gstNumber: "", address: "" });
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="delete-button"
                onClick={handleDelete}
              >
                Delete Customer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditCustomer;
