// 필요 라이브러리(모듈) 가져오기 및 객체화
const express = require("express");
const app = express();

const path = require("path");

// web3 가져오기, 연결하기, WEB3와 컨트랙트 객체화
const { Web3 } = require("web3");
const web3 = new Web3("http://localhost:7545");
const contract = require("./contracts/helloworld.js");
const sc = new web3.eth.Contract(contract.abi, contract.address);

// 서버설정
const port = 3000; // 0~65535, 0~1024 예약포트, 1024~ 이후로 사용

// body-parser 설정
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// 라우팅 url : / , method: GET
app.get("/", (request, response) => {
  response.send("Hello World!");
});

// 라우팅 url : /hello-world, method: GET
app.get("/hello-world", (req, res) => {
  // hello-world-shadow html을 응답으로 보내기
  console.log("hello-world-shadow.html sent.");

  res.sendFile(path.join(__dirname, "views", "hello-world-shadow.html"));
});

// 라우팅 url : /hello-world/message, method: PUT
app.put("/hello-world/message", async (req, res) => {
  // 요청문서에서 데이터 꺼내기
  const sender = req.body.sender;
  const message = req.body.message;

  console.log("new message requested: ", sender, message);

  try {
    // Smart Contract tx제출하기
    const result = await sc.methods.update(message).send({ from: sender });

    const newMessage = await sc.methods.message().call();
    const blockNumber = Number(await web3.eth.getBlockNumber());

    // 결과를 응답하기
    res.status(200).send({ newMessage, blockNumber });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 라우팅 url : /hello-world/message, method: GET
app.get("/hello-world/message", async (req, res) => {
  // 요청문서에서 데이터 꺼내기
  const sender = req.query.sender;

  console.log("query message requested: ", sender);

  try {
    const message = await sc.methods.message().call();

    // 결과를 응답하기
    res.status(200).send({ message });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 서버 시작 (listen)
app.listen(port, () => {
  console.log(`WEB3 shadow server app listening on port ${port}.`);
});
