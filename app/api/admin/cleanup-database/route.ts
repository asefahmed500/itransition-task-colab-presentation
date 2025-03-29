import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { generateId } from "@/lib/utils"

// This is an admin endpoint to clean up the database
// It will remove presentations with null/empty access codes and fix duplicates
export async function POST(): Promise<NextResponse> {
  try {
    await connectToDatabase()

    // Find presentations with null or empty access codes
    const invalidPresentations = await Presentation.find({
      $or: [{ accessCode: null }, { accessCode: "" }, { accessCode: { $exists: false } }],
    })

    console.log(`Found ${invalidPresentations.length} presentations with invalid access codes`)

    // Fix presentations with invalid access codes
    for (const presentation of invalidPresentations) {
      // Generate a new unique access code
      let accessCode = generateId(6).toUpperCase()
      let existingWithCode = await Presentation.findOne({ accessCode })

      // Make sure the code is unique
      while (existingWithCode) {
        accessCode = generateId(6).toUpperCase()
        existingWithCode = await Presentation.findOne({ accessCode })
      }

      // Update the presentation with the new code
      presentation.accessCode = accessCode
      await presentation.save()
      console.log(`Fixed presentation ${presentation._id} with new access code: ${accessCode}`)
    }

    // Find duplicate access codes
    const duplicates = await Presentation.aggregate([
      { $group: { _id: "$accessCode", count: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { count: { $gt: 1 } } },
    ])

    console.log(`Found ${duplicates.length} duplicate access codes`)

    // Fix presentations with duplicate access codes
    for (const duplicate of duplicates) {
      // Skip the first one (keep it as is)
      const idsToFix = duplicate.ids.slice(1)

      for (const id of idsToFix) {
        const presentation = await Presentation.findById(id)
        if (presentation) {
          // Generate a new unique access code
          let accessCode = generateId(6).toUpperCase()
          let existingWithCode = await Presentation.findOne({ accessCode })

          // Make sure the code is unique
          while (existingWithCode) {
            accessCode = generateId(6).toUpperCase()
            existingWithCode = await Presentation.findOne({ accessCode })
          }

          // Update the presentation with the new code
          presentation.accessCode = accessCode
          await presentation.save()
          console.log(`Fixed duplicate presentation ${id} with new access code: ${accessCode}`)
        }
      }
    }

    // Count total presentations after cleanup
    const totalPresentations = await Presentation.countDocuments()

    return NextResponse.json({
      success: true,
      message: "Database cleanup completed successfully",
      stats: {
        fixedInvalidCodes: invalidPresentations.length,
        fixedDuplicates: duplicates.reduce((acc, dup) => acc + dup.ids.length - 1, 0),
        totalPresentations,
      },
    })
  } catch (error) {
    console.error("Error cleaning up database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clean up database: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

