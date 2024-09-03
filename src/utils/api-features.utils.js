

// export class ApiFeatures {
//     //ex: mongooseQuery: product.paginate()
//     //ex: query: req.query
//     constructor(model, query, populate) {
//         // Product | Category | SubCategory |...
//         this.model = model;
//         // req.query
//         this.query = query;
//         // Will be the filters we neded to apply | {}
//         this.filterObject = {};
//         // Will be the pagination object we needed to apply | {}
//         this.paginationObject = {};
//         //will be populated data we needed to apply | []
//         this.populate = this.populate;
//     }

//     // pagination
//     pagination() {
//         const { page = 1, limit = 2 } = this.query;
//         const skip = (page - 1) * limit;

//         this.paginationObject = {
//             limit: parseInt(limit),
//             skip,
//             page: parseInt(page)
//         }

//         if(this.populate.length){
//             this.paginationObject.populate = this.populate;
//         }

//         this.mongooseQuery = this.model.paginate(this.filterObject, this.paginationObject);
//         return this;
//     }


//     // sorting
//     sort() {
//         const { sort } = this.query;
//         if (sort) {
//             this.paginationObject.sort = sort;
//             this.mongooseQuery = this.model.paginate(this.filterObject, this.paginationObject)
//         }
//         return this;
//     }


//     // filtering
//     filters() {
//         const { page = 1, limit = 2, sort, ...filters } = this.query

//         const filtersAsString = JSON.stringify(filters)
//         const replacedFilters = filtersAsString.replace(/lt|lte|gt|gte|regex/g, (match) => `$${match}`)
//         this.filterObject = JSON.parse(replacedFilters)
//         this.mongooseQuery = this.model.paginate(this.filterObject, this.paginationObject)
//         return this;
//     }
// }

export class ApiFeatures {
    constructor(mongooseQuery,searchQuery) {
        this.mongooseQuery = mongooseQuery;
        this.searchQuery = searchQuery;
    }

    //pagination
    pagination() {
        let pageNumber = this.searchQuery.page * 1 || 1;
        if(this.searchQuery.page < 0 ){
            pageNumber = 1;
        } 
        const limit = this.searchQuery.limit * 1 || 2;
        const skip = (pageNumber - 1) * limit;
        this.pageNumber = pageNumber;
        this.mongooseQuery.skip(skip).limit(limit);
        return this;
    }

    //filters
    filter(){
        let filterObj = structuredClone(this.searchQuery);
        filterObj = JSON.stringify(filterObj);
        filterObj = filterObj.replace(/\b(gt|gte|lt|lte|regex)\b/g, (match) => `$${match}`);
        filterObj = JSON.parse(filterObj);

        let excludedFields = ["page", "sort", "fields", "search"];
        excludedFields.forEach( val => {
            delete filterObj[val];
        });

        this.mongooseQuery.find(filterObj);
        
        return this;
    }
    
    //sort
    sort(){
        if(this.searchQuery.sort){
            let sortedBy = this.searchQuery.sort.split(',').join(' ');
            this.mongooseQuery.sort(sortedBy);
        }

        return this;
    }

    //fields 
    fields(){
        if(this.searchQuery.fields){
            let selectedFields = this.searchQuery.fields.split(',').join(' ');
            this.mongooseQuery.select(selectedFields);
        }

        return this;
    }
    
    //search
    search(){
        if(this.searchQuery.search){
            this.mongooseQuery.find({
                $or: [
                    {title: {$regex: this.searchQuery.search, $options: "i"}},
                    {overview: {$regex: this.searchQuery.search, $options: "i"}},
                ]
            });
        }

        return this;
    }
}