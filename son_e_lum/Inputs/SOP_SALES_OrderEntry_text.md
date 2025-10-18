# SOP: Sales Order Entry (Scott Electric / Palco)
# Source: OPM Files MR_01_02_25 – MR_01_03_25
# Author: Auto-generated from OPM Excel by extract_opm_texts_v10.py

S1:: Enter Stock Customer Sales Order
Body3: Open the Order Entry screen and select “Stock Customer Sales Order.” 
Enter the customer number, ship-to, and order type. Add line items for stocked products. 
Confirm quantities and pricing. Review tender options if applicable, then save or release the order.
ImageText: Order Entry for stocked customer items.
NextStep: S2 – Enter Quote Order

S2:: Enter Quote Order
Body3: Use Quote Order to record non-committal quotations. 
Select Quote type and customer, enter requested items, and save. 
Later, convert the quote to a live sales order when approved.
ImageText: Quote Order entry screen highlighted.
NextStep: S3 – Enter Direct Order

S3:: Enter Direct Order
Body3: Choose Direct Order when the product ships from vendor to customer. 
Enter customer information, vendor details, and line items. 
Confirm pricing and ensure drop-ship flags are set correctly.
ImageText: Direct order setup screen.
NextStep: S4 – Enter Tender Payment

S4:: Enter Customer Sales Order and Record Tender Payments
Body3: Create the sales order and record any tender payments. 
Use “Tender Type” for cash, check, or credit. Confirm total and post payment.
ImageText: Payment entry during order process.
NextStep: S5 – Enter Kit Sales Order

S5:: Enter Sales Order for Kits
Body3: For kit or bundled items, select the kit code and verify component lines auto-populate. 
Review pricing and availability, adjust components as needed, and confirm totals.
ImageText: Kit order with component list displayed.
NextStep: S6 – Enter Non-Stock Product Order

S6:: Enter Non-Stock Product on an Order
Body3: When ordering non-stock products, select “+Non-Stock” and add item details. 
Enter description, vendor, cost, and expected delivery. 
Confirm pricing but do not override cost fields unless authorized.
ImageText: Non-stock product entry window.
NextStep: S7 – Enter Return Order

S7:: Enter Return Order
Body3: Create a Return Sales Order for products being returned. 
Select the original invoice or order reference. 
Enter item and quantity, choose reason codes, and confirm refund or replacement path. 
Finalize and close the return.
ImageText: Return order processing screen.
NextStep: End
