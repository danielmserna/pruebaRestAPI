const app = require("./app");

//start the server
const port = process.env.PORT;

app.listen(port);

console.log(`Server listening on port ${port}`);
