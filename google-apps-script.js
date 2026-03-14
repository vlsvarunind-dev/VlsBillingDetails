function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById('1XUOuTC2Ge0t8XfH2prpSk4wvwG_HGuFJKF5H99RapTs');
    
    // Initialize sheets on first access
    initializeSheets(ss);
    
    const action = e.parameter.action;
    
    if (action === 'getCustomers') {
      const customerSheet = getOrCreateCustomerSheet(ss);
      const lastRow = customerSheet.getLastRow();
      
      if (lastRow < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, data: [] }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = customerSheet.getRange(2, 1, lastRow - 1, 4).getValues();
      const customers = data.map((row, index) => ({
        name: row[0],
        phone: row[1],
        gstNumber: row[2],
        address: row[3],
        rowIndex: index + 2
      }));
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, data: customers }))
        .setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'generateBill') {
      const customer = e.parameter.customer;
      const startDate = e.parameter.startDate;
      const endDate = e.parameter.endDate;
      
      const sheet = ss.getSheetByName('Cylinder Details') || ss.getSheets()[0];
      const customerSheet = getOrCreateCustomerSheet(ss);
      
      // Get customer details 
      const customerData = customerSheet.getRange(2, 1, customerSheet.getLastRow() - 1, 4).getValues();
      const customerInfo = customerData.find(row => row[0] === customer);
      
      // Get delivery data
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, data: { customer: null, items: [], total: 0 } }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
      const items = [];
      let total = 0;
      
      data.forEach(row => {
        if (row[4] === customer && row[8]) { // Customer name matches and has received date
          const receivedDate = new Date(row[8]);
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          if (receivedDate >= start && receivedDate <= end) {
            const item = {
              date: Utilities.formatDate(new Date(row[7]), Session.getScriptTimeZone(), 'dd/MM/yyyy'),
              description: `${row[2]} - ${row[6] || row[3]}`,
              days: row[9] || 0,
              rate: row[10] || 0,
              amount: row[11] || 0
            };
            items.push(item);
            total += parseFloat(row[11] || 0);
          }
        }
      });
      
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          data: {
            customer: customerInfo ? {
              name: customerInfo[0],
              phone: customerInfo[1],
              gstNumber: customerInfo[2],
              address: customerInfo[3]
            } : null,
            items: items,
            total: total.toFixed(2)
          }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput('Web app is working. Use POST to submit data.')
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateCustomerSheet(ss) {
  let customerSheet = ss.getSheetByName('Customer Details');
  
  if (!customerSheet) {
    customerSheet = ss.insertSheet('Customer Details');
    customerSheet.appendRow(['Name', 'Phone', 'GST Number', 'Address']);
    
    const headerRange = customerSheet.getRange(1, 1, 1, 4);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#2196F3');
    headerRange.setFontColor('#FFFFFF');
  }
  
  return customerSheet;
}

function initializeSheets(ss) {
  // Get or create Cylinder Details sheet
  let cylinderSheet = ss.getSheetByName('Cylinder Details');
  if (!cylinderSheet) {
    // Check if first sheet exists and rename it
    const sheets = ss.getSheets();
    if (sheets.length > 0) {
      cylinderSheet = sheets[0];
      try {
        cylinderSheet.setName('Cylinder Details');
      } catch (e) {
        // If rename fails, create new sheet
        cylinderSheet = ss.insertSheet('Cylinder Details', 0);
      }
    } else {
      cylinderSheet = ss.insertSheet('Cylinder Details', 0);
    }
  }
  
  // Initialize Cylinder Details headers if empty
  if (cylinderSheet.getLastRow() === 0) {
    cylinderSheet.appendRow([
      'S.No',
      'DC Number',
      'Item Type',
      'Item Name',
      'Customer Name',
      'Cylinder Number',
      'Cylinder Type',
      'Delivered Date',
      'Received Date',
      'No of Days',
      'Rent (per day)',
      'Total Cost'
    ]);
    
    const headerRange = cylinderSheet.getRange(1, 1, 1, 12);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('#FFFFFF');
  }
  
  // Create Customer Details sheet
  getOrCreateCustomerSheet(ss);
  
  return cylinderSheet;
}

// Manual setup function - run this once from Apps Script editor
function setupSheets() {
  const ss = SpreadsheetApp.openById('1XUOuTC2Ge0t8XfH2prpSk4wvwG_HGuFJKF5H99RapTs');
  
  // Rename first sheet
  const firstSheet = ss.getSheets()[0];
  firstSheet.setName('Cylinder Details');
  
  // Create headers if needed
  if (firstSheet.getLastRow() === 0) {
    firstSheet.appendRow([
      'S.No',
      'DC Number',
      'Item Type',
      'Item Name',
      'Customer Name',
      'Cylinder Number',
      'Cylinder Type',
      'Delivered Date',
      'Received Date',
      'No of Days',
      'Rent (per day)',
      'Total Cost'
    ]);
    
    const headerRange = firstSheet.getRange(1, 1, 1, 12);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4CAF50');
    headerRange.setFontColor('#FFFFFF');
  }
  
  // Create Customer Details sheet
  getOrCreateCustomerSheet(ss);
  
  Logger.log('Sheets initialized successfully!');
  return 'Setup complete! Sheets: Cylinder Details & Customer Details created.';
}

  function doPost(e) {
    try {
      if (!e.postData || !e.postData.contents) {
        throw new Error('No data received');
      }
      
      const data = JSON.parse(e.postData.contents);
      const ss = SpreadsheetApp.openById('1XUOuTC2Ge0t8XfH2prpSk4wvwG_HGuFJKF5H99RapTs');
      
      // Get Cylinder Details sheet
      let sheet = ss.getSheetByName('Cylinder Details');
      if (!sheet) {
        sheet = initializeSheets(ss);
      }
      
      if (data.type === 'delivery') {
        Logger.log('Adding delivery: ' + JSON.stringify(data));
        
        // Calculate next S.No
        const lastRow = sheet.getLastRow();
        const nextSNo = lastRow > 0 ? lastRow : 1;
        
        // Append new delivery row
        sheet.appendRow([
          nextSNo,  // S.No
          data.dcNumber || '',
          data.itemType || '',
          data.itemName || '',
          data.customerName || '',
          data.cylinderNumber || '',
          data.cylinderType || '',
          data.date || '', // Delivered Date (column 8)
          '', // Received Date (empty for new delivery) (column 9)
          '', // No of Days (empty until received) (column 10)
          data.rent || '',
          '' // Total Cost (will be calculated when received)
        ]);
        
        SpreadsheetApp.flush(); // Force write to sheet
        
        Logger.log('Delivery added successfully to row ' + sheet.getLastRow());
      } else if (data.type === 'received') {
        // Find and update the matching delivery row
        const lastRow = sheet.getLastRow();
        
        if (lastRow < 2) {
          throw new Error('No delivery records found. Please deliver the cylinder first.');
        }
        
        const dataRange = sheet.getRange(2, 1, lastRow - 1, 12);
        const values = dataRange.getValues();
        let found = false;
        
        for (let i = 0; i < values.length; i++) {
          // Match by: Cylinder Number (col 6), Cylinder Type (col 7), Customer Name (col 5), and Received Date is empty (col 9)
          if (values[i][5] === data.cylinderNumber && 
              values[i][6] === data.cylinderType && 
              values[i][4] === data.customerName &&
              !values[i][8]) { // Column 9 (index 8) should be empty
            
            const rowNumber = i + 2; // +2 because: +1 for header, +1 for 0-based index
            
            // Update Received Date (column 9)
            sheet.getRange(rowNumber, 9).setValue(data.date);
            
            // Calculate number of days
            const deliveredDate = new Date(values[i][7]); // Column 8 (index 7) is Delivered Date
            const receivedDate = new Date(data.date);
            const noOfDays = Math.ceil((receivedDate - deliveredDate) / (1000 * 60 * 60 * 24));
            
            // Update No of Days (column 10)
            sheet.getRange(rowNumber, 10).setValue(noOfDays);
            
            // Calculate and update Total Cost (column 12)
            const rentPerDay = values[i][10]; // Column 11 (index 10) is Rent
            if (rentPerDay) {
              const totalCost = noOfDays * parseFloat(rentPerDay);
              sheet.getRange(rowNumber, 12).setValue(totalCost);
            }
            
            found = true;
            break;
          }
        }
        
        if (!found) {
          throw new Error('No matching delivery found for this cylinder. Please check cylinder number, type, and customer name, or deliver it first.');
        }
      } else if (data.type === 'addCustomer') {
        const customerSheet = getOrCreateCustomerSheet(ss);
        
        Logger.log('Adding customer: ' + JSON.stringify(data));
        
        customerSheet.appendRow([
          data.name || '',
          data.phone || '',
          data.gstNumber || '',
          data.address || ''
        ]);
        
        SpreadsheetApp.flush(); // Force write to sheet
        
        Logger.log('Customer added successfully to row ' + customerSheet.getLastRow());
      } else if (data.type === 'updateCustomer') {
        const customerSheet = getOrCreateCustomerSheet(ss);
        const rowIndex = data.rowIndex;
        
        customerSheet.getRange(rowIndex, 1).setValue(data.name || '');
        customerSheet.getRange(rowIndex, 2).setValue(data.phone || '');
        customerSheet.getRange(rowIndex, 3).setValue(data.gstNumber || '');
        customerSheet.getRange(rowIndex, 4).setValue(data.address || '');
      } else if (data.type === 'deleteCustomer') {
        const customerSheet = getOrCreateCustomerSheet(ss);
        customerSheet.deleteRow(data.rowIndex);
      }
      
      Logger.log('Success');
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (error) {
      Logger.log('Error: ' + error.toString());
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }