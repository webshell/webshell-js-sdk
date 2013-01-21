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

  <!DOCTYPE HTML>
  <html lang="en-US">
    <head>
      <meta charset="UTF-8">
      <title>Hello World!</title>
      <script type="text/javascript" src="http://code.jquery.com/jquery-1.8.2.min.js"></script>
      <script type="text/javascript" src="http://api.webshell.io/sdk/js?key={API_KEY}"></script>
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

Pretty simple hm ?! You can call any other APIs on the platform in the same way. More information : Javascript SDK. The javascript given in the code attribute of wsh.exec() is processed on our server and we retrieve all kind of data for you.

Read more in the [Webshell documentation](http://webshell.io/docs)