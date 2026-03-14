    // CUSTOMER DETAILS WEB APP
    // Deploy this as a separate web app for customer management and billing

    function doGet(e) {
    try {
        const ss = SpreadsheetApp.openById('1Sl85NLIvtA1VzZlGQcMD9__zD0ihYwobdoW790AhX1E');
        
        // Initialize Customer Details sheet on first access
        getOrCreateCustomerSheet(ss);
        
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
        }
        
        return ContentService
        .createTextOutput('Customer API is working. Use POST to submit data.')
        .setMimeType(ContentService.MimeType.TEXT);
        
    } catch (error) {
        return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    }

    function doPost(e) {
    try {
        Logger.log('POST Request received');
        
        if (!e.postData || !e.postData.contents) {
        Logger.log('No postData received');
        throw new Error('No data received');
        }
        
        Logger.log('Raw data: ' + e.postData.contents);
        
        const data = JSON.parse(e.postData.contents);
        Logger.log('Parsed data type: ' + data.type);
        
    const ss = SpreadsheetApp.openById('1Sl85NLIvtA1VzZlGQcMD9__zD0ihYwobdoW790AhX1E');
        const customerSheet = getOrCreateCustomerSheet(ss);
        Logger.log('Customer sheet obtained, last row: ' + customerSheet.getLastRow());
        
        if (data.type === 'addCustomer') {
        Logger.log('Adding customer: ' + JSON.stringify(data));
        Logger.log('Sheet name: ' + customerSheet.getName());
        Logger.log('Before append - Last row: ' + customerSheet.getLastRow());
        
        // Check for duplicate GST number if provided
        if (data.gstNumber && data.gstNumber.trim() !== '') {
            const lastRow = customerSheet.getLastRow();
            if (lastRow > 1) {
                const gstColumn = customerSheet.getRange(2, 3, lastRow - 1, 1).getValues();
                const newGST = data.gstNumber.trim().toUpperCase();
                const existingGST = gstColumn.find(row => row[0] && row[0].toString().trim().toUpperCase() === newGST);
                if (existingGST) {
                    Logger.log('Duplicate GST found: ' + data.gstNumber);
                    throw new Error('GST Number already exists. Please use a unique GST Number.');
                }
            }
        }
        
        customerSheet.appendRow([
            data.name || '',
            data.phone || '',
            data.gstNumber || '',
            data.address || ''
        ]);
        
        Logger.log('After append - Last row: ' + customerSheet.getLastRow());
        
        SpreadsheetApp.flush(); // Force write to sheet
        
        Logger.log('Customer added successfully to row ' + customerSheet.getLastRow());
        Logger.log('Verifying data written...');
        
        const lastRowData = customerSheet.getRange(customerSheet.getLastRow(), 1, 1, 4).getValues();
        Logger.log('Last row data: ' + JSON.stringify(lastRowData));
        
        } else if (data.type === 'updateCustomer') {
        Logger.log('Updating customer at row: ' + data.rowIndex);
        
        const rowIndex = data.rowIndex;
        customerSheet.getRange(rowIndex, 1).setValue(data.name || '');
        customerSheet.getRange(rowIndex, 2).setValue(data.phone || '');
        customerSheet.getRange(rowIndex, 3).setValue(data.gstNumber || '');
        customerSheet.getRange(rowIndex, 4).setValue(data.address || '');
        
        SpreadsheetApp.flush();
        
        Logger.log('Customer updated successfully');
        
        } else if (data.type === 'deleteCustomer') {
        Logger.log('Deleting customer at row: ' + data.rowIndex);
        
        customerSheet.deleteRow(data.rowIndex);
        
        SpreadsheetApp.flush();
        
        Logger.log('Customer deleted successfully');
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

    function getOrCreateCustomerSheet(ss) {
    let customerSheet = ss.getSheetByName('CustomerDetails');
    
    if (!customerSheet) {
        customerSheet = ss.insertSheet('CustomerDetails');
        customerSheet.appendRow(['Name', 'Phone', 'GST Number', 'Address']);
        
        const headerRange = customerSheet.getRange(1, 1, 1, 4);
        headerRange.setFontWeight('bold');
        headerRange.setBackground('#2196F3');
        headerRange.setFontColor('#FFFFFF');
        
        SpreadsheetApp.flush();
        
        Logger.log('Created CustomerDetails sheet with headers');
    }
    
    Logger.log('Sheet name: ' + customerSheet.getName() + ', Last row: ' + customerSheet.getLastRow());
    
    return customerSheet;
    }
