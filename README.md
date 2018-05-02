

json examples

ALTER TABLE Orders
ADD FOREIGN KEY (PersonID) REFERENCES Persons(PersonID);

ALTER TABLE `blacklist` ADD `_group` INT NOT NULL AFTER `name`;

add a group

curl --data 'data={"data":{"action":"add","list":"group","name":"noganoo","description":"bad mofo"}}' http://localhost:8080

add an user to the blacklist

curl --data 'data={"data":{"action":"add","list":"blacklist","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice"}}' http://localhost:8080

add an user to the low_quality list

{"data":{"action":"add","list":"low_quality","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice"}}


edit a group :

curl --data 'data={"data":{"action":"edit","list":"group","name":"noganoo","description":"meanie"}}' http://localhost:8080

edit a list

curl --data 'data={"data":{"action":"edit","list":"blacklist","name":"noganoo","group":"noganoo","category":"1","added_by":"patrice"}}' http://localhost:8080

delete from list

curl --data 'data={"data":{"action":"delete","list":"blacklist","name":"noganoo"}}' http://localhost:8080

delete group

curl --data 'data={"data":{"action":"delete","list":"group","name":"noganoo"}}' http://localhost:8080

get an user

curl --data 'data={"data":{"action":"get","name":"noganoo"}}' http://localhost:8080

returns {"list":"none"} or {"list":"low_quality"} or {"list":"blacklist"}
