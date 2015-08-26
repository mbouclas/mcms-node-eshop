module.exports = (function(App,Connection,Package){

    var Cart = {},
        Coupon = {};

    return removeCoupon;

    //This method performs some database checks that cannot be done in the cart module and then validates
    // the coupon via the cart module
    function removeCoupon() {
        Cart = App.Cart;
        Coupon = App.Cart.Coupon;
        Coupon.removeDiscountFromCart();
        return true;
    }

    function checkInCategory(coupon,next) {
        next(null,'done checking categories');
    }

    function checkUserQuota(coupon, next) {
        next(null,'done checking user');
    }
});