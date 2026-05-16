import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./ViewDC.css";

function ViewDC({ onNavigate }) {
  const [showDCPreview, setShowDCPreview] = useState(false);
  const [dcNumber, setDcNumber] = useState("");
  const [dcEntries, setDcEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDCDetails = async () => {
    if (!dcNumber || dcNumber.trim() === "") {
      alert("Please enter a DC Number");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("VSRCYLINDERDATA")
        .select("*")
        .eq("type", "delivery")
        .eq("dc_number", dcNumber.trim())
        .order("delivered_date", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        alert("Error fetching DC details: " + error.message);
      } else if (!data || data.length === 0) {
        alert(`No DC found with number: ${dcNumber}`);
      } else {
        setDcEntries(data);
        setShowDCPreview(true);
      }
    } catch (error) {
      console.error("Error fetching DC details:", error);
      alert("Error fetching DC details!");
    } finally {
      setLoading(false);
    }
  };

  const fetchLastDC = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("VSRCYLINDERDATA")
        .select("dc_number")
        .eq("type", "delivery")
        .not("dc_number", "is", null)
        .order("dc_number", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Supabase error:", error);
        alert("Error fetching last DC: " + error.message);
      } else if (!data || data.length === 0) {
        alert("No DC entries found");
      } else {
        const highestDCNumber = data[0].dc_number;
        setDcNumber(highestDCNumber);
        
        const { data: allDCData, error: dcError } = await supabase
          .from("VSRCYLINDERDATA")
          .select("*")
          .eq("type", "delivery")
          .eq("dc_number", highestDCNumber)
          .order("delivered_date", { ascending: false });

        if (dcError) {
          console.error("Supabase error:", dcError);
          alert("Error fetching DC details: " + dcError.message);
        } else {
          setDcEntries(allDCData || []);
          setShowDCPreview(true);
        }
      }
    } catch (error) {
      console.error("Error fetching last DC:", error);
      alert("Error fetching last DC!");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  };

  const calculateTotal = () => {
    return dcEntries.reduce((sum, entry) => sum + (entry.count || 1), 0);
  };

  return (
    <>
      {!showDCPreview ? (
        <div className="dc-setup-container">
          <div className="dc-form-card">
            <h2 className="dc-form-title">View Delivery Challan</h2>
            
            <div className="dc-input-group">
              <label className="dc-label">
                DC Number <span className="required">*</span>
              </label>
              <input
                type="text"
                value={dcNumber}
                onChange={(e) => setDcNumber(e.target.value)}
                placeholder="Enter DC Number"
                onKeyPress={(e) => e.key === 'Enter' && fetchDCDetails()}
                className="dc-input"
                required
              />
            </div>

            <div className="dc-button-group">
              <button
                onClick={fetchDCDetails}
                disabled={loading}
                className="btn-view-dc"
              >
                {loading ? 'LOADING...' : '👁️ VIEW DC'}
              </button>
              <button
                onClick={fetchLastDC}
                disabled={loading}
                className="btn-view-last-dc"
              >
                {loading ? 'LOADING...' : '📄 VIEW LAST DC'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="dc-modal-overlay">
          <div className="dc-modal-wrapper">
            <div className="dc-modal-content">
              <button 
                onClick={() => { setShowDCPreview(false); setDcNumber(""); }} 
                className="btn-close-corner"
                title="Close"
              >
                ✕
              </button>

              <div className="dc-container">
                <div className="dc-header">
                  <h2>Delivery Challan Details</h2>
                  <div className="dc-number">DC Number: <strong>{dcNumber}</strong></div>
                </div>

                {dcEntries.length > 0 && (
                  <div className="dc-info-section">
                    <div className="info-row">
                      <span className="info-label">Customer:</span>
                      <span className="info-value">{dcEntries[0].customer_name || 'N/A'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{formatDate(dcEntries[0].delivered_date)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total Items:</span>
                      <span className="info-value">{dcEntries.length}</span>
                    </div>
                  </div>
                )}

                <div className="dc-table-wrapper">
                  <table className="dc-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Product Name</th>
                        <th>Product Type</th>
                        <th>Cylinder Number</th>
                        <th>Cylinder Type</th>
                        <th>Quantity</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dcEntries.map((entry, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{entry.product_name || 'N/A'}</td>
                          <td>{entry.product_type || 'N/A'}</td>
                          <td>{entry.cylinder_number || '-'}</td>
                          <td>{entry.cylinder_type || '-'}</td>
                          <td style={{ textAlign: 'center' }}>{entry.count || 1}</td>
                          <td>{formatDate(entry.delivered_date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="dc-summary">
                  <strong>Total Quantity: {calculateTotal()}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ViewDC;
