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
        // When models children change, rebuild the tree
        this.model.bind('change:children', this.render, this);

        // Listen to model changes for updating view
        this.model.bind('change', this.update, this);

        // Traverse model to build list of child views
        var childViews = [];
        _.each(this.model.getChildren(), function(model) {
            childViews.push(new TreeView({
                model: model,
            }));
        });
        this.childViews = childViews;
    },

    update: function() {
        this.$('.title').first().html(this.model.get('title'));
    },

    render: function() {
        // Load HTML template
        this.$el.html(this.template);

        // Render this node
        this.update();

        // Build child views, insert and render each
        var tree = this.$('ul.tree'), childView = null;
        _.each(this.model.getChildren(), function(model) {
            childView = new TreeView({
                model: model,
            });
            tree.append(childView.$el);
            childView.render();
        });

        // Fixup css on last item to improve look of tree
        if (childView)
            childView.$el.addClass('last-item').before($('<li/>').addClass('dummy-item'));

        return this;
    },
});
