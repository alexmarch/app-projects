$(function(){
    var App = function ( $container ) {

        this.Views = {};
        this.Collections = {};
        this.Models = {};
        this.Widgets = {};

        this.$container = $container;
    };

    App.prototype = {

        initialize: function () {

            var Project = Backbone.Model.extend({

                idAttribute: "_id",

                defaults: {
                    id: -1,
                    title: ""
                },

                validate: function (attr, options) {
                    if ($.trim(attr.title) == '')
                        return "Empty title !";
                },

                url: '/projects/add'

            });

            var ProjectList = Backbone.Collection.extend({
                model: Project,
                url: '/projects/list'
            });

            this.Collections.Projects = new ProjectList;


            var projectViewTemplate = '<div class="row">\
                                        <div class="col-xs-8">\
                                            <h5 class="title"><%= project.title %></h5>\
                                        </div>\
                                        <div class="col-xs-4">\
                                            <button id="edit" class="btn btn-primary pull-right">\
                                                Edit &nbsp;\
                                                <span class="glyphicon glyphicon-pencil"></span>\
                                            </button>\
                                        </div>';

            var ProjectView = Backbone.View.extend({

                tagName: 'li',

                className: 'list-group-item',

                template: _.template(projectViewTemplate),

                events: {
                    'click #edit': 'edit'
                },

                initialize: function () {
                    this.listenTo(this.model, 'change', this.render);
                },

                render: function () {
                    this.$el.html(this.template({project: this.model.toJSON()}));
                    return this;
                },

                edit: function () {
                    window.App.Widgets.ProjectDialog.edit(this.model);
                }

            });

            var projectDialogTemplate =
                '<div id="projectdialog" class="modal fade">' +
                    '<div class="modal-dialog">' +
                        '<div class="modal-content">' +
                            '<div class="modal-header">' +
                                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                                '<h4 class="modal-title">Add new project</h4>' +
                            '</div>' +
                            '<div class="modal-body">' +
                                '<div class="input-group">' +
                                    '<label> Project title </label>' +
                                    '<input type="text" id="title" class="form-control" value="<%= title%>" placeholder="Title...">' +
                                '</div>' +

                            '<div class="modal-footer">' +
                                '<button id="done" class="btn btn-primary" style="margin: 4px">OK</button>' +
                            '</div> ' +
                        '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            var ProjectDialog = Backbone.View.extend({

                el: this.$container.find('#dialogs'),

                template: _.template(projectDialogTemplate),

                events : {
                    "click #done" : "done"
                },

                edit: function( project ){
                    this.model = project;
                    this.listenTo(this.model,'change',this.addNew);
                    this.listenTo(this.model,'invalid',this.error);
                    this.$el.html(this.template({title: project.get('title')}));
                    this.$('#projectdialog').modal("show");
                },

                done: function(){
                    this.model.set("title",this.$('#title').val(),{validate: true});
                },

                error: function(){

                },
                addNew: function(project){
                    this.$('#projectdialog').modal("hide");
                    project.save();
                }
            });

            window.App.Widgets.ProjectDialog = new ProjectDialog;


            var ProjectListView = Backbone.View.extend({

                el: this.$container.find('#body'),

                events: {
                    'click #addNew': 'addNew'
                },

                initialize: function () {
                    this.listenTo(window.App.Collections.Projects, 'add', this.appendView);
                    this.listenTo(window.App.Collections.Projects, 'all', this.render);
                    window.App.Collections.Projects.fetch();
                },

                render: function () {
                    if (window.App.Collections.Projects.length) {
                        this.$('#content').show();
                        this.$('#message').hide();
                    } else {
                        this.$('#content').hide();
                        this.$('#message').show();
                    }
                    return this;
                },

                addNew: function () {
                    var len = window.App.Collections.Projects.length;
                    console.log(len);
                    var index = len;
                    var model = new Project({id: index, title: ""});
                    window.App.Collections.Projects.add(model)
                    window.App.Widgets.ProjectDialog.edit(model);
                },

                addAll: function () {
                    window.App.Collections.Projects.each(this.appendView, this);
                },

                appendView: function (project) {
                    var view = new ProjectView({model: project});
                    this.$('#content').append(view.render().el);
                }
            });


            this.Views.ProjectList = new ProjectListView;
        }
    }

    window.App = new App($('#app'));
    window.App.initialize();

});
