# typescript-node-boilerplate
This is a boilerplate for nodejs project with typescript.  
The followings are details of this boilerplate.  

blog post for this

## npm-script
The commands are orderd alphabetically.
#### `yarn clean`
This command will clean up dist folder that is for build files(.js files)
```zsh
"clean": "rimraf dist/*",
```

#### `yarn dev:watch`
This commands allows run index.ts file without compile and monitor the changes on the file
```zsh
"dev:watch": "ts-node-dev --respwn src/index.ts",
```

#### `yarn dev`
This commands allows run index.ts file without compile
```zsh
"dev": "ts-node src/index.ts",
```


#### `yarn format`
This commands will format all files with the rules that are based on `.eslintrc.js`
```zsh
"format": "prettier --write 'src/**/*.{js,ts,json}'",
```

#### `yarn lint:all`
This command will lint all ts files and run `tsc` without generating any .js files
```zsh
"lint:all": "yarn lint && yarn tscCheck",
```

#### `yarn lint:fix`
This command runs `lint` and modify codes to fix lint errors.
```zsh
"lint:fx": "eslint src/**/*.ts --fix",
```

#### `yarn lint`
This command check all ts files with the rules that are based on `.eslintrc.js`
```zsh
"lint": "eslint src/**/*.ts",
```


#### `yarn start`
This command compiles ts files and run build file which is `dist/index.js`
```zsh
"start": "tsc && node dist/index.js",
```

#### `yarn tscCheck`
This command shows tsc compile errors if there are any issues.
```zsh
"tscCheck": "tsc --noEmit"
```
