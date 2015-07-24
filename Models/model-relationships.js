module.exports =  {
    categories : {
        as : 'categories',
        join : 'getPageCategories',
        onSource : 'id',
        onDest : '_id',
        inject : 'categories',
        attachment : 'value',
        extraParams : {}
    },
    ExtraFields : {
        as : 'ExtraFields',
        join : 'getPageExtraFields',
        onSource : 'fieldID',
        onDest : '_id',
        inject : 'ExtraFields',
        merge : true
    },
    related : {
        as : 'related',
        join : 'getPageRelated',
        onSource : 'id',
        onDest : '_id',
        inject : 'related'
    },

    thumb : {
        as : 'thumb',
        join : 'getPageThumb',
        onSource : 'id',
        onDest : '_id',
        inject : 'thumb',
        return : 'single'
    },
    images : {
        as : 'images',
        join : 'getPageImages',
        onSource : 'id',
        onDest : 'id',
        inject : 'mediaFiles.images'
    },
    itemsCount : {
        as : 'itemCount',
        join : 'countItems',
        onSource : 'id',
        onDest : 'id',
        inject : 'categories',
        attachment : 'count',
        return : 'single',
        extraParams : {}
    },
    shipping : {
        as : 'shippingMethods',
        join : 'shipping',
        onSource : 'id',
        onDest : '_id',
        inject : 'shippingMethods',
        attachment : 'value'
    },
    processors : {
        as : 'processor',
        join : 'processors',
        onSource : '',
        onDest : '_id',
        inject : 'processor',
        merge : true
    },
    orderPayment : {
        as : 'paymentMethod',
        join : 'paymentMethods',
        onSource : '',
        onDest : '_id',
        inject : 'paymentMethod',
        merge : true
    },
    orderShipping : {
        as : 'shippingMethod',
        join : 'shippingMethods',
        onSource : '',
        onDest : '_id',
        inject : 'shippingMethod',
        merge : true
    },
    orderUser : {
        as : 'user',
        join : 'user',
        onSource : '',
        onDest : '_id',
        inject : 'user',
        merge : true
    }
};