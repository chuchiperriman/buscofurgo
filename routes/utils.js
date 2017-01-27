module.exports = {
    priceToNumber: function(valor){
        return parseInt(valor.replace('.','').replace('€',''));
    },
    getUserHome: function() {
      return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    }
};
