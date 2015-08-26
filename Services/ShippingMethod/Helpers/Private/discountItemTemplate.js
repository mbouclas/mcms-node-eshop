module.exports = (function(App,Connection,Package) {
   return function(data){
       var slug = require('slug');

       return {
           title : data.title,
           permalink : data.permalink || slug(data.title,{lower: true}),
           description : data.description || '',
           discount : data.discount || 0,
           minPrice : data.minPrice || 0,
           type : data.type || '%',
           active : data.active || false,
           items : [],
           categories : []
       };
   }
});