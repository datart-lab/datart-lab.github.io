# Datart Lab Website

Single-page Jekyll site for Datart Lab.

## Local Development

Install dependencies:

```sh
bundle config set path .bundle
bundle install
```

Run the local server:

```sh
bundle exec jekyll serve --livereload
```

The configured local port is `4001`, so the site is available at `http://127.0.0.1:4001/`.

## Content

- Main page sections are composed in `index.html`.
- Site copy and section labels live in `_data/settings.yml`.
- Publications live in `_data/publications.csv`.
- Publication groups live in `_data/publication_groups.yml`.
- Project cards live in `_works/`.
- Collaborator logos are configured in `_data/settings.yml` and stored in `images/`.

## Maintenance Notes

Generated files are intentionally ignored. Do not commit `_site/`, `.jekyll-cache/`, `.bundle/`, or `vendor/`; rebuild them locally with Bundler and Jekyll.
