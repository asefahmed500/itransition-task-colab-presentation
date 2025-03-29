import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { generateSecureAccessCode } from "@/lib/utils"

// This endpoint fixes presentations with null access codes
export async function POST(): Promise<NextResponse> {
  try {
    await connectToDatabase()

    // Find presentations with null or empty access codes
    const invalidPresentations = await Presentation.find({
      $or: [
        { accessCode: null },
        { accessCode: "" },
        { accessCode: { $exists: false } },
        { code: null },
        { code: "" },
        { code: { $exists: false } },
      ],
    })

    console.log(`Found ${invalidPresentations.length} presentations with invalid access codes`)

    // Fix presentations with invalid access codes
    for (const presentation of invalidPresentations) {
      // Generate a new unique access code
      let accessCode = generateSecureAccessCode(6)
      let existingWithCode = await Presentation.findOne({
        $or: [{ accessCode: accessCode }, { code: accessCode }],
        _id: { $ne: presentation._id },
      })

      // Make sure the code is unique
      let attempts = 0
      const maxAttempts = 10

      while (existingWithCode && attempts < maxAttempts) {
        accessCode = generateSecureAccessCode(6)
        existingWithCode = await Presentation.findOne({
          $or: [{ accessCode: accessCode }, { code: accessCode }],
          _id: { $ne: presentation._id },
        })
        attempts++
      }

      if (attempts >= maxAttempts) {
        console.error(
          `Failed to generate unique code for presentation ${presentation._id} after ${maxAttempts} attempts`,
        )
        continue
      }

      // Update the presentation with the new code
      presentation.accessCode = accessCode
      presentation.code = accessCode
      await presentation.save()
      console.log(`Fixed presentation ${presentation._id} with new access code: ${accessCode}`)
    }

    // Count total presentations after cleanup
    const totalPresentations = await Presentation.countDocuments()

    return NextResponse.json({
      success: true,
      message: "Access code fix completed successfully",
      stats: {
        fixedPresentations: invalidPresentations.length,
        totalPresentations,
      },
    })
  } catch (error) {
    console.error("Error fixing access codes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fix access codes: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

