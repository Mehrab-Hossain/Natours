class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludeQuries = ["page", "limit", "sort", "fields"];
    excludeQuries.forEach((el) => delete queryObj[el]);

    ///2.advance filtering

    console.log(queryObj);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // let query = Tour.find(JSON.parse(queryStr));

    this.query.find(JSON.parse(queryStr));
    console.log(JSON.parse(queryStr));

    return this;
  }
  sort() {
    ///3..sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" "); ///sort("price -cretaedAt")
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    ////4.limiting fields(which porperty users wants to see)

    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else this.query = this.query.select("-__v");

    return this;
  }

  pagination() {
    ////5.pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const contentSkip = (page - 1) * limit;

    this.query = this.query.skip(contentSkip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
