import React, { useState, useEffect, useCallback } from "react";
import "./GenerateBill.css";
import { supabase } from "./supabaseClient";

function GenerateBill({ onNavigate }) {
  const [showBillSetup, setShowBillSetup] = useState(true); // true = show date selection, false = show bill
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    date: "",
    customerName: "",
    customerAddress: "",
    customerGSTIN: "",
    dateOfSupply: "",
    vehicleNo: "",
    state: "TELANGANA",
    code: "36",
    fromDate: "",
    toDate: ""
  });

  const [items, setItems] = useState([
    {
      description: "",
      cylinderNumbers: "",
      hsnCode: "",
      qty: "",
      rate: "",
      amount: 0
    }
  ]);

    const [taxDetails, setTaxDetails] = useState({
      totalBeforeTax: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0,
      totalAfterTax: 0
    });
    const [deliveredDetails, setDeliveredDetails] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, date: today, dateOfSupply: today }));
    fetchCustomers();
    generateInvoiceNumber();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('VSRCUSTOMERDATA')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
      } else {
        setCustomers(data || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now();
    const invoiceNum = `INV${timestamp.toString().slice(-6)}`;
    setFormData(prev => ({ ...prev, invoiceNumber: invoiceNum }));
  };

  const handleCustomerChange = async (e) => {
    const selectedName = e.target.value;
    const customer = customers.find(c => c.name === selectedName);
    setFormData(prev => ({
      ...prev,
      customerName: selectedName,
      customerAddress: customer?.address || "",
      customerGSTIN: customer?.gst_number || ""
    }));
    
    // Reset items when customer changes
    setDeliveredDetails([]);
    setItems([{ description: "", cylinderNumbers: "", hsnCode: "", qty: "", rate: "", amount: 0 }]);
  };

  const fetchBillItems = async () => {
    const { customerName, fromDate, toDate } = formData;
    
    if (!customerName) {
      alert("Please select a customer first");
      return;
    }
    
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date");
      return;
    }

    try {
      console.log('Fetching bill items for:', { customerName, fromDate, toDate });
      
      let query = supabase
        .from('VSRCYLINDERDATA')
        .select('*')
        .eq('customer_name', customerName)
        .eq('type', 'delivery')
        .gte('delivered_date', fromDate)
        .lte('delivered_date', toDate)
        .order('delivered_date', { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const details = data || [];
      setDeliveredDetails(details);
      
      console.log('Fetched delivery records:', details);
      
      // Fetch product prices from VSRPRODUCTS
      const { data: productsData, error: productsError } = await supabase
        .from('VSRPRODUCTS')
        .select('product_name, type, default_price');
      
      if (productsError) {
        console.error('Error fetching products:', productsError);
      }
      
      const productPrices = {};
      if (productsData) {
        productsData.forEach(p => {
          const key = `${p.product_name}|${p.type}`;
          productPrices[key] = p.default_price || 0;
        });
      }
      
      console.log('Product prices:', productPrices);
      
      // Group by DC Number + Product Type
      if (details.length > 0) {
        const groupedItems = {};
        
        details.forEach((d) => {
          // Build product description based on product type
          let productName = '';
          let productType = d.product_type || '';
          
          if (d.product_type === 'Cylinder') {
            // For cylinders: combine product_name with cylinder_type
            const baseName = d.product_name || 'Cylinder';
            const cylinderType = d.cylinder_type || '';
            
            if (cylinderType) {
              productName = `${baseName} (${cylinderType})`;
            } else {
              productName = baseName;
            }
          } else if (d.product_name && d.product_name.trim() !== '') {
            // For non-cylinder products, just use product_name
            productName = d.product_name.trim();
          } else if (d.product_type) {
            // Fallback to product_type if product_name is not set
            productName = d.product_type;
          } else {
            productName = 'Unknown Product';
          }
          
          const dcNumber = d.dc_number || 'N/A';
          const cylinderNumber = d.cylinder_number || '';
          
          // Create unique key for DC + Product combination
          const groupKey = `${dcNumber}|${productName}`;
          
          if (!groupedItems[groupKey]) {
            groupedItems[groupKey] = {
              dcNumber: dcNumber,
              productName: productName,
              productType: productType,
              baseName: d.product_name || productName,
              cylinderNumbers: [],
              quantity: 0
            };
          }
          
          // Add cylinder number if it exists
          if (cylinderNumber && cylinderNumber.trim() !== '') {
            groupedItems[groupKey].cylinderNumbers.push(cylinderNumber.trim());
          }
          
          groupedItems[groupKey].quantity += 1;
        });
        
        console.log('Grouped items by DC + Product:', groupedItems);
        
        // Convert grouped items to bill items array
        const billItems = Object.values(groupedItems).map((group) => {
          // Try to find default price
          const priceKey = `${group.baseName}|${group.productType}`;
          const defaultPrice = productPrices[priceKey] || 0;
          const qty = group.quantity;
          const amount = qty * defaultPrice;
          
          return {
            description: `DC No: ${group.dcNumber} - ${group.productName}`,
            cylinderNumbers: group.cylinderNumbers.join(', '),
            hsnCode: '9973',
            qty: qty,
            rate: defaultPrice,
            amount: amount
          };
        });
        
        console.log('Generated bill items:', billItems);
        setItems(billItems);
        
        // Switch to bill view
        setShowBillSetup(false);
        alert(`Found ${details.length} delivery record(s)`);
      } else {
        alert("No delivered and received items found for the selected date range");
        setItems([{ description: "", cylinderNumbers: "", hsnCode: "", qty: "", rate: "", amount: 0 }]);
      }
    } catch (err) {
      console.error('Error fetching delivered details:', err);
      alert(`Error: ${err.message}`);
      setDeliveredDetails([]);
      setItems([{ description: "", cylinderNumbers: "", hsnCode: "", qty: "", rate: "", amount: 0 }]);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === 'qty' || field === 'rate') {
      const qty = parseFloat(newItems[index].qty) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      newItems[index].amount = qty * rate;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      description: "",
      cylinderNumbers: "",
      hsnCode: "",
      qty: "",
      rate: "",
      amount: 0
    }]);
  };

  const calculateTotals = () => {
    const totalBeforeTax = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const cgst = totalBeforeTax * 0.09; // 9% CGST
    const sgst = totalBeforeTax * 0.09; // 9% SGST
    const igst = totalBeforeTax * 0.18; // 18% IGST
    const totalTax = cgst + sgst;
    const totalAfterTax = totalBeforeTax + totalTax;

    setTaxDetails({
      totalBeforeTax,
      cgst,
      sgst,
      igst,
      totalTax,
      totalAfterTax
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    try {
      const billData = {
        ...formData,
        items,
        taxDetails,
        timestamp: new Date().toISOString()
      };

      console.log('Saving bill:', billData);
      alert("Bill saved successfully!");
    } catch (error) {
      console.error('Error saving bill:', error);
      alert("Error saving bill!");
    }
  };

  return (
    <>
      {showBillSetup ? (
        // Date Selection Screen
        <div className="bill-setup-container" style={{ 
          padding: '40px 20px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
              Generate Bill
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Customer Name <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                name="customerName"
                value={formData.customerName}
                onChange={handleCustomerChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Customer</option>
                {customers.map((customer, idx) => (
                  <option key={idx} value={customer.name}>{customer.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                From Date <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleFormChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                To Date <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleFormChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <button
              onClick={fetchBillItems}
              style={{
                width: '100%',
                padding: '12px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.background = '#45a049'}
              onMouseOut={(e) => e.target.style.background = '#4CAF50'}
            >
              GENERATE BILL
            </button>
          </div>
        </div>
      ) : (
        // Floating Modal Bill View
        <div className="bill-modal-overlay">
          <div className="bill-modal-wrapper">
            <div className="bill-modal-content">
              {/* Action Buttons - Only visible on screen */}
              <div className="bill-actions no-print">
                <button onClick={() => setShowBillSetup(true)} className="btn-new">✕ Close</button>
                <button onClick={handlePrint} className="btn-print">🖨️ Print</button>
                <button onClick={handleSave} className="btn-save">💾 Save</button>
                <button onClick={generateInvoiceNumber} className="btn-new">🔄 New Invoice</button>
              </div>

              {/* Bill Content */}
              <div id="printable-invoice" className="invoice-container">
        {/* Header */}
        <div className="invoice-header">
          <div className="company-logo">
            <div className="logo-circle">VSR</div>
          </div>
          <div className="company-info">
            <h1>V.S.R. ENTERPRISES</h1>
            <p className="company-subtitle">Suppliers of: Oxygen, Nitrogen, LPG and All types of Industrial Gases</p>
            <p className="company-subtitle">Stockiest: Welding Electrodes & Welding Accessories</p>
            <p className="company-subtitle">Dealer: PREMIER OXYGEN</p>
            <p className="company-address">D.No. 1-1-4/E, Beside Hi-Choice Hotel, Fathenagar Main Road, Hyderabad - 500 018.</p>
            <p className="company-contact">Email: vsrenterprises2006@gmail.com</p>
            <p className="company-gstin">GSTIN: 36AFPPV0731F1ZA</p>
          </div>
          <div className="contact-box">
            <p>Cell: 99495 71828</p>
            <p>83412 60677</p>
          </div>
        </div>

        <div className="tax-invoice-title">TAX INVOICE</div>

        {/* Customer Details & Invoice Info */}
        <div className="invoice-info-section">
          <div className="customer-details">
            <div className="form-row">
              <label>M/s.</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleCustomerChange}
                list="customer-list"
                placeholder="Customer Name"
                className="editable-input"
              />
              <datalist id="customer-list">
                {customers.map((customer, idx) => (
                  <option key={idx} value={customer.name} />
                ))}
              </datalist>
            </div>
            <div className="form-row">
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleFormChange}
                placeholder="Customer Address"
                className="editable-input address-input"
                rows="3"
              />
            </div>
            <div className="form-row">
              <label>GSTIN:</label>
              <input
                type="text"
                name="customerGSTIN"
                value={formData.customerGSTIN}
                onChange={handleFormChange}
                placeholder="Customer GSTIN"
                className="editable-input"
              />
            </div>
            <div className="form-row" style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              <strong>Billing Period:</strong> {formData.fromDate} to {formData.toDate}
            </div>
          </div>

          <div className="invoice-details">
            <div className="form-row">
              <label>Invoice No:</label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleFormChange}
                className="editable-input"
              />
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="editable-input"
              />
            </div>
            <div className="form-row">
              <label>Date of Supply:</label>
              <input
                type="date"
                name="dateOfSupply"
                value={formData.dateOfSupply}
                onChange={handleFormChange}
                className="editable-input"
              />
            </div>
            <div className="form-row">
              <label>Vehicle No:</label>
              <input
                type="text"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleFormChange}
                className="editable-input"
              />
            </div>
            <div className="form-row">
              <label>State:</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleFormChange}
                className="editable-input small"
              />
              <label>Code:</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleFormChange}
                className="editable-input small"
              />
            </div>
          </div>
        </div>

        {/* Product Details Section removed as requested */}

        {/* Items Table */}
        <table className="items-table">
          <thead>
            <tr>
              <th style={{width: '50px'}}>S.No</th>
              <th>PRODUCT DESCRIPTION</th>
              <th style={{width: '120px'}}>H.S.N Code</th>
              <th style={{width: '80px'}}>Qty</th>
              <th style={{width: '100px'}}>Rate</th>
              <th style={{width: '120px'}}>Amount ₹</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <div className="description-cell">
                    <div className="description-main">{item.description}</div>
                    {item.cylinderNumbers && (
                      <div className="description-cylinders">{item.cylinderNumbers}</div>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    value={item.hsnCode}
                    onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                    placeholder="HSN Code"
                    className="editable-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                    placeholder="Qty"
                    className="editable-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    placeholder="Rate"
                    className="editable-input"
                  />
                </td>
                <td>₹{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          <tr className="no-print">
              <td colSpan="6">
                <button onClick={addItem} className="btn-add-item">➕ Add Item</button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer Section */}
        <div className="invoice-footer">
          <div className="bank-details">
            <h3>BANK DETAILS</h3>
            <p><strong>Bank:</strong> HDFC BANK</p>
            <p><strong>Branch:</strong> Balanagar</p>
            <p><strong>A/c. No:</strong> 07002000007496</p>
            <p><strong>Branch IFSC:</strong> HDFC0000700</p>
            <div className="total-amount-words">
              <label>Total Invoice Amount:</label>
              <input type="text" className="editable-input" placeholder="Amount in words" />
            </div>
          </div>

          <div className="tax-summary">
            <div className="tax-row">
              <label>Total Amount Before Tax:</label>
              <span>₹{taxDetails.totalBeforeTax.toFixed(2)}</span>
            </div>
            <div className="tax-row">
              <label>Add: CGST @ 9%:</label>
              <span>₹{taxDetails.cgst.toFixed(2)}</span>
            </div>
            <div className="tax-row">
              <label>Add: SGST @ 9%:</label>
              <span>₹{taxDetails.sgst.toFixed(2)}</span>
            </div>
            <div className="tax-row">
              <label>Add: IGST @ 18%:</label>
              <span>₹{taxDetails.igst.toFixed(2)}</span>
            </div>
            <div className="tax-row">
              <label>Total Tax Amount: GST:</label>
              <span>₹{taxDetails.totalTax.toFixed(2)}</span>
            </div>
            <div className="tax-row total">
              <label><strong>Total Amount After Tax:</strong></label>
              <span><strong>₹{taxDetails.totalAfterTax.toFixed(2)}</strong></span>
            </div>
          </div>
        </div>

        <div className="signature-section">
          <div className="receiver-signature">
            <p>Receiver's Signature</p>
          </div>
          <div className="company-signature">
            <p>For V.S.R. ENTERPRISES</p>
          </div>
        </div>
      </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GenerateBill;
