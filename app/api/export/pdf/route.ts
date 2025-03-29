import { type NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"

// Utility endpoint for PDF generation testing
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { html } = data

    if (!html) {
      return NextResponse.json({ success: false, error: "HTML content is required" }, { status: 400 })
    }

    // Generate PDF
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    await page.setContent(html)
    const pdf = await page.pdf({ format: "A4" })
    await browser.close()

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="export.pdf"',
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ success: false, error: "Failed to generate PDF" }, { status: 500 })
  }
}

