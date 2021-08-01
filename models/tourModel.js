const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const User = require("./../models/userModel");
// const Review = require("./../models/reviewModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A Tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [30, "A tour name must have less or equal 30 charaters"],
      minlength: [10, "A tour name must have more or equal 10 characters"],
      // validate: [validator.isAlpha, "Tour name only characters"],
    },
    duration: {
      type: Number,
      required: [true, "A Tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A Tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A Tour must have a difficulty level"],
      trim: true,
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "difficuly either ; easy/ medium/difficult",
      },
    },
    slug: {
      type: String,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "rating must abobe 0"],
      max: [5, "rating must below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        ///this validator not for update......
        validator: function (val) {
          return val < this.price;
        },
        message: "priceDiscount should be less then price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Tour must a cover image"],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },

    startLocation: {
      // GeoJson // Geospatial data
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    // guides: Array,

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });
tourSchema.virtual("durationInWeeks").get(function () {
  return this.duration / 7;
});

/// child reviews store virtually
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

///document midleware
tourSchema.pre("save", function (next) {
  //console.log(this);
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre("save", async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));

//   this.guides = await Promise.all(guidePromises);

//   next();
// });

////query midleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
// tourSchema.pre("findOne", function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`query takes ${Date.now() - this.start}`);
  //console.log(doc);
  next();
});
// tourSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

//aggreagetation middleware

tourSchema.pre("aggregation", function (next) {
  this.pipeline().unshift({
    $match: { secretTour: { $ne: true } },
  });
  //console.log(this);
  next();
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
