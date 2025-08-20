#!/usr/bin/env node

const { exec } = require('child_process');

// Get command line arguments
const args = process.argv.slice(2);
const receiptText = args[0];
const orderNumber = args[1];
const printerName = args[2] || 'POS-80';

if (!receiptText || !orderNumber) {
  console.error('Usage: node print-receipt.js "receipt_text" "order_number" [printer_name]');
  process.exit(1);
}

// Create the print data with escape sequences
const printData = `\x1B\x40MOE CAFETERIA\nOrder: ${orderNumber}\nDate: ${new Date().toLocaleDateString()}\nTime: ${new Date().toLocaleTimeString()}\n--------------------------------\n${receiptText}\n\n\n\x1D\x56\x00`;

// Escape the data for shell command
const escapedData = printData
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"')
  .replace(/\n/g, '\\n')
  .replace(/\r/g, '\\r')
  .replace(/\t/g, '\\t');

// Create the echo command
const command = `echo -e "${escapedData}" | lp -d ${printerName}`;

console.log('Executing command:', command);

// Execute the command
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Print error:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.error('Print stderr:', stderr);
  }
  
  console.log('Print stdout:', stdout);
  console.log('Receipt printed successfully!');
}); 