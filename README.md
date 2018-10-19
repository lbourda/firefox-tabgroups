Simplified Tab Groups for Firefox
=================================

This project aims to provide a simple add-on to replace some functionalities
from TabView/Tab Groups/Panorama which were removed from Firefox due to a lot
of open bugs and a very low overall usage.

Installation
------------

The add-on is available at [addons.mozilla.org][amo] and should be installed
there to ensure the add-on stays updated.

Warning
-------

Please note that this extension is currently in a very unstable and untested
state and may kill your tabs or small kittens. While it may get improved and
secured in the future, I strongly advise you to make a backup of your important
tabs...

Building
--------

Assuming you have Node.js installed on your machine, building this project
is rather easy.

1. Install the dependencies: `npm install`.
2. Run `npm run build-nowatch` to build all source files into the
   `extension/dist` directory.
   
Alternatively you can run `npm run build` to start a continous build process
to transpile the code into something that can run in Firefox.
This creates a WebExtension in the `extension` subdirectory.
Any time you edit a file, it will be rebuilt automatically.

In another shell window, run the extension in Firefox using a wrapper
around web-ext: `npm start`.
Any time you edit a file, [web-ext][web-ext] will reload the extension.


Contributing
------------

Feel free to [fix some open issues][issues] and submit a pull request. Please
make sure to file the pull request against the `develop` branch, which should
be the default.

If you want to help translating this add-on, feel free to alter or add new
files in `extension/_locales`.

License
-------

MIT.

[amo]: https://addons.mozilla.org/en-US/firefox/addon/tab-groups/
[issues]: https://github.com/denschub/firefox-tabgroups/issues
[web-ext]: https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext
