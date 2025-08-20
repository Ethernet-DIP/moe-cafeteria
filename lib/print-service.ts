import { apiClient } from './axiosInstance'

export interface ReceiptData {
  receiptText: string
  orderNumber: string
  timestamp: string
  format: string
}

// Get the base URL for API calls
const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
}

// Generate receipt text locally (fallback when backend is not available)
export const generateReceiptTextLocally = (
  mealRecord: any, 
  employee?: any, 
  mealCategory?: any, 
  mealType?: any,
  format: 'simple' | 'detailed' = 'detailed'
): ReceiptData => {
  const now = new Date()
  const currentTime = now.toLocaleTimeString()
  const currentDate = now.toLocaleDateString()
  
  // Simplified receipt format with only requested fields - ensure UTF-8 encoding for Amharic
  const receiptText = `MOE CAFETERIA\n` +
                      `Order: ${mealRecord.orderNumber || 'N/A'}\n` +
                      `Date: ${currentDate}\n` +
                      `Time: ${currentTime}\n` +
                      `Employee: ${employee?.shortCode || 'Unknown'}\n` +
                      `Meal Type: ${mealType?.name || mealRecord.mealTypeId || 'Unknown'}\n` +
                      `Meal Category: ${mealCategory?.name || mealRecord.mealName || 'Unknown'}\n` +
                      `Actual Price: ${mealRecord.actualPrice?.toFixed(2) || '0.00'} ETB\n` +
                      `Thank you for using our service!\n\n\n\n\n\n\n\n\n\n\n\n`
  
  return {
    receiptText,
    orderNumber: mealRecord.orderNumber || 'N/A',
    timestamp: currentTime,
    format
  }
}

// Get receipt text for a meal record
export const getReceiptText = async (mealRecordId: string, format: 'simple' | 'detailed' = 'detailed'): Promise<ReceiptData> => {
  try {
    const response = await apiClient.get(`/meal-records/${mealRecordId}/receipt?format=${format}`)
    return response.data
  } catch (error: any) {
    console.error("Error getting receipt text from backend:", error)
    console.log("Falling back to local receipt generation")
    
    // Fallback: Generate receipt locally using stored meal record data
    // This will be called from the cafeteria scanner with the meal record data
    throw new Error("Backend not available, using local receipt generation")
  }
}

// Print receipt using browser print functionality (silent - no popup)
export const printReceipt = (receiptText: string, orderNumber: string) => {
  // Create a hidden iframe for silent printing
  const iframe = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.style.position = 'absolute'
  iframe.style.left = '-9999px'
  document.body.appendChild(iframe)
  
  const doc = iframe.contentDocument || iframe.contentWindow?.document
  if (!doc) {
    throw new Error("Could not create print iframe")
  }
  
  // Format the receipt for thermal printer style
  const formattedReceipt = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${orderNumber}</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          line-height: 1.1;
          margin: 0;
          padding: 5px;
          white-space: pre-wrap;
          background: white;
          width: 80mm;
          max-width: 80mm;
        }
        .receipt {
          width: 100%;
          text-align: center;
        }
        .receipt-content {
          text-align: left;
          font-family: 'Courier New', monospace;
          white-space: pre;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .receipt {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="receipt-content">${receiptText.replace(/\n/g, '<br>')}</div>
      </div>
      <script>
        window.onload = function() {
          // Print immediately without any dialogs
          setTimeout(() => {
            window.print();
            
            // Remove iframe after printing
            setTimeout(() => {
              if (window.parent && window.parent.document) {
                const iframe = window.parent.document.querySelector('iframe[style*="display: none"]');
                if (iframe) {
                  iframe.remove();
                }
              }
            }, 500);
          }, 100);
        };
      </script>
    </body>
    </html>
  `
  
  doc.write(formattedReceipt)
  doc.close()
}

// Print receipt using QZ Tray (if available)
export const printReceiptQZTray = async (receiptText: string, orderNumber: string) => {
  // Check if QZ Tray is available
  if (typeof (window as any).qz === 'undefined') {
    throw new Error("QZ Tray is not available. Please install QZ Tray for thermal printer support.")
  }

  const qz = (window as any).qz

  try {
    // Connect to QZ Tray
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect()
    }

    // Find available printers
    const printers = await qz.printers.find()
    console.log("Available printers:", printers)

    // Use the first available printer or a default one
    const printerName = printers.length > 0 ? printers[0] : "POS-80"
    
    // Create printer configuration for text mode
    const config = qz.configs.create(printerName, {
      scaleContent: false,
      rasterize: false,
      encoding: 'UTF-8'
    })

    // Create print data similar to the working lp command
    const printData = [
      '\x1B\x40', // Initialize printer
      'MOE CAFETERIA\n',
      'Order: ' + orderNumber + '\n',
      'Date: ' + new Date().toLocaleDateString() + '\n',
      'Time: ' + new Date().toLocaleTimeString() + '\n',
      '--------------------------------\n',
      receiptText,
      '\n\n\n', // Paper feed
      '\x1D\x56\x00' // Cut paper (partial cut)
    ]

    // Print
    await qz.print(config, printData)
    console.log("Receipt printed successfully!")
    
  } catch (error) {
    console.error("Print error:", error)
    throw new Error(`Failed to print receipt: ${error}`)
  }
}

// Print receipt using echo command (no popups)
export const printReceiptEcho = async (receiptText: string, orderNumber: string, printerName: string = 'POS-80') => {
  try {
    console.log("Attempting echo print for order:", orderNumber)
    console.log("Printer:", printerName)
    
    // Use the new API route that handles echo command execution
    const response = await fetch('/api/print-echo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiptText,
        orderNumber,
        printer: printerName
      })
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log("Echo print result:", result)
      console.log("Receipt printed successfully via echo command!")
      return
    } else {
      const errorText = await response.text()
      console.error("API error response:", errorText)
      throw new Error(`Echo print failed: ${response.status} - ${errorText}`)
    }
    
  } catch (error) {
    console.error("Echo print error:", error)
    throw new Error(`Failed to print receipt via echo: ${error}`)
  }
}

// Test if echo print endpoint is available
export const testEchoPrintEndpoint = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/print/test?printer=POS-80`, {
      method: 'POST'
    })
    console.log("Echo test endpoint status:", response.status)
    if (response.ok) {
      const result = await response.json()
      console.log("Echo test result:", result)
      return true
    } else {
      console.error("Echo test failed:", response.status)
      return false
    }
  } catch (error) {
    console.error("Echo test error:", error)
    return false
  }
}

// Print receipt with fallback options (no popups)
export const printReceiptWithFallback = async (mealRecordId: string, format: 'simple' | 'detailed' = 'detailed') => {
  try {
    // Get receipt data
    const receiptData = await getReceiptText(mealRecordId, format)
    
    // For now, use browser print directly since backend print isn't working
    console.log("Using browser print for receipt:", receiptData.orderNumber)
    printReceipt(receiptData.receiptText, receiptData.orderNumber)
    
    return receiptData
  } catch (error) {
    console.error("Print error:", error)
    throw error
  }
} 