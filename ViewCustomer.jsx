import React, { useState, useEffect } from "react";
import "./ViewCustomer.css";
import { supabase } from "./supabaseClient";

function ViewCustomer({ onNavigate }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customerDetails, setCustomerDetails] = useState(null);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    const customerName = e.target.value;
    setSelectedCustomer(customerName);
    
    if (customerName) {
      const customer = customers.find(c => c.name === customerName);
      setCustomerDetails(customer);
    } else {
      setCustomerDetails(null);
    }
  };

  const handleViewDetails = async () => {
    if (!selectedCustomer) {
      alert("Please select a customer first");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('VSRCYLINDERDATA')
        .select('*')
        .eq('customer_name', selectedCustomer)
        .order('delivered_date', { ascending: false })
        .limit(30);
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error fetching delivery history: ${error.message}`);
      } else {
        setDeliveryHistory(data || []);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error fetching customer details: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="view-customer-container">
      <h2>View Customer Details</h2>

      <div className="customer-select-form">
        <div className="select-input-group">
          <label>Select Customer</label>
          <select
            value={selectedCustomer}
            onChange={handleCustomerSelect}
            className="customer-select"
          >
            <option value="">-- Select a Customer --</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.name}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {customerDetails && (
          <div className="customer-info-card">
            <div className="info-row">
              <label>Name:</label>
              <span>{customerDetails.name}</span>
            </div>
            <div className="info-row">
              <label>GST Number:</label>
              <span>{customerDetails.gst_number || "N/A"}</span>
            </div>
            <div className="info-row">
              <label>Address:</label>
              <span>{customerDetails.address || "N/A"}</span>
            </div>
            <div className="info-row">
              <label>Phone Number:</label>
              <span>{customerDetails.phone_number || "N/A"}</span>
            </div>

            <button 
              onClick={handleViewDetails} 
              className="btn-view-details"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "📋 View Full Details"}
            </button>
          </div>
        )}
      </div>

      <button onClick={() => onNavigate("delivery")} className="btn-back">
        ← Back to Home
      </button>

      {showModal && (
        <div className="customer-modal-overlay" onClick={closeModal}>
          <div className="customer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="customer-modal-header">
              <h2>Full Details - {selectedCustomer}</h2>
              <button className="close-button" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-customer-info">
              <h3>Customer Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Name:</strong> {customerDetails.name}
                </div>
                <div className="detail-item">
                  <strong>GST Number:</strong> {customerDetails.gst_number || "N/A"}
                </div>
                <div className="detail-item">
                  <strong>Address:</strong> {customerDetails.address || "N/A"}
                </div>
                <div className="detail-item">
                  <strong>Phone Number:</strong> {customerDetails.phone_number || "N/A"}
                </div>
              </div>
            </div>

            <div className="delivery-history-container">
              <h3>Delivery History (Last 30 Records)</h3>
              {deliveryHistory.length > 0 ? (
                <div className="table-wrapper">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>DC Number</th>
                        <th>Product Name</th>
                        <th>Cylinder Type</th>
                        <th>Cylinder Number</th>
                        <th>Delivered Date</th>
                        <th>Received Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveryHistory.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td>{item.dc_number || "-"}</td>
                          <td>{item.product_name || "-"}</td>
                          <td>{item.cylinder_type || "-"}</td>
                          <td>{item.cylinder_number || "-"}</td>
                          <td>{formatDate(item.delivered_date)}</td>
                          <td>{formatDate(item.received_date)}</td>
                          <td>
                            <span className={`status-badge ${item.received_date ? 'received' : 'pending'}`}>
                              {item.received_date ? 'Received' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-history">No delivery history found for this customer.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewCustomer;
