/* Single node object in tree */
window.TreeNodeModel = Backbone.Model.extend({
    defaults: {
        title: 'Node',
        children: [],   // Children are represented as ids not objects
    },

    /* Return an array of actual TreeNodeModel instances
     * override this function depending on how children are store
     */
    getChildren: function() {
        return _.map(this.get('children'), function(ref) {
            // Lookup by ID in parent collection if string/num
            if (typeof(ref) == 'string' || typeof(ref) == 'number')
                return this.collection.get(ref);

            // Else assume its a real object
            return ref;
        });
    },
});

window.TreeNodeCollection = Backbone.Collection.extend({
    model: TreeNodeModel,
});



/* Tree view is attached to a single node (root) and built automatically */
window.TreeView = Backbone.View.extend({
    tagName: 'li',
    template: '<a class="title"></a><ul class="nav nav-list tree"></ul>',

    initialize: function() {
        // Listen to model changes for rendering
        this.model.bind('change', this.render, this);

        // Traverse model to build list of child views
        var childViews = [];
        _.each(this.model.getChildren(), function(model) {
            childViews.push(new TreeView({
                model: model,
            }));
        });
        this.childViews = childViews;
    },

    render: function() {
        // Load HTML template and 
        this.$el.html(this.template);

        // Render this node
        this.$('.title').html(this.model.get('title'));

        // Insert child nodes and render them as well
        var ul = this.$('ul.tree');
        _.each(this.childViews, function(view) {
            ul.append(view.$el);
            view.render();
        });

        return this;
    },
});

$(function() {
    // Fixup look of last element in each list
    $('ul.tree li.last-item').before($('<li/>').addClass('dummy-item'));
}); 
