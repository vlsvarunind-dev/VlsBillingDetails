    # Google Sheets Setup Instructions

    ## Steps to Connect Your Project to Google Sheets

    ### 1. Open Your Google Spreadsheet
    - Go to: https://docs.google.com/spreadsheets/d/1XUOuTC2Ge0t8XfH2prpSk4wvwG_HGuFJKF5H99RapTs/edit

    ### 2. Create the Apps Script
    1. In the Google Sheet, click **Extensions** → **Apps Script**
    2. Delete any existing code in the editor
    3. Copy the entire content from `google-apps-script.js` file in this project
    4. Paste it into the Apps Script editor
5. Click **Save** (💾 icon)

### 3. Deploy as Web App
1. Click the **Deploy** button (top right) → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Cylinder Billing API"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Authorize** the app (grant permissions)
7. Copy the **Web app URL**

### 4. Update URLs in React Project
Replace the web app URL in these files:
- `src/DeliveryDetails.jsx` (line ~38 and ~105)
- `src/RecievedDetails.jsx` (line ~28 and ~93)
- `src/AddCustomer.jsx` (line ~23)
- `src/EditCustomer.jsx` (line ~21 and ~55 and ~78)
- `src/GenerateBill.jsx` (line ~21 and ~55)

Current URL: `https://script.google.com/macros/s/AKfycbwxYTOnzXOs2R5NT_ITjCSx2XhrKQ_1H4rIVMjl3ZtJiEo3NRHtod3dHk5YIwg_ZmDX/exec`

**⚠️ Important**: If you redeploy the script, you'll get a new URL and need to update all files again.

## Features Overview

### 📦 Cylinder Management
- **Delivered Details**: Record cylinder deliveries to customers
- **Received Details**: Record when cylinders are returned

### 👥 Customer Management
- **Add Customer**: Add new customers with name, phone, GST, and address
- **Edit Customer**: Modify or delete existing customer records

### 🧾 Billing
- **Generate Bill**: Create invoices for customers based on date range

## Data Structure

### Sheet 1: Main Cylinder Data
| Column | Field Name | Description |
|--------|------------|-------------|
| A | S.No | Auto-incremented serial number |
| B | DC Number | Delivery challan number |
| C | Item Type | Cylinder/Accessory/Spare/Other |
| D | Item Name | Name of item (for non-cylinders) |
| E | Customer Name | Customer who received the item |
| F | Cylinder Number | Unique cylinder identifier |
| G | Cylinder Type | CO2/Oxygen/Nitrogen |
| H | Delivered Date | Date item was delivered |
| I | Received Date | Date item was received back |
| J | No of Days | Calculated automatically |
| K | Rent (per day) | Daily rental rate |
| L | Total Cost | Calculated: Days × Rent |

### Sheet 2: Customers (Auto-created)
| Column | Field Name | Description |
|--------|------------|-------------|
| A | Name | Customer name |
| B | Phone | Phone number (10 digits) |
| C | GST Number | GST registration number |
| D | Address | Complete address |

## How It Works

1. **Add Customer**: Creates new customer in "Customers" sheet
2. **Delivery Entry**: Creates a new row with delivery details
3. **Received Entry**: Finds matching delivery and updates:
   - Received Date
   - Calculates No of Days
   - Calculates Total Cost
4. **Generate Bill**: Retrieves all completed transactions for a customer within date range

## Troubleshooting

- If you get permission errors, make sure you're authorized in Apps Script
- If data doesn't appear, check the web app URL is correct in all React files
- Check browser console for any error messages
- Customer dropdown will be empty until you add customers via "Add Customer"
