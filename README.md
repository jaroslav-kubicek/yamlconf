# yamlconf
An alternative approach to the application configuration, with yaml and env variables.

## Getting started

To start using this, simply require yamlconf function and call it:

```javascript
const config = require('yamlconf')();
```

It will try to load configuration defined in `./config.yaml` file.

## Reasons to implement this

**Why yet another npm module for app configuration?**

Yes, you are right, there are plenty of them, 
you may know [node-yaml-config](https://www.npmjs.com/package/node-yaml-config)
or [yaml-config](https://www.npmjs.com/package/yaml-config), 
but none of them actually conform with something I  would call *"good manners"*. What are they?

- You should NOT define special blocks of configuration for each of your environments.
  If you do this, you may quickly end up with huge file containing something like this:
  ```
  dev-123-feature:
    apiLimit: 123
    
  stage-2.1:
    debug: false
  ...
  ```
  
  Instead, you should have just one config file
  and the values defined there can be overridden by "local" configuration if needed.
  
  In practice, you have `config.yaml` and your CI tool (or developer) may add `config.local.yaml` 
  during build process to successfully setup the application with desired configuration. 
  **Important note here:** This custom local configuration file should't be tracked by VCS.
    
- You should be able to set credentials and secret keys easily 
without exposing them in source code.

  Environment variables suit the best for this - you can define them on the 
  fly and out of the scope of the application source code.
  
  Yamlconf supports both environment variables and `.env` file, so you can define configuration in this way:
  
  In `.env`:
  ```
  REDIS=redis://yourhost:6379
  ```
  
  and in `config.yaml`:
  ```
  services:
    redis: process.env.REDIS
  ```
  
  It should be already obvious, but I strictly discourage you to 
  have `.env` tracked by VCS.
  
  
- The philosophy behind yamlconf 
 should match with [*"The twelve-factor app"*](http://12factor.net/) methodology.
  

**Why YAML and not JSON?**

IMHO because json is not simply the appropriate format for the configuration.
For example:
- It's too verbose and no human friendly.
- You have to edit also an already existing line when adding new object property or array item.
- You can't use comments at all.
