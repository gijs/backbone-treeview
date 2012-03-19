/* Global settings */
var COLLAPSE_SPEED = 50;


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
    template: '<a class="collapse-control" href="#"><span class="title"></span></a><ul class="nav nav-list tree"></ul>',

    initialize: function() {
        // When models children change, rebuild the tree
        this.model.bind('change:children', this.render, this);

        // Listen to model changes for updating view
        this.model.bind('change', this.update, this);

        // Collapse state
        this.collapsed = true;
    },

    setupEvents: function() {
        // Hack to get around event delegation not supporting ">" selector
        var that = this;
        this.$('> .collapse-control').click(function() { return that.toggleCollapse(); });
    },

    toggleCollapse: function() {
        this.collapsed = !this.collapsed;
        if (this.collapsed)
        {
            this.$('> .collapse-control i').attr('class', 'icon-plus');
            this.$('> ul.tree').slideUp(COLLAPSE_SPEED);
        }
        else
        {
            this.$('> .collapse-control i').attr('class', 'icon-minus');
            this.$('> ul.tree').slideDown(COLLAPSE_SPEED);  
        }
    },

    update: function() {
        this.$('> a .title').html(this.model.get('title'));
        this.collapsed && this.$('> ul.tree').hide() || this.$('> ul.tree').show();
    },

    render: function() {
        // Load HTML template and setup events
        this.$el.html(this.template);
        this.setupEvents();

        // Render this node
        this.update();

        // Build child views, insert and render each
        var tree = this.$('> ul.tree'), childView = null;
        _.each(this.model.getChildren(), function(model) {
            childView = new TreeView({
                model: model,
            });
            tree.append(childView.$el);
            childView.render();
        });

        /* Apply some extra styling to views with children */
        if (childView)
        {
            // Add bootstrap plus/minus icon
            this.$('> .collapse-control').prepend($('<i class="icon-plus"/>'));

            // Fixup css on last item to improve look of tree
            childView.$el.addClass('last-item').before($('<li/>').addClass('dummy-item'));   
        }

        return this;
    },
});
