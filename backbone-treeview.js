/* Global settings */
var COLLAPSE_SPEED = 50;


/* Single node object in tree */
window.TreeNodeModel = Backbone.Model.extend({
    defaults: {
        title: 'Node',
        children: [],   // Children are represented as ids not objects
    },

    /* Return a suitable label for the Node
     * override this function to better serve the view
     */
    getLabel: function() {
        return this.get('title');
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
    template: '<a class="node-collapse" href="#"><span class="node-label"></span></a><ul class="nav nav-list node-tree"></ul>',

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
        this.$('> .node-collapse').click(function() { return that.toggleCollapse(); });
    },

    toggleCollapse: function() {
        this.collapsed = !this.collapsed;
        if (this.collapsed)
        {
            this.$('> .node-collapse i').attr('class', 'icon-plus');
            this.$('> .node-tree').slideUp(COLLAPSE_SPEED);
        }
        else
        {
            this.$('> .node-collapse i').attr('class', 'icon-minus');
            this.$('> .node-tree').slideDown(COLLAPSE_SPEED);  
        }
    },

    update: function() {
        this.$('> a .node-label').html(this.model.getLabel());
        this.collapsed && this.$('> .node-tree').hide() || this.$('> .node-tree').show();
    },

    render: function() {
        // Load HTML template and setup events
        this.$el.html(this.template);
        this.setupEvents();

        // Render this node
        this.update();

        // Build child views, insert and render each
        var tree = this.$('> .node-tree'), childView = null;
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
            this.$('> .node-collapse').prepend($('<i class="icon-plus"/>'));

            // Fixup css on last item to improve look of tree
            childView.$el.addClass('last-item').before($('<li/>').addClass('dummy-item'));   
        }

        return this;
    },
});
