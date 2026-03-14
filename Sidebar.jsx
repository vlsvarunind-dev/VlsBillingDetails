import React from "react";
import "./Sidebar.css";

function Sidebar({ activeView, onNavigate }) {
  return (
    <div className="sidebar">
      <h1 className="sidebar-title">VLS Billing</h1>
      
      <div className="sidebar-section">
        <div className="sidebar-section-title">Cylinder Management</div>
        <button 
          className={`sidebar-button ${activeView === 'delivery' ? 'active' : ''}`}
          onClick={() => onNavigate('delivery')}
        >
          📦 Delivered Details
        </button>
        <button 
          className={`sidebar-button ${activeView === 'received' ? 'active' : ''}`}
          onClick={() => onNavigate('received')}
        >
          ✅ Received Details
        </button>
        <button 
          className={`sidebar-button search-button ${activeView === 'searchCylinder' ? 'active' : ''}`}
          onClick={() => onNavigate('searchCylinder')}
        >
          🔍 Search Cylinder Number
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Billing</div>
        <button 
          className={`sidebar-button ${activeView === 'generateBill' ? 'active' : ''}`}
          onClick={() => onNavigate('generateBill')}
        >
          📄 Generate Bill
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Customer Management</div>
        <button 
          className={`sidebar-button ${activeView === 'addCustomer' ? 'active' : ''}`}
          onClick={() => onNavigate('addCustomer')}
        >
          ➕ Add Customer
        </button>
        <button 
          className={`sidebar-button ${activeView === 'editCustomer' ? 'active' : ''}`}
          onClick={() => onNavigate('editCustomer')}
        >
          ✏️ Edit Customer
        </button>
        <button 
          className={`sidebar-button ${activeView === 'viewCustomer' ? 'active' : ''}`}
          onClick={() => onNavigate('viewCustomer')}
        >
          👁️ View Customer Details
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Product Management</div>
        <button 
          className={`sidebar-button ${activeView === 'addProduct' ? 'active' : ''}`}
          onClick={() => onNavigate('addProduct')}
        >
          ➕ Add Product
        </button>
        <button 
          className={`sidebar-button ${activeView === 'editProduct' ? 'active' : ''}`}
          onClick={() => onNavigate('editProduct')}
        >
          ✏️ Edit Product
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
