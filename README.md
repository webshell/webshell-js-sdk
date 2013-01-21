webshell.js
===========

This SDK javascript is the easiest way to use Webshell client side

I - Create an app on [webshell](http://webshell.io)
------------------------------

To use Webshell, you have to create an app in your Dashboard which will generate a valid API Key.

II - Setup webshell.js
----------------------

Clone this repo or Download the latest release, then add this line to the `<head>` of all the pages that require Webshell

-- JQuery is required to load webshell.js

You have to set your API Key in webshell.js line 3

III - Hello world app
---------------------

This is the simplest app using Webshell

`````html
<!DOCTYPE HTML>
<html lang="en-US">
  <head>
    <meta charset="UTF-8">
    <title>Hello World!</title>
    <script type="text/javascript" src="http://code.jquery.com/jquery-1.8.2.min.js"></script>
    <script type="text/javascript" src="/path/to/webshell.js"></script>
    <script type="text/javascript">
$(document).ready(function() {
  wsh.exec({
    code: function() {
      var m = apis.google.maps({height: '100%'});
      m.center('paris');
      m.zoom(18);
    },
    process: function(json, meta) {
      $('body').append(meta.view);
    }
  })
})
    </script>
  </head>
  <body>
  </body>
</html>
`````

Pretty simple hm ?! You can call any other APIs on the platform in the same way. More information : Javascript SDK. The javascript given in the code attribute of wsh.exec() is processed on our server and we retrieve all kind of data for you.

wsh Object
----------

Once the SDK loaded, you can use the `wsh` object to access the Webshell API.

Currently, only one method is available from the SDK : `wsh.exec(obj)`

`````javascript
wsh.exec({
  code: function() {
    //some code which have be executed by Webshell
  },
  args: {
    //data to escape in `code`
  },
  process: function(data, meta) {
    //this method is executed for each view in the results
  },
  success: function(json) {
    //call after process all view with the final json response
  },
  complete: function(json) {
    //call when all HTML views and javascript are loaded and ready to be used
  }
})
`````

*code* can be a string of the javascript or a function with the javascript which have to be executed by Webshell inside.

You can try online your Webshell code in the [API Editor](http://webshell.io/editor) and include your script using fs object inside your webshell code (see [builtins/fs()](http://webshell.io/docs/reference/v/builtins))


Read more in the [Webshell documentation](http://webshell.io/docs)