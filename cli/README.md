# envii-cli

`envii-cli` is the official CLI for envii.

## Commands

- `envii login`
- `envii init`
- `envii backup`
- `envii restore [repoSlug]`
- `envii list`
- `envii commit -m "message"`
- `envii push`
- `envii pull`
- `envii fork <repoId>`
- `envii star <repoId>`
- `envii watch`

## Local Development

```bash
cd cli
npm install
npm run build
node ./bin/envii.js --help
```
