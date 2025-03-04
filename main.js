import { readFile } from 'fs';
import { writeFile } from 'fs/promises';

//Read Stream file

function jsonReplace(key, val)
{
    if (key === 'friends')
    {
        return JSON.parse(val);
    } else {
        return val;
    }
}
async function ingest()
{
    let ingest = await readFile('users.json', 'utf-8', (err, data) => {
        if (err) throw err;
        else 
        {
            //Array of objects
            let json = JSON.parse(data);

            //Remove duplicates
            //using hashmap, key = id, val = array containing indexes
            let hm = new Map();

            for (let i = 0; i <= json.length - 1; i++)
            {
                //If no key
                //Add idx to json obj
                let obj = json[i];
                obj['idx'] = i;
                if (hm.has(obj.id) === false)
                {
                    let arr = [];
                    arr.push({id: obj.id, idx: i});
                    hm.set(obj.id, arr);
                }

                //If key exists
                else 
                {
                    let arr = hm.get(obj.id);
                    arr.push({id: obj.id, idx: i});
                    hm.set(obj.id, arr);
                }
            }

            //Cleaned hashmap
            let cleaned = new Map();
            hm.forEach((val, key) => {
                let arr = val;
                //Duplicates are present
                if (val.length > 1)
                {
                    for (let j = arr.length - 1; j > 0; j--)
                    {
                       arr.splice(j, 1); 
                    }
                }
                
                cleaned.set(key, arr);
            })

            //Make new JSON object
            let newjson = [];
            let mapkeys = hm.keys();
            for (let k of mapkeys)
            {
                let userobj = {};
                let jsonobj = json.find((o) => o['id'] === k);
                userobj['id'] = jsonobj['id'];
                userobj['name'] = jsonobj['name'];
                userobj['dateOfBirth'] = jsonobj['dateOfBirth'];
                userobj['mobileNo'] = jsonobj['mobileNo'];
                userobj['picURL'] = jsonobj['picURL'];

                //For the Friends
                // console.log(jsonobj['friends'])
                let friendArr = [];
                for (let friendID of jsonobj['friends'])
                {
                    let friendObj = json.find((o) => o['id'] === (friendID));

                    //Delete idx property
                    delete friendObj['idx'];

                    let newFriend = {};
                    newFriend['id'] = friendObj['id'];
                    newFriend['name'] = friendObj['name'];
                    newFriend['dateOfBirth'] = friendObj['dateOfBirth'];
                    newFriend['mobileNo'] = friendObj['mobileNo']
                    newFriend['picURL'] = friendObj['picURL']

                    friendArr.push(newFriend)
                    
                }
                
                userobj['friends'] = friendArr;

                //append to end of array 
                newjson.push(userobj);

            }

            // console.log(newjson)
            //Making JSON file
            const jsonData = JSON.stringify(newjson, null, 2); //2 Indentation
            writeFile('cleaned.json', jsonData);



            
        }
})

    return await ingest
} 

await ingest();
