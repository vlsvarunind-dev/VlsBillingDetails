import React, { useState } from 'react'
import AddProduct from './AddProduct.jsx';
import EditProduct from './EditProduct.jsx';
import ReactDOM from 'react-dom/client'
import Sidebar from './Sidebar.jsx'
import DeliveryForm from './DeliveryDetails.jsx'
import ReceivedDetails from './RecievedDetails.jsx'
import AddCustomer from './AddCustomer.jsx'
import EditCustomer from './EditCustomer.jsx'
import GenerateBill from './GenerateBill.jsx'
import SearchCylinder from './SearchCylinder.jsx'
import ViewCustomer from './ViewCustomer.jsx'


function App() {
  const [currentPage, setCurrentPage] = useState('delivery');

  const handleNav = (page) => setCurrentPage(page);

  const renderContent = () => {
    switch(currentPage) {
      case 'delivery':
        return <DeliveryForm onNavigate={setCurrentPage} />;
      case 'received':
        return <ReceivedDetails onNavigate={setCurrentPage} />;
      case 'searchCylinder':
        return <SearchCylinder onNavigate={setCurrentPage} />;
      case 'addCustomer':
        return <AddCustomer />;
      case 'editCustomer':
        return <EditCustomer />;
      case 'viewCustomer':
        return <ViewCustomer onNavigate={setCurrentPage} />;
      case 'generateBill':
        return <GenerateBill onNavigate={setCurrentPage} />;
      case 'addProduct':
        return <AddProduct />;
      case 'editProduct':
        return <EditProduct />;
      default:
        return <DeliveryForm onNavigate={setCurrentPage} />;
    }
  }

  return (
    <React.StrictMode>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar activeView={currentPage} onNavigate={setCurrentPage} />
        <div style={{ flex: 1, padding: '30px', background: '#f5f5f5' }}>
          {renderContent()}
        </div>
      </div>
    </React.StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
