import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { isValidObjectId } from "mongoose"
import puppeteer from "puppeteer"

// Fix the GET handler to properly handle params
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const id = params.id
    const url = new URL(req.url)
    const includeNotes = url.searchParams.get("includeNotes") === "true"
    const includeDrawings = url.searchParams.get("includeDrawings") === "true"

    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid presentation ID" }, { status: 400 })
    }

    const presentation = await Presentation.findById(id)

    if (!presentation) {
      return NextResponse.json({ success: false, error: "Presentation not found" }, { status: 404 })
    }

    // Generate PDF
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    // Create HTML content for PDF
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${presentation.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
          .slide { page-break-after: always; height: 100vh; padding: 40px; box-sizing: border-box; position: relative; }
          .notes { border-top: 1px solid #ccc; padding-top: 20px; margin-top: 20px; }
          h1 { font-size: 2.5em; margin-bottom: 0.5em; }
          h2 { font-size: 1.8em; margin-bottom: 0.5em; }
          h3 { font-size: 1.5em; margin-bottom: 0.5em; }
          p { font-size: 1.2em; line-height: 1.5; }
          ul, ol { font-size: 1.2em; line-height: 1.5; }
          blockquote { border-left: 4px solid #ccc; padding-left: 1em; font-style: italic; }
        </style>
      </head>
      <body>
    `

    // Add each slide - using simple HTML instead of JSX components
    for (const slide of presentation.slides) {
      // Convert markdown to HTML (simplified version)
      const content = slide.content || ""
      const slideContent = convertMarkdownToHTML(content)

      html += `
        <div class="slide">
          <div class="content">${slideContent}</div>
          ${includeNotes && slide.notes ? `<div class="notes"><h4>Notes:</h4><p>${slide.notes}</p></div>` : ""}
        </div>
      `
    }

    html += `
      </body>
      </html>
    `

    await page.setContent(html)
    const pdf = await page.pdf({ format: "A4" })
    await browser.close()

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${presentation.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error exporting presentation:", error)
    return NextResponse.json({ success: false, error: "Failed to export presentation" }, { status: 500 })
  }
}

// Simple function to convert markdown to HTML
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    // Bold and italic
    .replace(/\*\*(.*)\*\*/gm, "<strong>$1</strong>")
    .replace(/\*(.*)\*/gm, "<em>$1</em>")
    // Lists
    .replace(/^- (.*$)/gm, "<li>$1</li>")
    .replace(/^\d\. (.*$)/gm, "<li>$1</li>")
    // Blockquotes
    .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
    // Links
    .replace(/\[([^\]]+)\]$$([^)]+)$$/gm, '<a href="$2">$1</a>')
    // Images
    .replace(/!\[([^\]]+)\]$$([^)]+)$$/gm, '<img src="$2" alt="$1" style="max-width: 100%;">')
    // Paragraphs
    .replace(/^(?!<[a-z])/gm, "<p>$&</p>")

  // Wrap lists
  if (html.includes("<li>")) {
    html = html.replace(/<li>.*?<\/li>/gs, (match) => {
      return `<ul>${match}</ul>`
    })
  }

  return html
}

