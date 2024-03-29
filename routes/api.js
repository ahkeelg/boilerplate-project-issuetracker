// 'use strict';

const express = require("express");
const bodyParser = require("body-parser");

app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// check if project exists (returns index of data)
const doesProjectExist = (name) => {
  for (let i in data) {
    if (data[i].projectName == name) {
      return i;
    }
  }
  return false;
};

// post data
const postIssue = (pIndex, formData, res) => {
  let { issue_title, issue_text, created_by, assigned_to, status_text } =
    formData;

  if (!issue_title || !issue_text || !created_by) {
    res.json({ error: "required field(s) missing" });
  } else {
    let obj = {
      assigned_to: assigned_to || "",
      status_text: status_text || "",
      open: true,
      _id: uid(),
      issue_title: issue_title || "",
      issue_text: issue_text || "",
      created_by: created_by || "",
      created_on: new Date(),
      updated_on: new Date(),
    };
    data[pIndex].issues.push(obj);
    res.json(obj);
  }
};

// id generator
const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// get issue with querys
const filters = (query, pIndex) => {
  let {
    assigned_to,
    status_text,
    open,
    _id,
    issue_title,
    issue_text,
    created_by,
    created_on,
    updated_on,
  } = query;

  let issuePos = [];

  for (let [keys, values] of Object.entries(query)) {
    if (typeof values == "object") {
      for (let i of values) {
        for (let j in data[pIndex].issues) {
          if (data[pIndex].issues[j][keys].toString() == i) {
            if (
              issuePos.filter((obj) => obj._id == data[pIndex].issues[j]._id)
                .length == 0
            ) {
              issuePos.push(data[pIndex].issues[j]);
            }
          }
        }
      }
    } else {
      for (let i in data[pIndex].issues) {
        if (data[pIndex].issues[i][keys].toString() == values) {
          if (
            issuePos.filter((obj) => obj._id == data[pIndex].issues[i]._id)
              .length == 0
          ) {
            issuePos.push(data[pIndex].issues[i]);
          }
        }
      }
    }
  }
  return issuePos;
};

// return position of the data (find by id)
const findIssue = (index, id) => {
  for (let i in data[index].issues) {
    if (data[index].issues[i]._id == id) return i;
  }
  return false;
};

var data = [
  {
    projectName: "apitest",
    issues: [
      {
        assigned_to: "assigned_to",
        status_text: "status_text",
        open: true,
        _id: "id1",
        issue_title: "issue_title",
        issue_text: "issue_text",
        created_by: "created_by",
        created_on: "10/27/2023",
        updated_on: "12/27/2024",
      },
      {
        assigned_to: "assigned_toto",
        status_text: "status_textto",
        open: false,
        _id: "id5",
        issue_title: "issue_titleto",
        issue_text: "issue_textto",
        created_by: "created_byto",
        created_on: "10/09/2024",
        updated_on: "11/09/2025",
      },
    ],
  },
  {
    projectName: "testtest",
    issues: [
      {
        assigned_to: "assigned_to2",
        status_text: "status_text2",
        open: true,
        _id: "id2",
        issue_title: "issue_title2",
        issue_text: "issue_text2",
        created_by: "created_by2",
        created_on: "10/12/2024",
        updated_on: "11/12/2024",
      },
    ],
  },
  {
    projectName: "test",
    issues: [
      {
        assigned_to: "assigned_to3",
        status_text: "status_text3",
        open: false,
        _id: "id3",
        issue_title: "issue_title3",
        issue_text: "issue_text3",
        created_by: "created_by3",
        created_on: "10/11/2023",
        updated_on: "11/11/2024",
      },
    ],
  },
];
var obj = {};

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      let index = doesProjectExist(project);

      if (doesProjectExist(project) !== false) {
        if (Object.keys(req.query).length == 0) {
          res.json(data[index].issues);
        } else {
          res.json(filters(req.query, index));
        }
      }
    })
    // done
    .post(function (req, res) {
      let project = req.params.project;

      if (doesProjectExist(project) != false) {
        let index = doesProjectExist(project);
        postIssue(index, req.body, res);
      } else {
        data.push({ projectName: project, issues: [] });
        let index = doesProjectExist(project);
        postIssue(index, req.body, res);
      }
    })

    .put(function (req, res) {
      let project = req.params.project;
      let open = true;
      let { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      if (req.body.hasOwnProperty("open")) open = req.body.open;

      if (!req.body._id) {
        return res.json({ error: "missing _id" });
      } else if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        return res.json({ error: "no update field(s) sent", _id: req.body_id });
      }

      if (doesProjectExist(project) !== false) {
        let index = doesProjectExist(project);
        if (findIssue(index, req.body._id) !== false) {
          let i = findIssue(index, req.body._id);
          data[index].issues[i].assigned_to = req.body.assigned_to;
          data[index].issues[i].status_text = req.body.status_text;
          data[index].issues[i].open = req.body.open || true;
          data[index].issues[i].issue_title = req.body.issue_title;
          data[index].issues[i].issue_text = req.body.issue_text;
          data[index].issues[i].created_by = req.body.created_by;
          data[index].issues[i].updated_on = new Date();

          res.json({ result: "successfully updated", _id: req.body._id });
          return;
        } else {
          res.json({ error: "could not update", _id: req.body._id });
          return;
        }
      } else {
        return res.json({ error: "could not update", _id: req.body._id });
      }
    })

    .delete(function (req, res){
      let project = req.params.project;
      
      if(doesProjectExist(project) !== false){
        let index = doesProjectExist(project);

        if(!req.body._id) res.json({ error: 'missing _id' });
        
        if(findIssue(index, req.body._id) !== false){
          let i = findIssue(index, req.body._id);
          
          data[index].issues.splice(i, 1);
          return res.json({result: "successfully deleted", _id: req.body._id});
        }
        
      
        else return es.json({error: "could not delete", _id: req.body._id});
    
      }
    });
};
