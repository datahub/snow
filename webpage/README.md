# Starter kit for interactives

This is a template for creating an interactive. It lets you do a few things out of the box:
- Write ES6 code that gets converted to ES5
- Use JavaScript modules
- Lint your JavaScript
- Minify your JavaScript
- Import Sass and CSS
- Import fonts
- Import data files like CSVs
- See effect of code changes automatically

## Set up

First get the code from this repo on your computer. Here are some options:

Use [degit](https://github.com/Rich-Harris/degit): `degit datahub/interactive-starter-kit`.

Or pull down this repo and remove the `.git` folder: `git pull https://github.com/datahub/interactive-starter-kit && rm -rf .git`

Or download this repo as a zip.

Next you'll need to install the Node.js dependencies.

```
npm install
```

When you're developing you can have it kick off a development server that watches to changes, rebuilds stuff and reloads your browser.

```
npm start
```

When you're done developing, you create a production build of the files.
```
npm run build
```

This will put the built version of the files in the `dist` folder. This folder will
have four elements: `index.html`, `index.js`, `index.css` and a `/static` folder that
be a duplicate of the `src/static` folder.
