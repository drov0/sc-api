TODO :

Add a proper documentation of all the possible outputs

# Json examples

## Add a group

> curl --data 'data={"data":{"action":"add","list":"group","name":"noganoo","description":"bad mofo", "username":"howo", wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

## Add an user to the blacklist

> curl --data 'data={"data":{"action":"add","list":"blacklist","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

## Add an user to the low_quality list

> curl --data 'data={"data":{"action":"add","list":"low_quality","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

## Edit a group :

> curl --data 'data={"data":{"action":"edit","list":"group","name":"noganoo","description":"meanie", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

## Edit a list

> curl --data 'data={"data":{"action":"edit","list":"blacklist","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

## Delete from list

> curl --data 'data={"data":{"action":"delete","list":"blacklist","name":"noganoo", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

## Delete group

> curl --data 'data={"data":{"action":"delete","list":"group","name":"noganoo", "username":"howo",wif:"yourwifhere", "type":"memo"}}' http://localhost:8080

## Get an user

> curl --data 'data={"data":{"action":"get","name":"noganoo"}}' http://localhost:8080

returns {"list":"none"} or {"list":"low_quality"} or {"list":"blacklist"}
