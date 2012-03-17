/* Single node in tree */
window.TreeNodeModel = Backbone.Model.extend({
    defaults: {
        title: 'Item',
        children: [],   // Children are represented as ids not objects
    },
});


/* Collection of all nodes, manages node relationships */
window.TreeNodeCollection = Backbone.Collection.extend({
    model: TreeNodeModel,
});


/* View for a single node */
window.TreeNodeView = Backbone.View.extend({
    tagName: 'li',
    template: '<a class="title"></a><ul class="nav nav-list tree"></ul>',

    initialize: function() {
        this.inflate();
    },

    // Load base HTML, should really only be called once
    inflate: function() {
        this.$el.html(this.template);
        return this;
    },

    render: function() {
        this.$el.find('title').html(this.model.get('title'));
        return this;
    },
});

$(function() {
    // Fixup look of last element in each list
    $('ul.tree li.last-item').before($('<li/>').addClass('dummy-item'));
}); 
