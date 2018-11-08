// This is the js for the default/index.html view.
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    self.add_post = function () {
        // We disable the button, to prevent double submission.
        $.web2py.disableElement($("#add-post"));
        var sent_title = self.vue.form_title; // Makes a copy
        var sent_content = self.vue.form_content; //
        $.post(add_post_url,
            // Data we are sending.
            {
                post_title: self.vue.form_title,
                post_content: self.vue.form_content
            },
            // What do we do when the post succeeds?
            function (data) {
                // Re-enable the button.
                $.web2py.enableElement($("#add-post"));
                // Clears the form.
                self.vue.form_title = "";
                self.vue.form_content = "";
                // Adds the post to the list of posts.
                var new_post = {
                    id: data.post_id,
                    post_title: sent_title,
                    post_content: sent_content
                };
                self.vue.post_list.unshift(new_post);
                // We re-enumerate the array.
                self.process_posts();
            });
        // If you put code here, it is run BEFORE the call comes back.
    };

    self.get_posts = function() {
        $.getJSON(get_post_list_url,
            function(data) {
                // I am assuming here that the server gives me a nice list
                // of posts, all ready for display.
                self.vue.post_list = data.post_list;
                // Post-processing.
                self.process_posts();
                console.log("I got my list", data.post_list);
            }
        );
        console.log("I fired the get");
    };

    self.process_posts = function() {
        // This function is used to post-process posts, after the list has been modified
        // or after we have gotten new posts.
        // We add the _idx attribute to the posts.
        enumerate(self.vue.post_list);
        // We initialize the smile status to match the like.
        self.vue.post_list.map(function (e) {
            // I need to use Vue.set here, because I am adding a new watched attribute
            // to an object.  See https://vuejs.org/v2/guide/list.html#Object-Change-Detection-Caveats
            Vue.set(e, '_thumb', e.thumb)
            Vue.set(e, '_thumbup', 'u');
            Vue.set(e, '_thumbdown','d');

        });
    };

    self.thumbup_mouseover = function (post_idx) {
          // When we mouse over something, the thumb has to assume the opposite
          // of the current state, to indicate the effect.
          var p = self.vue.post_list[post_idx];
          if(p._thumb == "u"){
            console.log("This is up");
            p._thumup = !p._thumbup;
          }
      };

    self.thumbup_mouseout = function (post_idx) {
          // The like and like status coincide again.
          var p = self.vue.post_list[post_idx];
          p._thumbup = p.like;
      };

    self.thumbup_click = function (post_idx) {
              // The like status is toggled; the UI is not changed.
              var p = self.vue.post_list[post_idx];
              p.like = !p.like;
              // We need to post back the change to the server.
              $.post(set_thumb_url, {
                  post_id: p.id,
                  thumb_state: 'u'
              });
          };


    self.thumbdown_mouseover = function (post_idx) {
          // When we mouse over something, the thumb has to assume the opposite
          // of the current state, to indicate the effect.
          var p = self.vue.post_list[post_idx];
          p._thumbdown = !p.dislike;
      };

    self.thumbdown_mouseout = function (post_idx) {
          // The dislike and dislike status coincide again.
          var p = self.vue.post_list[post_idx];
          p._thumbdown = p.dislike;
      };

    self.thumbdown_click = function (post_idx) {
              // The dislike status is toggled; the UI is not changed.
              var p = self.vue.post_list[post_idx];
              p.dislike = !p.dislike;
              // We need to post back the change to the server.
              $.post(set_thumb_url, {
                  post_id: p.id,
                  thumb_state: 'd'
              });
          };



    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            form_title: "",
            form_content: "",
            post_list: []
        },
        methods: {
            add_post: self.add_post,
            thumbup_mouseover: self.thumbup_mouseover,
            thumbup_mouseout: self.thumbup_mouseout,
            thumbup_click: self.thumbup_click,
            thumbdown_mouseover: self.thumbdown_mouseover,
            thumbdown_mouseout: self.thumbdown_mouseout,
            thumbdown_click: self.thumbdown_click,
        }

    });

    // If we are logged in, shows the form to add posts.
    if (is_logged_in) {
        $("#add_post").show();
    }

    // Gets the posts.
    self.get_posts();

    return self;
};

var APP = null;

// No, this would evaluate it too soon.
// var APP = app();

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
