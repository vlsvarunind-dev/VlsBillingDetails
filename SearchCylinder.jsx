import React, { useState } from "react";
import "./SearchCylinder.css";
import { supabase } from "./supabaseClient";

function SearchCylinder({ onNavigate }) {
  const [cylinderNumber, setCylinderNumber] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!cylinderNumber.trim()) {
      alert("Please enter a cylinder number to search");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('VSRCYLINDERDATA')
        .select('*')
        .eq('cylinder_number', cylinderNumber.trim())
        .order('delivered_date', { ascending: false })
        .limit(30);
      
      if (error) {
        console.error('Supabase error:', error);
        alert(`Error searching: ${error.message}`);
      } else {
        setSearchResults(data || []);
        if (data.length === 0) {
          alert("No records found for this cylinder number");
        } else {
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error searching cylinder: ${error.message}`);
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
    <div className="search-cylinder-container">
      <h2>Search Cylinder Number</h2>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <label>Cylinder Number</label>
          <input
            type="text"
            placeholder="Enter cylinder number (e.g., C001)"
            value={cylinderNumber}
            onChange={(e) => setCylinderNumber(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button type="submit" className="btn-search" disabled={isLoading}>
          {isLoading ? "Searching..." : "🔍 Search"}
        </button>
      </form>

      <button onClick={() => onNavigate("delivery")} className="btn-back">
        ← Back to Home
      </button>

      {showModal && (
        <div className="search-modal-overlay" onClick={closeModal}>
          <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <h2>Search Results for: {cylinderNumber}</h2>
              <button className="close-button" onClick={closeModal}>✕</button>
            </div>

            <div className="results-container">
              <h3>{searchResults.length} record(s) found</h3>
              <div className="table-wrapper">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Customer Name</th>
                      <th>DC Number</th>
                      <th>Product Name</th>
                      <th>Cylinder Type</th>
                      <th>Delivered Date</th>
                      <th>Received Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((result, index) => (
                      <tr key={result.id}>
                        <td>{index + 1}</td>
                        <td>{result.customer_name}</td>
                        <td>{result.dc_number || "-"}</td>
                        <td>{result.product_name || "-"}</td>
                        <td>{result.cylinder_type || "-"}</td>
                        <td>{formatDate(result.delivered_date)}</td>
                        <td>{formatDate(result.received_date)}</td>
                        <td>
                          <span className={`status-badge ${result.received_date ? 'received' : 'pending'}`}>
                            {result.received_date ? 'Received' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchCylinder;
