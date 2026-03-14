import React, { useState, useEffect } from "react";
import "./DeliveryForm.css";
import "./CustomerForm.css";
import { supabase } from "./supabaseClient";

function EditCustomer() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
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
        setFilteredCustomers(data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.gst_number && customer.gst_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredCustomers(filtered);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Auto-filter as user types
    if (!value.trim()) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.phone.includes(value) ||
        (customer.gst_number && customer.gst_number.toLowerCase().includes(value.toLowerCase())) ||
        customer.address.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      gstNumber: customer.gst_number || "",
      address: customer.address
    });
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
        setSearchTerm("");
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
        setSearchTerm("");
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error deleting customer: ${error.message}`);
    }
  };

  return (
    <div className="customer-container">
      <div className="customer-form-card">
        <h2 className="customer-form-title">Edit Customer</h2>

        {!selectedCustomer ? (
          <div className="customer-list">
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="search-form-customer">
              <div className="search-input-group">
                <label>Search Customer</label>
                <input
                  type="text"
                  placeholder="Search by name, phone, GST, or address..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="search-input-customer"
                />
              </div>
              
              <button type="submit" className="btn-search-customer">
                🔍 Search
              </button>
            </form>

            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#666' }}>
              {filteredCustomers.length === customers.length 
                ? 'Select a customer to edit:' 
                : `Found ${filteredCustomers.length} customer(s):`
              }
            </h3>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer, index) => (
                <div 
                  key={index} 
                  className="customer-item"
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <div className="customer-item-name">{customer.name}</div>
                  <div className="customer-item-details">
                    📞 {customer.phone} | 📍 {customer.address.substring(0, 30)}...
                  </div>
                </div>
              ))
            ) : (
              <div className="no-customers">
                {searchTerm ? 'No customers match your search.' : 'No customers found. Add a customer first.'}
              </div>
            )}
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
                  setSearchTerm("");
                  setFilteredCustomers(customers);
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
