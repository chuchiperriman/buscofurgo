module.exports = {
    priceToNumber: function(valor){
        return parseInt(valor.replace('.','').replace('€',''));
    }
};
