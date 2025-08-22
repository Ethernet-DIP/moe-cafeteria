import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { receiptText, orderNumber, printer = 'POS-80' } = await request.json()
    
    if (!receiptText || !orderNumber) {
      return NextResponse.json(
        { error: 'Missing required parameters: receiptText and orderNumber' },
        { status: 400 }
      )
    }
    
    // Create the print data with escape sequences - simplified format with UTF-8 encoding
    // Only add the receipt text since it already contains the header
    // Ensure proper UTF-8 encoding for Amharic characters
    const printData = Buffer.concat([
      Buffer.from([0x1B, 0x40]), // Initialize printer
      Buffer.from(receiptText, 'utf8'),
      Buffer.from('\n\n\n', 'utf8'), // Paper feed
      Buffer.from([0x1D, 0x56, 0x00]) // Cut paper (partial cut)
    ])
    
    // Create a temporary file to store the print data
    const tempFile = join(tmpdir(), `receipt-${Date.now()}.txt`)
    
    try {
      // Write the binary print data to the temporary file
      await writeFile(tempFile, printData)
      
      // Send the file to the printer with UTF-8 encoding
      const command = `lp -d ${printer} -o media=Custom.80x200mm -o fit-to-page ${tempFile}`
     
      // Execute the command
      const { stdout, stderr } = await execAsync(command)
      
      if (stderr) {
        console.error('Print stderr:', stderr)
      }
      
      
      return NextResponse.json({
        message: 'Receipt printed successfully via file command',
        printer,
        command,
        stdout,
        stderr
      })
      
    } finally {
      // Clean up the temporary file
      try {
        await unlink(tempFile)
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError)
      }
    }
    
  } catch (error: any) {
    console.error('Print error:', error)
    return NextResponse.json(
      { error: `Failed to execute echo command: ${error.message}` },
      { status: 500 }
    )
  }
} 