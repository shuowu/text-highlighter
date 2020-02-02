# TextHighlighter

This is a fork of [mir3z/texhighlighter](https://github.com/mir3z/texthighlighter).

## What's new

1. Migrate to ES module system.
2. Use `Rollup` as module bundler.
3. Export in both `es module` and `iife` format for browser use.
4. Publish in npm.

## Installation

```
npm install --save-dev texthighlighter
```

## Getting started

Use ES module

```
import TextHighlighter from 'texthighlighter'
```

Use IIFE

Add minified script file to head section of your web page, the file can be find in `node_modules/texthighlighter-esm/dist/bundle.min.js`. Feel free to upload it into CDN or move to the src folder.

Include minified lib file in HTML

```
<script type="text/javascript" src="bundle.min.js"></script>
```

## How to use

```
var hltr = new TextHighlighter(document.body);
```

For more details see [API reference](http://mir3z.github.io/texthighlighter/doc/index.html) or 
[Wiki](https://github.com/mir3z/texthighlighter/wiki) pages on GitHub.

## Development

Install dependencies

```
npm install
```

Local dev

```
npm run dev
```

Run static pages (index, demos, doc) locally

```
npm run static
```

For more informatin, please refer to `scripts` section in package.json.

## Features

* Highlighting of selected text.
* Highlighting all occurrences of given text (find & highlight).
* Removing highlights.
* Selecting highlight color.
* Serialization & deserialization.
* Works well in iframes.
* Keeps DOM clean.
* No dependencies. No jQuery or other libraries needed.

## Compatibility

Should work in all decent browsers and IE >= 9.

## Demos

* [Simple demo](http://mir3z.github.io/texthighlighter/demos/simple.html)
* [Callbacks](http://mir3z.github.io/texthighlighter/demos/callbacks.html)
* [Serialization](http://mir3z.github.io/texthighlighter/demos/serialization.html)
* [Iframe](http://mir3z.github.io/texthighlighter/demos/iframe.html)

## Documentation
   
You may check [API reference](http://mir3z.github.io/texthighlighter/doc/index.html) or 
[Wiki](https://github.com/mir3z/texthighlighter/wiki) pages on GitHub.
