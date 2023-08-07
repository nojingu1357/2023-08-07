const express = require("express");
const app = express();
//----------------------------------------------------------------------------------------------------------
const OrientDB = require("orientjs");
const server = OrientDB({
  host: "localhost",
  port: 2424,
  username: "username",
  password: "password",
  useToken: true,
});
const db = server.use({
  name: "name",
  username: "username",
  password: "password",
});
console.log("---- orientDB is working now ----");
//----------------------------------------------------------------------------------------------------------
app.locals.pretty = true;
app.set("view engine", "pug");
app.set("views", "./view");
//----------------------------------------------------------------------------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
//----------------------------------------------------------------------------------------------------------

app.get(["/main", "/main/:id", "/main/:id/:sub"], (req, res) => {
  const select = "SELECT * FROM topic";
  const id = req.params.id;
  const sub = req.params.sub;
  db.query(select).then((topics) => {
    if (topics.length === 0) {
      console.log("Topics is empty");
      res.status(500).send("Topics is Empty... Please create new");
    } else if (id === "create") {
      res.render("create", { topics: topics });
    } else if (sub === "edit") {
      const select = "SELECT * FROM topic WHERE @rid=:rid";
      db.query(select, { params: { rid: id } }).then((topic) => {
        res.render("edit", { topics: topics, topic: topic[0] });
      });
    } else if (sub === "delete") {
      res.render("delete", {
        topics: topics,
        id: id,
      });
    } else if (id) {
      const sql = "SELECT * FROM topic WHERE @rid=:rid";
      db.query(sql, { params: { rid: id } }).then((topic) => {
        res.render("main", {
          topics: topics,
          topic: topic[0],
        });
      });
    } else {
      res.render("main", {
        topics: topics,
      });
    }
  });
});

app.post("/main/create", (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const author = req.body.author;
  const insert =
    "INSERT INTO topic (title, description, author) VALUES(:t, :d, :a)";
  db.query(insert, { params: { t: title, d: description, a: author } }).then(
    (results) => {
      res.redirect("/main/" + encodeURIComponent(results[0]["@rid"]));
    }
  );
});

app.post("/main/:id/edit", (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const description = req.body.description;
  const author = req.body.author;
  const update =
    "UPDATE topic SET title=:t, description=:d, author=:a WHERE @rid=:rid";
  db.query(update, {
    params: {
      t: title,
      d: description,
      a: author,
      rid: id,
    },
  }).then((results) => {
    res.redirect("/main/" + encodeURIComponent(id));
  });
});

app.post("/main/:id/deleted", (req, res) => {
  const id = req.params.id;
  const DELETE = "DELETE FROM topic WHERE @rid=:rid";
  db.query(DELETE, { params: { rid: id } }).then((results) => {
    res.redirect("/main");
  });
});

app.listen(3000, () => {
  console.log("---- Express sounds GOOD! ----");
});

/**구현 못한 기능....
  1. alret 사용해서 지울껀지 물어보는 기능
  2. delete 페이지에서 이동 안하고 바로 지우는거 
  3. 링크를 걸면 보안에 취약하다는데 잘 모르겠다 
 */
