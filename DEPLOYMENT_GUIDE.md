# TWO WEB APPS DEPLOYMENT GUIDE

## Overview
Your project now uses TWO separate Google Apps Script web apps:
1. **Cylinder Details Web App** - Handles delivery and received operations
2. **Customer Details Web App** - Handles customer management and billing

---

## STEP 1: Deploy Cylinder Details Web App

### 1.1 Create Script in Google Apps Script
1. Go to https://script.google.com/
2. Click **New Project**
3. Name it: **"Cylinder Details API"**
4. Copy ALL code from `google-apps-script-cylinder.js`
5. Paste it into the script editor
6. Click **Save** (💾)

### 1.2 Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Click gear icon ⚙️ → Select **Web app**
3. Settings:
   - **Description**: Cylinder Details API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** when prompted
6. **COPY THE WEB APP URL** → Save it as `CYLINDER_WEB_APP_URL`

---

## STEP 2: Deploy Customer Details Web App

### 2.1 Create Script in Google Apps Script
1. Go to https://script.google.com/
2. Click **New Project**
3. Name it: **"Customer Details API"**
4. Copy ALL code from `google-apps-script-customer.js`
5. Paste it into the script editor
6. Click **Save** (💾)

### 2.2 Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Click gear icon ⚙️ → Select **Web app**
3. Settings:
   - **Description**: Customer Details API
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click **Deploy**
5. **Authorize** when prompted
6. **COPY THE WEB APP URL** → Save it as `CUSTOMER_WEB_APP_URL`

---

## STEP 3: Update React Files with Both URLs

You need to update the following files with the correct URLs:

### Update DeliveryDetails.jsx
- Line ~38: Replace with `CYLINDER_WEB_APP_URL`
- Line ~105: Replace with `CUSTOMER_WEB_APP_URL` (for fetching customers)

### Update RecievedDetails.jsx
- Line ~28: Replace with `CYLINDER_WEB_APP_URL`
- Line ~93: Replace with `CUSTOMER_WEB_APP_URL` (for fetching customers)

### Update AddCustomer.jsx
- Line ~23: Replace with `CUSTOMER_WEB_APP_URL`

### Update EditCustomer.jsx
- Line ~21: Replace with `CUSTOMER_WEB_APP_URL`
- Line ~55: Replace with `CUSTOMER_WEB_APP_URL`
- Line ~78: Replace with `CUSTOMER_WEB_APP_URL`

### Update GenerateBill.jsx
- Line ~21: Replace with `CUSTOMER_WEB_APP_URL`
- Line ~55: Replace with `CUSTOMER_WEB_APP_URL`

---

## STEP 4: Test the Setup

1. **Test Customer Management:**
   - Go to http://localhost:5173/
   - Click "Add Customer"
   - Fill in customer details
   - Click "Add Customer"
   - Check "Customer Details" sheet in Google Sheets

2. **Test Cylinder Delivery:**
   - Click "Delivered Details"
   - Select customer from dropdown
   - Fill in delivery details
   - Click "Save Entry"
   - Check "Cylinder Details" sheet in Google Sheets

3. **Test Cylinder Received:**
   - Click "Received Details"
   - Fill in received details
   - Click "Save Entry"
   - Check updated row in "Cylinder Details" sheet

4. **Test Generate Bill:**
   - Click "Generate Bill"
   - Select customer and date range
   - Click "Generate Bill"
   - View and print the bill

---

## Google Sheets Structure

Your spreadsheet will have 2 sheets:

### Sheet 1: Cylinder Details
- S.No, DC Number, Item Type, Item Name, Customer Name, Cylinder Number, Cylinder Type, Delivered Date, Received Date, No of Days, Rent (per day), Total Cost

### Sheet 2: Customer Details
- Name, Phone, GST Number, Address

---

## Troubleshooting

- **No customers in dropdown?** Make sure you've added customers first using "Add Customer"
- **Data not saving?** Check Apps Script **Executions** tab for error logs
- **Authorization errors?** Re-deploy and re-authorize the web apps
- **Wrong sheet?** Verify the spreadsheet ID in both script files is correct

---

## Benefits of Two Web Apps

✅ **Better separation** - Cylinder and Customer operations are independent  
✅ **Easier debugging** - Check execution logs for each web app separately  
✅ **Better performance** - Each web app handles fewer operations  
✅ **Clearer code** - Each script focuses on one domain
