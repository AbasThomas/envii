# envvy-cli

`envvy-cli` is the official CLI for envvy.

## Commands

- `envvy login`
- `envvy init`
- `envvy backup`
- `envvy restore [repoSlug]`
- `envvy list`
- `envvy commit -m "message"`
- `envvy push`
- `envvy pull`
- `envvy fork <repoId>`
- `envvy star <repoId>`
- `envvy watch`

## Local Development

```bash
cd cli
npm install
npm run build
node ./bin/envvy.js --help
```
