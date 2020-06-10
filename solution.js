"use strict";
const fs = require("fs");

//obtain arguments from terminal
const ReadFileName = process.argv[2];
const WriteFileName = process.argv[3];

//Read file
fs.readFile(ReadFileName, "utf8", function (err, data) {
  if (err) throw err;
  const objs = JSON.parse(data);
  const formattedObjects = [];

  //Formats the objects to the desired output
  objs.forEach((obj) => {
    return formattedObjects.push({ task: obj, subTasks: [] });
  });

  //Filter out the subtasks from the parent tasks
  const parentObjects = formattedObjects.filter((obj) => !obj["task"]["parentID"]);

  const parentIDs = objs.filter((obj) => obj["parentID"]).map((obj) => obj["parentID"]);

  //Accquire a list of unique parentID sub tasks
  const uniqueValues = parentIDs.filter((parentID, index) => {
    return parentIDs.indexOf(parentID) == index;
  });

  const subtasks = [];
  const othersubtasks = [];

  //Groups the subtasks
  uniqueValues.forEach((uniqueValue) => {
    subtasks.push(objs.filter((obj) => obj["parentID"] == uniqueValue));
  });

  //Groups the formatted versions of the objects
  uniqueValues.forEach((uniqueValue) => {
    othersubtasks.push(formattedObjects.filter((obj) => obj["task"]["parentID"] == uniqueValue));
  });


  //Sort the subtasks
  const sortedSubTasks = [];

  othersubtasks.forEach((subtask) => {
    //Grabs the first object which does not contain a previousID
    let firstTask = subtask.find((task) => !task["task"]["previousID"]);

    sortedSubTasks.push(firstTask);

    let proceedingID = firstTask["task"]["nextID"];

    for (var i = 0; i < subtask.length; i++) {
      let currentTask = subtask.find((task) => {
        return proceedingID === task["task"]["ID"];
      });
      sortedSubTasks.push(currentTask);

      if (!currentTask["task"]["nextID"]) break;
      proceedingID = currentTask["task"]["nextID"];
    }
  });

  var groupedTasks = [];

  //Uses the unique values to loop over and grab the sorted subtasks into a group
  uniqueValues.forEach((value) => groupedTasks.push({ ID: value, groupedItems: [] }));
  for (var parentID = 0; parentID < uniqueValues.length; parentID++) {
    sortedSubTasks.forEach((subtask) => {
      if (subtask["task"]["parentID"] == uniqueValues[parentID])
        return groupedTasks[parentID]["groupedItems"].push(subtask["task"]);
    });
  }

  //grabs the subtasks and places into the parent objects
  groupedTasks.forEach((group) => {
    parentObjects.forEach((parentObject) => {
      if (parentObject["task"]["ID"] == group["ID"]) parentObject["subTasks"].push( ...group["groupedItems"]);
    });
  });

  //outputs the final result
  const result = JSON.stringify(parentObjects);
  fs.writeFileSync(WriteFileName, result);
});