import Settings from "../models/Settings.js";
import Booking from "../models/Booking.js";
import Astrologer from "../models/Astrologer.js";

async function getOrCreateSettings() {
  let settings = await Settings.findOne({ key: "global" });
  if (!settings) {
    settings = await Settings.create({ key: "global" });
  }
  return settings;
}

export const getPublicStats = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();

    // 1. Readings Delivered = Base + Completed Bookings count
    const completedBookingsCount = await Booking.countDocuments({ status: "completed" });
    const totalReadings = (settings.readingsBase || 0) + completedBookingsCount;

    // Format readings: e.g. 10K+ if >= 10000, 10.5K+ if >= 1000, else 500+
    let readingsFormatted = `${totalReadings}+`;
    if (totalReadings >= 10000) {
      readingsFormatted = `${Math.floor(totalReadings / 1000)}K+`;
    } else if (totalReadings >= 1000) {
      readingsFormatted = `${(totalReadings / 1000).toFixed(1)}K+`;
    }

    // 2. Verified Experts = Base + Actual Astrologers count
    const astrologersCount = await Astrologer.countDocuments({ isActive: { $ne: false } });
    const totalExperts = (settings.verifiedExpertsBase || 0) + astrologersCount;
    const expertsFormatted = `${totalExperts}+`;

    // 3. User Rating (calculated automatically or manual override)
    let userRatingFormatted = "4.9";
    if (settings.userRatingOverride != null) {
      userRatingFormatted = Number(settings.userRatingOverride).toFixed(1);
    } else {
      const ratedBookings = await Booking.find({ rating: { $ne: null } }).select("rating");
      if (ratedBookings.length > 0) {
        const sum = ratedBookings.reduce((acc, b) => acc + (b.rating || 0), 0);
        userRatingFormatted = (sum / ratedBookings.length).toFixed(1);
      }
    }

    // 4. Satisfaction Percentage (calculated automatically or manual override)
    let satisfactionFormatted = "98%";
    if (settings.satisfactionOverride != null) {
      satisfactionFormatted = `${settings.satisfactionOverride}%`;
    } else {
      const ratedBookings = await Booking.find({ rating: { $ne: null } }).select("rating");
      if (ratedBookings.length > 0) {
        const happyCount = ratedBookings.filter((b) => b.rating >= 4).length;
        const pct = Math.round((happyCount / ratedBookings.length) * 100);
        satisfactionFormatted = `${pct}%`;
      }
    }

    res.json({
      success: true,
      stats: {
        readingsDelivered: readingsFormatted,
        readingsRaw: totalReadings,
        completedBookingsCount,
        verifiedExperts: expertsFormatted,
        verifiedExpertsRaw: totalExperts,
        astrologersCount,
        userRating: userRatingFormatted,
        satisfaction: satisfactionFormatted,
      },
    });
  } catch (err) {
    console.error("GET PUBLIC STATS ERROR =>", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAdminStatsSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const completedBookingsCount = await Booking.countDocuments({ status: "completed" });
    const astrologersCount = await Astrologer.countDocuments({ isActive: { $ne: false } });
    const ratedBookings = await Booking.find({ rating: { $ne: null } })
      .select("rating review ratedAt user")
      .populate("user", "name phone");

    res.json({
      success: true,
      settings,
      liveData: {
        completedBookingsCount,
        astrologersCount,
        ratingsCount: ratedBookings.length,
        ratings: ratedBookings,
      },
    });
  } catch (err) {
    console.error("GET ADMIN STATS ERROR =>", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateAdminStatsSettings = async (req, res) => {
  try {
    const {
      readingsBase,
      verifiedExpertsBase,
      userRatingOverride,
      satisfactionOverride,
    } = req.body;

    const settings = await getOrCreateSettings();

    if (readingsBase !== undefined) settings.readingsBase = Number(readingsBase);
    if (verifiedExpertsBase !== undefined) settings.verifiedExpertsBase = Number(verifiedExpertsBase);

    if (userRatingOverride !== undefined) {
      settings.userRatingOverride =
        userRatingOverride === "" || userRatingOverride === null
          ? null
          : Number(userRatingOverride);
    }

    if (satisfactionOverride !== undefined) {
      settings.satisfactionOverride =
        satisfactionOverride === "" || satisfactionOverride === null
          ? null
          : Number(satisfactionOverride);
    }

    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    console.error("UPDATE ADMIN STATS ERROR =>", err);
    res.status(500).json({ error: err.message });
  }
};
