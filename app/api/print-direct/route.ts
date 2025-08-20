import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { data, printer } = await request.json()
    
    if (!data || !printer) {
      return NextResponse.json(
        { error: 'Missing required parameters: data and printer' },
        { status: 400 }
      )
    }
    
    // Convert the double-escaped data to proper binary format
    // The frontend sends double-escaped sequences (\\x1B, \\x1D, \\n, etc.)
    let processedData = data
      .replace(/\\\\x1B/g, '\x1B')  // Convert \\x1B to \x1B
      .replace(/\\\\x1D/g, '\x1D')  // Convert \\x1D to \x1D
      .replace(/\\\\n/g, '\n')      // Convert \\n to \n
      .replace(/\\\\r/g, '\r')      // Convert \\r to \r
      .replace(/\\\\t/g, '\t')      // Convert \\t to \t
      .replace(/\\\\x00/g, '\x00')  // Convert \\x00 to \x00
    
    // Create binary buffer from the processed data with UTF-8 encoding
    // Ensure proper UTF-8 encoding for Amharic characters
    const printData = Buffer.from(processedData, 'utf8')
    
    // Create a temporary file to store the print data
    const tempFile = join(tmpdir(), `receipt-direct-${Date.now()}.txt`)
    
    try {
      // Write the binary print data to the temporary file
      await writeFile(tempFile, printData)
      
      // Send the file to the printer with UTF-8 encoding
      const command = `lp -d ${printer} -o media=Custom.80x200mm -o fit-to-page ${tempFile}`
      
      console.log('Executing print command:', command)
      
      // Execute the command
      const { stdout, stderr } = await execAsync(command)
      
      if (stderr) {
        console.error('Print stderr:', stderr)
      }
      
      console.log('Print stdout:', stdout)
      
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
      { error: `Failed to execute print command: ${error.message}` },
      { status: 500 }
    )
  }
} 