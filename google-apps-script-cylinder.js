        // CYLINDER DETAILS WEB APP
        // Deploy this as a separate web app for cylinder delivery/received operations

        function doGet(e) {
        try {
            const action = e.parameter.action;
            
            if (action === 'getPendingDeliveries') {
            const customer = e.parameter.customer;
            const ss = SpreadsheetApp.openById('1XUOuTC2Ge0t8XfH2prpSk4wvwG_HGuFJKF5H99RapTs');
            const cylinderSheet = ss.getSheetByName('Cylinder Details') || ss.getSheets()[0];
            
            const lastRow = cylinderSheet.getLastRow();
            const pendingDeliveries = [];
            
            if (lastRow >= 2) {
                const data = cylinderSheet.getRange(2, 1, lastRow - 1, 12).getValues();
                
                data.forEach((row, index) => {
                // Only include rows where Received Date (col 9, index 8) is empty
                // If customer parameter provided, filter by customer name
                if (!row[8] && (!customer || row[4] === customer)) {
                    pendingDeliveries.push({
                    dcNumber: row[1],
                    itemType: row[2],
                    itemName: row[3],
                    customerName: row[4],
                    cylinderNumber: row[5],
                    cylinderType: row[6],
                    deliveredDate: row[7] ? Utilities.formatDate(new Date(row[7]), Session.getScriptTimeZone(), 'dd/MM/yyyy') : '',
                    rent: row[10]
                    });
                }
                });
            }
            
            return ContentService
                .createTextOutput(JSON.stringify({ 
                success: true, 
                data: pendingDeliveries
                }))
                .setMimeType(ContentService.MimeType.JSON);
            }
            
            if (action === 'generateBill') {
            const customer = e.parameter.customer;
            const startDate = e.parameter.startDate;
            const endDate = e.parameter.endDate;
            
            const ss = SpreadsheetApp.openById('1XUOuTC2Ge0t8XfH2prpSk4wvwG_HGuFJKF5H99RapTs');
            const cylinderSheet = ss.getSheetByName('Cylinder Details') || ss.getSheets()[0];
            
            // Get customer details from Customer spreadsheet
            const customerSS = SpreadsheetApp.openById('1Sl85NLIvtA1VzZlGQcMD9__zD0ihYwobdoW790AhX1E');
            const customerSheet = customerSS.getSheetByName('CustomerDetails');
            
            let customerInfo = null;
            if (customerSheet && customerSheet.getLastRow() > 1) {
                const customerData = customerSheet.getRange(2, 1, customerSheet.getLastRow() - 1, 4).getValues();
                const foundCustomer = customerData.find(row => row[0] === customer);
                if (foundCustomer) {
                customerInfo = {
                    name: foundCustomer[0],
                    phone: foundCustomer[1],
                    gstNumber: foundCustomer[2],
                    address: foundCustomer[3]
                };
                }
            }
            
            // Get delivery data
            const lastRow = cylinderSheet.getLastRow();
            const items = [];
            let total = 0;
            
            if (lastRow >= 2) {
                const data = cylinderSheet.getRange(2, 1, lastRow - 1, 12).getValues();
                
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
            }
            
            return ContentService
                .createTextOutput(JSON.stringify({ 
                success: true, 
                data: {
                    customer: customerInfo,
                    items: items,
                    total: total.toFixed(2)
                }
                }))
                .setMimeType(ContentService.MimeType.JSON);
            }
            
            return ContentService
            .createTextOutput('Cylinder Details API is working. Use POST to submit data.')
            .setMimeType(ContentService.MimeType.TEXT);
            
        } catch (error) {
            return ContentService
            .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
        }
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
            sheet = initializeCylinderSheet(ss);
            }
            
            if (data.type === 'delivery') {
            Logger.log('Adding delivery: ' + JSON.stringify(data));
            
            // Check for duplicate DC Number
            const lastRow = sheet.getLastRow();
            if (lastRow > 1) {
                const dcColumn = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
                const newDC = data.dcNumber.trim().toUpperCase();
                const existingDC = dcColumn.find(row => row[0] && row[0].toString().trim().toUpperCase() === newDC);
                if (existingDC) {
                Logger.log('Duplicate DC Number found: ' + data.dcNumber);
                throw new Error('DC Number already exists. Please use a unique DC Number.');
                }
            }
            
            // Calculate next S.No
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
            Logger.log('Processing received: ' + JSON.stringify(data));
            
            // Find and update the matching delivery row
            const lastRow = sheet.getLastRow();
            
            if (lastRow < 2) {
                throw new Error('No delivery records found. Please deliver the cylinder first.');
            }
            
            const dataRange = sheet.getRange(2, 1, lastRow - 1, 12);
            const values = dataRange.getValues();
            let found = false;
            
            for (let i = 0; i < values.length; i++) {
                // Match only by Cylinder Number (col 6) and Received Date is empty (col 9)
                const cylNumberMatch = values[i][5] && data.cylinderNumber && 
                                    values[i][5].toString().trim().toUpperCase() === data.cylinderNumber.toString().trim().toUpperCase();
                
                if (cylNumberMatch && !values[i][8]) { // Column 9 (index 8) should be empty
                
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
                
                SpreadsheetApp.flush();
                
                Logger.log('Received updated successfully at row ' + rowNumber);
                found = true;
                break;
                }
            }
            
            if (!found) {
                throw new Error('No matching delivery found for cylinder number: ' + data.cylinderNumber + '. Please check the cylinder number or deliver it first.');
            }
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

        function initializeCylinderSheet(ss) {
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
        
        // Initialize headers if empty
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
            
            SpreadsheetApp.flush();
        }
                        
        return cylinderSheet;
        }
