# VLS Billing Details - Cylinder Management System

A comprehensive web application for managing cylinder deliveries, receipts, and bill generation for V.S.R. Enterprises.

## Features

### 1. Delivery Management
- Record cylinder deliveries with DC numbers
- Support for multiple product types (Cylinders, Welding items, etc.)
- Add multiple cylinder numbers at once (comma-separated)
- Track delivery dates and customer details

### 2. Received Details
- Record cylinder returns/receipts
- Automatic filtering of pending deliveries
- Link received items with delivery records

### 3. Bill Generation
- Automated bill generation based on date ranges
- Groups items by DC number and product type
- Professional invoice format with company branding
- Includes:
  - Customer details and GSTIN
  - Itemized list with cylinder numbers
  - Tax calculations (CGST, SGST, IGST)
  - Bank details
  - Print-optimized layout

### 4. Customer Management
- Add and manage customer information
- Store customer addresses and GST numbers
- Quick customer selection in forms

### 5. Product Management
- Manage different product types
- Support for various cylinder types (7 kg, 45 kg, 1.5 kg)
- Customizable product catalog

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Custom CSS
- **Backend**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Date Handling**: Native JavaScript Date API

## Project Structure

```
VlsBillingDetails/
├── src/
│   ├── AddCustomer.jsx          # Customer management
│   ├── AddProduct.jsx           # Product management
│   ├── DeliveryDetails.jsx      # Delivery entry form
│   ├── RecievedDetails.jsx      # Receipt entry form
│   ├── GenerateBill.jsx         # Invoice generation
│   ├── Sidebar.jsx              # Navigation sidebar
│   ├── main.jsx                 # App entry point
│   ├── supabaseClient.js        # Supabase configuration
│   └── *.css                    # Component styles
├── index.html                   # Main HTML file
├── vite.config.js              # Vite configuration
└── Package.json                # Dependencies

```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd VlsBillingDetails
```

2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Create a Supabase project
   - Update `src/supabaseClient.js` with your Supabase URL and API key
   - Set up the following tables:
     - `VSRCUSTOMERDATA` (Customer information)
     - `VSRCYLINDERDATA` (Delivery/Receipt records)
     - `VSRPRODUCTS` (Product catalog)

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Database Schema

### VSRCUSTOMERDATA
- `id` - Primary key
- `name` - Customer name
- `address` - Customer address
- `gst_number` - GST identification number

### VSRCYLINDERDATA
- `id` - Primary key
- `delivered_date` - Delivery date
- `received_date` - Receipt date
- `dc_number` - Delivery challan number
- `product_type` - Type of product
- `product_name` - Product name
- `customer_name` - Customer name
- `cylinder_number` - Cylinder identification
- `cylinder_type` - Cylinder size/type
- `type` - Record type ('delivery' or 'receipt')
- `created_at` - Timestamp

### VSRPRODUCTS
- `id` - Primary key
- `type` - Product type category
- `product_name` - Product name

## Usage

### Recording a Delivery
1. Navigate to "Delivered Details"
2. Enter delivery date and DC number
3. Select customer and product
4. For cylinders, enter cylinder numbers (comma-separated for multiple)
5. Select cylinder type
6. Submit the form

### Recording a Receipt
1. Navigate to "Received Details"
2. Select customer
3. Choose from pending deliveries
4. Enter received date
5. Submit

### Generating a Bill
1. Navigate to "Generate Bill"
2. Select customer
3. Choose date range (from/to dates)
4. Click "Generate Bill"
5. Review and edit rates/amounts
6. Print or save the invoice

## Features in Detail

### Multi-Cylinder Entry
When recording deliveries, you can enter multiple cylinder numbers separated by commas:
- Example: `C001, C002, C003`
- Creates separate records for each cylinder

### Bill Grouping Logic
Bills automatically group items by:
- DC Number
- Product Type
- Cylinder Type

Display format:
```
DC No: DC001 - Nitrogen Cylinder (7 kg)
C001, C002, C003
Quantity: 3
```

### Print Optimization
- Compact spacing for better page utilization
- A4 format with optimized margins
- Hides action buttons during printing
- Professional layout with company branding

## Company Information

**V.S.R. ENTERPRISES**
- Suppliers of: Oxygen, Nitrogen, LPG and All types of Industrial Gases
- Stockiest: Welding Electrodes & Welding Accessories
- Dealer: PREMIER OXYGEN
- GSTIN: 36AFPPV0731F1ZA
- Location: Hyderabad, Telangana

## Contributing

This is a private business application. For modifications or enhancements, please contact the system administrator.

## License

Proprietary - All rights reserved

## Support

For technical support or issues, please contact the development team.
