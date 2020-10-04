# Laravel Localization in Javascript

This repository contains Javascript file to call similar function like Laravel localization. 

### How to use?

You have to set source data. Source data must be in JSON format. In this case, I use an API to get JSON format and store it to `localStorage()` Javascript . Because I use `localStorage()` to store source data, I added `lang.php` file in language, which contains an item `version` to store version, and if there was a changes in localization data, I just need to modify `version` value.

`lang.php`

```php
<?php

return [
    'version' => 'v1'
];

```



Here is my API function to get Laravel localization data

```php
use App\Models\API\Response\BodyResponse; //BodyResponse is my own response body model
use Illuminate\Support\Facades\File;

public static function get($locale)
    {
        $langPath = resource_path('lang/');
        $localization = collect(File::allFiles($langPath.$locale))->flatMap(function ($file) {
            return [
                ($translation = $file->getBasename('.php')) => trans($translation),
            ];
        });

        if(File::exists($langPath.$locale.'.json')){
            $localization = array_merge($localization->toArray(), json_decode(file_get_contents($langPath.$locale.'.json'),true));
        }

        $body = new BodyResponse(); 
        $body->body_message = "Localization get";
        $body->body_data = $localization;
        return $body;
    }

```



### Simple Translation

To get simple translation you can call `trans()` function

```javascript
lang.trans('validation.required', {'attribute': 'Username/email'})
```



### Choice Translation

To get choice translation you can call `choice()` function

```javascript
minlength: lang.trans('validation.min.numeric', {'attribute': 'password','min': 8}),
```

