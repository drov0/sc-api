![SteemCleaners.png](https://steemitimages.com/DQmNc5J8wnGVEjoSEt1uFR5ya8E2VoidhuTVHTok49vue94/SteemCleaners.png) 

A few weeks ago as I was working on the steempress voting bot I figured it would be a nice idea to implement the steemcleaner blacklist to avoid voting on bad content that will get flagged anyways. So I reached out to @patrice and realized that there wasn't one. But There was an excel spreadsheet. 

So I made a first version which just pulled everything from that spreadsheet and auto updated. But then I realized that while I'm at it I might as well write a complete api for them. 

The needs are relatively simple : 

- An api to perform Create Read Update Delete (CRUD) on the data.

- Authentification via steem accounts to prevent people from editing the data 

- A get function which returns if the user is in the blacklist or low quality list

  ​

But then I wanted to produce a really clean a good product with tons of comprehensive error messages and an easy to read code which took quite some time to get right.  

The code can be found here : https://github.com/drov0/sc-api

## Database architecture :

![](https://steemitimages.com/DQmWfHbg1wDXcqwV7Fy5ezu1PXBQXD9fZxkGKYiWCngFXQo/image.png)

### _group : 

An abuser may have several accounts, this table is here to provide an id that will be put on the lists so that you can easily link accounts to a specific abuser. 

* name : Name of the group (Eg : noganoo)

* Description : Description of the abuser


### blacklist / low quality

Those are the actual lists where we store the account names. 

* name (primary key) : name of the account
* _group (foreign key on the id field from the _group table) : group id of the user. 
  Note that the foreign key has ON DELETE CASCADE, so if you delete the group, all the users that had that id on both lists will be deleted as well.
* category : flag category, it's used to determine at which percent the bot should flag it.
* added_by : username of the person reporting that abuser.

# API Endpoints

All queries must be done on the root (aka /) via a post request with a single variable "data" which will contain a json string with the data.

If you have curl a good way to test it is to use this command :

> curl --data 'data={json_string}' <http://localhost:8080>

If you have trouble reading the json, I encourage you to use https://jsoneditoronline.org/ to set it to a more readable format.

All operations except the get operation require authentication.

if you provide an incorrect json the api will return  :

```
{error:"Invalid json"}
```

If you provide an incorrect action the api will return :

```
{error: "Unknown action"}
```

If the api had an sql error the api will return 

```
{error: "Internal error"}
```

 In that case please contact me with the data you sent this should never happen.

## Add a group 

> curl --data 'data={"data":{"action":"add","list":"group","name":"noganoo","description":"The infamous spammer", "username":"howo", wif:"yourwifhere", "type":"memo"}}' <http://localhost:8080>
> 

Parameters :

{
  "data": {
    "action": "add", // create action
    "list": "group", // Create a new group
    "name": "noganoo", // name of the new group
    "description": "The infamous spammer", // Description of the group
    "username": "howo", // Since it's a create operation you have to authenticate 
    "wif": "yourwifhere", // Your private posting or memo key
    "type": "memo" // memo if you used your private memo key or posting if you used your posting key 
  }
}

### Returns :

```
{ok:"ok"}
```

If all went well 

```
{error: "Group name already defined"}
```

If there is already a group by that name 

```
{error: "invalid name or description"}
```

If you did not provide a name or description parameter or if one of those is empty.

## Add an user to the blacklist/low quality list 

> curl --data 'data={"data":{"action":"add","list":"blacklist","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

{
  "data": {
    "action": "add", // Create action
    "list": "blacklist", // Add an user to the blacklist list
    "name": "Spammer123", // account name 
    "group": "noganoo", // group (group must exist)
    "category": "1", // Flag category
    "added_by": "patrice", // User that added it 
    "username": "howo", // Since it's a create operation you have to authenticate 
    "wif": "yourwifhere", // Your private posting or memo key
    "type": "memo" // memo if you used your private memo key or posting if you used your posting key 
  }
}

**Same goes to add an user to the low_quality list except the "list" parameter is to be set to "low_quality"**

example :

> curl --data 'data={"data":{"action":"add","list":"low_quality","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

### Returns :

```
{ok: "ok"}
```

If all went well 

```
{error: "User is already in the low_quality list"}
```

If you try to insert an user in the blacklist but he's already in the low_quality list 

```
{error: "User is already in the blacklist list"}
```

If you try to insert an user in the low_quality but he's already in the blacklist 

```
{error: "User is already in the list"}
```

If you try to insert an user in a list and he's already in it.

```
{error: "Group name unknown"}
```

If the group name provided is unknown 

```
{error: "invalid parameters."}
```

If you did not set the parameters correctly. 



## Edit a group

> curl --data 'data={"data":{"action":"edit","list":"group","name":"noganoo","description":"meanie", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

{
  "data": {
    "action": "edit", // edit action
    "list": "group", // edit  a  group
    "name": "noganoo", // name of the group to edit
    "description": "Stole my sweet roll.", // Updated description of the group
    "username": "howo", // Since it's an edit operation you have to authenticate 
    "wif": "yourwifhere", // Your private posting or memo key
    "type": "memo" // memo if you used your private memo key or posting if you used your posting key 
  }
}

### Returns

```
{ok: "ok"}
```

If all went well 

```
{error: "group not found"}
```

If you provided a group name that you does not exists 

```
{error: "invalid name or description"}
```

If you did not provide a name or description parameter or if one of those is empty.

### Edit the blacklist/low_quality list

> curl --data 'data={"data":{"action":"edit","list":"blacklist","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

{
  "data": {
    "action": "edit", // Edit action
    "list": "blacklist", // edit the entry in the blacklist list
    "name": "spammer123", // account name 
    "group": "noganoo", // group (group must exist)
    "category": "1", // Flag category
    "added_by": "patrice", // User that added it 
    "username": "howo", // Since it's an edit operation you have to authenticate 
    "wif": "yourwifhere", // Your private posting or memo key
    "type": "memo" // memo if you used your private memo key or posting if you used your posting key 
  }
}

**Same goes to edit an user in the low_quality list except the "list" parameter is to be set to "low_quality"**

### Returns :

```
{ok: "ok"}
```

If everything went well 

```
{error: "username not in the list"}
```

If you provided an username that is not in the list.

```
{error: "Group name unknown"}
```

If you provided a group name that is not in the _group table 

```
{error: "invalid parameters."}
```

If you did not set the parameters correctly. 



## Delete a group 

> curl --data 'data={"data":{"action":"delete","list":"group","name":"noganoo", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

{
  "data": {
    "action": "delete", // Delete operation
    "list": "group", // Delete from the group table
    "name": "noganoo", // Group name to delete
    "username": "howo", // Since it's a delete operation you have to authenticate 
    "wif": "yourwifhere", // Your private posting or memo key
    "type": "memo"// memo if you used your private memo key or posting if you used your posting key 
  }
}

Note that if you delete the group, all the users that had that id on both lists will be **deleted as well**.

### Returns :

```
{ok: "ok"}
```

If all went well

```
{error: "group not found"}
```

If you provided a group name that doesn't exists

```
{error: "invalid name"}
```

If you did not provide a group name or if the group name is empty.

### Delete from a list 

> curl --data 'data={"data":{"action":"delete","list":"blacklist","name":"spammer123", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

{
  "data": {
    "action": "delete", // Delete operation
    "list": "blacklist", // Delete from the backlist 
    "name": "spammer123", // Name of the user to delete
    "username": "howo",  // Since it's a delete operation you have to authenticate 
    "wif": "yourwifhere",  // Your private posting or memo key
    "type": "memo" // memo if you used your private memo key or posting if you used your posting key 
  }
}

### Returns 

```
{ok: "ok"}
```

If all went well.

```
{error: "username not in the list"}
```

If you try to delete an username that is not in the list 

```
{error: "invalid parameters."}
```

If you do not provide a name 

```
{error: "Unknown list"} 
```

If the list parameter is neither group blacklist or low_quality



## Get an user 

> curl --data 'data={"data":{"action":"get","name":"noganoo"}}' http://localhost:8080

{
  "data": {
    "action": "get", // get operation
    "name": "noganoo" // Username that you want to test
  }
}

### Returns :

```{list:"blacklist"}```
If the user is in the blacklist 
```{list:"low_quality"}```
If the user is in the low quality list

```{list:"none"}```

If the user is in neither (yey !)

```{error: "invalid parameters."}```
If the name parameter is not set


# Technology Stack

The tech stack is pretty simple :

* Nodejs with express to recieve requests

* Mysql to store the data itself 

* Steemjs to handle authentification

  ​

# Roadmap

If I manage to get some time I'll do  :

* Convert the API to rest 
* write an actual website on top of the api to allow the steemcleaners folks to interact with the api without any technical knowledge
* Do all the //TODO in the code 
* Actually put it in a production server to be used

# How to contribute?

There are a few //TODO comments in the code, you should start by implementing those. Then submitting a pull request. But of course any improvement is welcome :) 
