exports.pagination = (page, next) => {
    let pages = [];
    if(page > 1){
        pages.push({i: page - 1});
    }
    pages.push({i: page, active: true});
    if(next){
        pages.push({i: page + 1});
    }
    return pages;
}