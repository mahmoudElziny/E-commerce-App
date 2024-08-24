

export class ApiFeatures {
    //ex: mongooseQuery: product.paginate()
    //ex: query: req.query
    constructor(model, query, populate) {
        // Product | Category | SubCategory |...
        this.model = model;
        // req.query
        this.query = query;
        // Will be the filters we neded to apply | {}
        this.filterObject = {};
        // Will be the pagination object we needed to apply | {}
        this.paginationObject = {};
        //will be populated data we needed to apply | []
        this.populate = this.populate;
    }

    // pagination
    pagination() {
        const { page = 1, limit = 2 } = this.query;
        const skip = (page - 1) * limit;

        this.paginationObject = {
            limit: parseInt(limit),
            skip,
            page: parseInt(page)
        }

        this.mongooseQuery = this.model.paginate(this.filterObject, this.paginationObject);
        return this;
    }


    // sorting
    sort() {
        const { sort } = this.query;
        if (sort) {
            this.paginationObject.sort = sort;
            this.mongooseQuery = this.model.paginate(this.filterObject, this.paginationObject)
        }
        return this;
    }


    // filtering
    filters() {
        const { page = 1, limit = 2, sort, ...filters } = this.query

        const filtersAsString = JSON.stringify(filters)
        const replacedFilters = filtersAsString.replace(/lt|lte|gt|gte|regex/g, (match) => `$${match}`)
        this.filterObject = JSON.parse(replacedFilters)
        this.mongooseQuery = this.model.paginate(this.filterObject, this.paginationObject)
        return this;
    }
}