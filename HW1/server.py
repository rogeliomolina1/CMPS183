from bottle import get, post, route, run, template, view, static_file

@get('/')
def news():
    return template('news_template')

# Let's add some code to serve jpg images from our static images directory.
@post('/images/<filename:re:.*\.jpg>')
def serve_image(filename):
    return static_file(filename, root='images', mimetype='image/jpg')

# Let's add some code to serve jpg images from our static images directory.
@get('/images/<filename:re:.*\.jpg>')
def serve_image(filename):
    return static_file(filename, root='images', mimetype='image/jpg')

# Code for serving css stylesheets from /css directory.
@route('/css/<filename:re:.*.css>')
def serve_css(filename):
    return static_file(filename, root='css', mimetype='text/css')

run(host='localhost', port=8080, debug=True)
