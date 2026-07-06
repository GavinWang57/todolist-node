const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errorHandle = require("./errorHandle");
const todos = [];

const requestListener = (request, response) => {
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };

  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });

  console.log(request.url);
  console.log(request.method);

  if (request.url === "/todos" && request.method === "GET") {
    response.writeHead(200, headers);
    response.write(
      JSON.stringify({
        status: "success",
        data: todos,
        note: "GET 請求成功",
      }),
    );
    response.end();
  } else if (request.url === "/todos" && request.method === "POST") {
    request.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            id: uuidv4(),
            title: title,
          };
          todos.push(todo);
          response.writeHead(200, headers);
          response.write(
            JSON.stringify({
              status: "success",
              data: todos,
              message: "POST 請求成功",
            }),
          );
          response.end();
        } else {
          errorHandle(response);
        }
      } catch (error) {
        errorHandle(response);
      }
    });
  } else if (request.url === "/todos" && request.method === "DELETE") {
    todos.length = 0;
    response.writeHead(200, headers);
    response.write(
      JSON.stringify({
        status: "success",
        data: todos,
        message: "刪除所有 todo 成功",
      }),
    );
    response.end();
  } else if (request.url.startsWith("/todos/") && request.method === "DELETE") {
    console.log("request.url:", request.url);
    const id = request.url.split("/").pop();
    console.log("id:", id);
    const index = todos.findIndex((todo) => todo.id === id);
    todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      response.writeHead(200, headers);
      response.write(
        JSON.stringify({
          status: "success",
          data: todos,
          message: `刪除指定 todo id:${id} 成功`,
        }),
      );
      response.end();
    } else {
      errorHandle(response);
      return;
    }
  } else if (request.url.startsWith("/todos/") && request.method === "PATCH") {
    request.on("end", () => {
      try {
        const id = request.url.split("/").pop();
        const index = todos.findIndex((todo) => todo.id === id);
        const title = JSON.parse(body).title;
        if (title !== undefined && index !== -1) {
          todos[index].title = title;
          response.writeHead(200, headers);
          response.write(
            JSON.stringify({
              status: "success",
              data: todos,
              message: `更新指定 todo id:${id} 成功`,
            }),
          );
          response.end();
        } else {
          errorHandle(response);
        }
      } catch (error) {
        errorHandle(response);
      }
    });
  } else {
    response.writeHead(404, headers);
    response.write(
      JSON.stringify({
        status: "false",
        message: "無此路由",
      }),
    );
    response.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
