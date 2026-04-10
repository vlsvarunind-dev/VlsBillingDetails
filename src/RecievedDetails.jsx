import React, { useState, useEffect } from "react";
import "./RecievedDetails.css";
import { supabase } from "./supabaseClient";

function ReceivedDetails({ onNavigate }) {
  const [formData, setFormData] = useState({
    receivedDate: "",
    customerName: "",
    cylinderNumber: "",
    cylinderType: ""
  });
  
  const [customers, setCustomers] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, receivedDate: today }));
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

  const fetchPendingDeliveries = async (customerName) => {
    try {
      console.log('Fetching pending deliveries for:', customerName);
      
      // Get deliveries for this customer that haven't been received yet (received_date is NULL)
      const { data: deliveries, error: deliveryError } = await supabase
        .from('VSRCYLINDERDATA')
        .select('*')
        .eq('customer_name', customerName)
        .eq('type', 'delivery')
        .is('received_date', null)
        .order('delivered_date', { ascending: false });
      
      if (deliveryError) {
        console.error('Error fetching deliveries:', deliveryError);
        alert(`Error: ${deliveryError.message}`);
        return;
      }
      
      console.log('Raw deliveries from database:', deliveries);
      
      // Additional filter to ensure received_date is truly null or empty
      const filteredDeliveries = (deliveries || []).filter(d => 
        !d.received_date && d.cylinder_number
      );
      
      console.log('Filtered deliveries (only pending):', filteredDeliveries);
      
      setPendingDeliveries(filteredDeliveries.map(d => ({
        id: d.id,
        cylinderNumber: d.cylinder_number,
        cylinderType: d.cylinder_type,
        deliveredDate: d.delivered_date,
        dcNumber: d.dc_number,
        itemType: d.product_type,
        itemName: d.product_name || ''
      })));
      
      console.log('Found', filteredDeliveries.length, 'pending deliveries (not yet received)');
    } catch (error) {
      console.error('Error fetching pending deliveries:', error);
      alert(`Network error: ${error.message}`);
    }
  };

  const handleCustomerChange = (e) => {
    const customerName = e.target.value;
    setFormData({
      ...formData,
      customerName: customerName,
      cylinderNumber: "",
      cylinderType: ""
    });
    setSelectedDelivery(null);
    setPendingDeliveries([]);
    
    if (customerName) {
      fetchPendingDeliveries(customerName);
    }
  };

  const handleDeliverySelect = (e) => {
    const cylinderNumber = e.target.value;
    const delivery = pendingDeliveries.find(d => d.cylinderNumber === cylinderNumber);
    
    if (delivery) {
      setSelectedDelivery(delivery);
      setFormData({
        ...formData,
        cylinderNumber: delivery.cylinderNumber,
        cylinderType: delivery.cylinderType
      });
    } else {
      setSelectedDelivery(null);
      setFormData({
        ...formData,
        cylinderNumber: "",
        cylinderType: ""
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
    
    console.log('=== SAVE ENTRY DEBUG ===');
    console.log('Form data:', formData);
    console.log('Selected delivery:', selectedDelivery);
    
    if (!selectedDelivery || !selectedDelivery.id) {
      alert('Error: No cylinder selected. Please select a cylinder first.');
      return;
    }
    
    try {
      console.log('Attempting update with:');
      console.log('  - ID:', selectedDelivery.id);
      console.log('  - Received Date:', formData.receivedDate);
      
      // Update the existing delivery record with the received_date
      const { data, error, count } = await supabase
        .from('VSRCYLINDERDATA')
        .update({
          received_date: formData.receivedDate
        })
        .eq('id', selectedDelivery.id)
        .select();
      
      console.log('Update response:');
      console.log('  - Data:', data);
      console.log('  - Error:', error);
      console.log('  - Count:', count);
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error: ${error.message}\n\nCode: ${error.code}\nDetails: ${error.details || 'None'}\n\nCheck browser console for more details.`);
        return;
      }
      
      if (!data || data.length === 0) {
        console.error('No rows updated! Possible issues:');
        console.error('  1. Record ID does not exist');
        console.error('  2. RLS policy blocking update');
        console.error('  3. Database connection issue');
        alert('Error: Update failed - no rows were affected.\n\nPossible causes:\n- Row Level Security is blocking the update\n- The record may have been deleted\n- Database connection issue\n\nCheck browser console for details.');
        return;
      }
      
      console.log('✓ Successfully updated:', data);
      alert("Cylinder received details saved successfully!");
      
      // Preserve date and customer name
      const preservedDate = formData.receivedDate;
      const preservedCustomer = formData.customerName;
      
      setFormData({
        receivedDate: preservedDate,
        customerName: preservedCustomer,
        cylinderNumber: "",
        cylinderType: ""
      });
      setSelectedDelivery(null);
      
      // Refresh pending deliveries
      fetchPendingDeliveries(preservedCustomer);
      
    } catch (error) {
      console.error('Caught exception:', error);
      alert(`Error saving received details: ${error.message || 'Unknown error'}\n\nCheck browser console for details.`);
    }
  };

  return (
    <div className="page-container">
      <div className="page-card">
        <h2 className="page-title">Received Details</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Received Date</label>
          <input type="date" name="receivedDate" value={formData.receivedDate} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label>Customer Name</label>
          <select name="customerName" value={formData.customerName} onChange={handleCustomerChange} required>
            <option value="">Select Customer</option>
            {customers.map((customer, index) => (
              <option key={index} value={customer.name}>{customer.name}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Select Cylinder</label>
          <select onChange={handleDeliverySelect} value={formData.cylinderNumber} disabled={!formData.customerName} required>
            <option value="">-- Select a cylinder --</option>
            {pendingDeliveries.map((delivery, index) => {
              // Extract gas type from product name (e.g., "Oxygen Cylinder" -> "Oxygen")
              const gasType = delivery.itemName.replace(/\s*Cylinder\s*/i, '').trim() || delivery.cylinderType;
              return (
                <option key={index} value={delivery.cylinderNumber}>
                  {delivery.cylinderNumber} - {gasType} - Delivered: {delivery.deliveredDate}
                </option>
              );
            })}
          </select>
        </div>

        {selectedDelivery && (
          <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px', marginBottom: '15px' }}>
            <strong>Delivery Details:</strong><br/>
            DC Number: {selectedDelivery.dcNumber}<br/>
            Product: {selectedDelivery.itemType} - {selectedDelivery.itemName}<br/>
            Cylinder: {selectedDelivery.cylinderNumber} ({selectedDelivery.cylinderType})<br/>
            Delivered: {selectedDelivery.deliveredDate}
          </div>
        )}

        <button type="submit" disabled={!selectedDelivery}>Save Entry</button>
      </form>
      </div>
    </div>
  );
}

export default ReceivedDetails;
