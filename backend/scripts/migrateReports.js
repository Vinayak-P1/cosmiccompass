// Migration script to clean up old report records with local file paths
import mongoose from "mongoose";
import dotenv from "dotenv";
import Booking from "../src/models/Booking.js";
import Report from "../src/models/Report.js";

dotenv.config();

async function migrateReports() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cosmic");
    console.log("Connected to database");

    // Find all reports with old local file paths
    const oldReports = await Report.find({ 
      fileUrl: { $regex: "^/uploads/reports/" } 
    });

    console.log(`Found ${oldReports.length} old report records with local paths`);

    if (oldReports.length > 0) {
      // Delete old report records - admins will need to re-upload PDFs via Cloudinary
      const result = await Report.deleteMany({ 
        fileUrl: { $regex: "^/uploads/reports/" } 
      });
      
      console.log(`Deleted ${result.deletedCount} old report records`);

      // Also remove report reference from bookings
      const bookingResult = await Booking.updateMany(
        { report: { $in: oldReports.map(r => r._id) } },
        { $unset: { report: 1 } }
      );
      
      console.log(`Updated ${bookingResult.modifiedCount} booking records to remove old report references`);
    } else {
      console.log("No old report records found");
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrateReports();
