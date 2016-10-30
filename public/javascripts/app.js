var SearchResultsLayout = Mn.View.extend({
    template: '#search-results-layout-tmpl',
    regions: {
        results: {
            el: 'table tbody',
            replaceElement: true
        }
    },
    onRender: function(){
        this.showChildView('results', new SearchResultsView({
            collection: this.collection
        }));
    }
});

var SearchResultView = Mn.View.extend({
    template: '#search-result-tmpl',
    tagName: 'tr',
    className: 'search-result'
});

var SearchResultsView = Mn.CollectionView.extend({
    tagName: 'tbody',
    childView: SearchResultView
});

var MainView = Mn.View.extend({
    el: 'body',
    template: false,
    regions:{
        mainContent: '#main-content',
        searchResults: '#search-results'
    },
    showSearchResults: function(results){
        this.showChildView('searchResults', new SearchResultsLayout({
            collection: results
        }));
    }
});

var SearchResults = Backbone.Collection.extend({
    url: '/search',
    parse: function(response, options){
        return response['results'];
    }
});

//loadInitialData().then(app.start);
var SearchBoxView = Mn.View.extend({
    template: false,
    events: {
        'submit': 'search'
    },
    search: function(e){
        e.preventDefault();
        console.log("searching");
        var results = new SearchResults();
        var self = this;
        results.fetch().done(function(data){
            console.log(data);
            self.triggerMethod('search:done', results);
        });
    }
});

var BFApplication = Mn.Application.extend({
    region: 'body',
    onStart: function() {
        this._region = new MainView();
    }
});

var app = new BFApplication();

app.on('start', function() {

    var searchbox = new SearchBoxView({
        el: 'form.search-box'
    });

    searchbox.on('search:done', function(collection){
        app.getRegion().showSearchResults(collection);
    });

    searchbox.render();

    Backbone.history.start();
});

app.start();
