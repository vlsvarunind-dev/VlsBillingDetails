import React, { useState } from "react";
import "./Sidebar.css";

function Sidebar({ activeView, onNavigate, onLogout, userName, userPhone }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (view) => {
    onNavigate(view);
    setIsMobileMenuOpen(false); // Close menu after navigation on mobile
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className="hamburger-icon">
          {isMobileMenuOpen ? '✕' : '☰'}
        </span>
      </button>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <h1 className="sidebar-title">VLS Billing</h1>
      
      {userName && (
        <div className="user-info">
          <div className="user-name">👤 {userName}</div>
          {userPhone && <div className="user-phone">📱 {userPhone}</div>}
        </div>
      )}
      
      <div className="sidebar-section">
        <div className="sidebar-section-title">Cylinder Management</div>
        <button 
          className={`sidebar-button ${activeView === 'delivery' ? 'active' : ''}`}
          onClick={() => handleNavigation('delivery')}
        >
          📦 Delivered Details
        </button>
        <button 
          className={`sidebar-button ${activeView === 'received' ? 'active' : ''}`}
          onClick={() => handleNavigation('received')}
        >
          ✅ Received Details
        </button>
        <button 
          className={`sidebar-button search-button ${activeView === 'searchCylinder' ? 'active' : ''}`}
          onClick={() => handleNavigation('searchCylinder')}
        >
          🔍 Search Cylinder Number
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Billing</div>
        <button 
          className={`sidebar-button ${activeView === 'generateBill' ? 'active' : ''}`}
          onClick={() => handleNavigation('generateBill')}
        >
          📄 Generate Bill
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Customer Management</div>
        <button 
          className={`sidebar-button ${activeView === 'addCustomer' ? 'active' : ''}`}
          onClick={() => handleNavigation('addCustomer')}
        >
          ➕ Add Customer
        </button>
        <button 
          className={`sidebar-button ${activeView === 'editCustomer' ? 'active' : ''}`}
          onClick={() => handleNavigation('editCustomer')}
        >
          ✏️ Edit Customer
        </button>
        <button 
          className={`sidebar-button ${activeView === 'viewCustomer' ? 'active' : ''}`}
          onClick={() => handleNavigation('viewCustomer')}
        >
          👁️ View Customer Details
        </button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-title">Product Management</div>
        <button 
          className={`sidebar-button ${activeView === 'addProduct' ? 'active' : ''}`}
          onClick={() => handleNavigation('addProduct')}
        >
          ➕ Add Product
        </button>
        <button 
          className={`sidebar-button ${activeView === 'editProduct' ? 'active' : ''}`}
          onClick={() => handleNavigation('editProduct')}
        >
          ✏️ Edit Product
        </button>
      </div>

      {onLogout && (
        <div className="sidebar-section logout-section">
          <button 
            className="sidebar-button logout-button"
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
    </>
  );
}

export default Sidebar;
