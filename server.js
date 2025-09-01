// 필요 라이브러리(모듈) 가져오기 및 객체화
const express = require("express");
const app = express();

const path = require("path");

// web3 가져오기, 연결하기, WEB3와 컨트랙트 객체화
const { Web3 } = require("web3");
const web3 = new Web3("http://localhost:7545");

const contract = require("./contracts/helloworld.js");
const sc = new web3.eth.Contract(contract.abi, contract.address);

const tcontract = require("./contracts/mytoken.js");
const tsc = new web3.eth.Contract(tcontract.abi, tcontract.address);

const vcontract = require("./contracts/voting.js");
const vsc = new web3.eth.Contract(vcontract.abi, vcontract.address);

// 서버설정
const port = 3000; // 0~65535, 0~1024 예약포트, 1024~ 이후로 사용

// body-parser 설정
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// 라우팅 url : / , method: GET
app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "views", "index.html"));
});

// 라우팅 url : /hello-world, method: GET
app.get("/hello-world", (req, res) => {
  // hello-world-shadow html을 응답으로 보내기
  console.log("hello-world-shadow.html sent.");

  res.sendFile(path.join(__dirname, "views", "hello-world-shadow.html"));
});

// 라우팅 /mytoken GET
app.get("/mytoken", (req, res) => {
  console.log("mytoken-shadow.html sent.");
  res.sendFile(path.join(__dirname, "views", "mytoken-shadow.html"));
});

// 라우팅 /voting GET
app.get("/voting", (req, res) => {
  console.log("voting-shadow.html sent.");
  res.sendFile(path.join(__dirname, "views", "voting-shadow.html"));
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

  console.log("(HELLOWORLD)query message requested: ", sender);

  try {
    const message = await sc.methods.message().call();

    // 결과를 응답하기
    res.status(200).send({ message });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 라우팅 url : /mytoken/mt/tx, method:POST
app.post("/mytoken/mt/tx", async (req, res) => {
  // 요청문서에서 데이터 꺼내기
  const from = req.body.from;
  const to = req.body.to;
  const amount = req.body.amount;

  // 로그남기기
  console.log("(MYTOKEN)trans message requested: ", from, to, amount);

  try {
    // contract 전송호출
    const message = await tsc.methods.transfer(to, amount).send({ from: from });
    // const blockNumber = Number(await web3.eth.getBlockNumber());
    // 결과응답하기
    txhash = message.transactionHash;
    res.status(200).send({ txhash });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 라우팅 /mytoken/mt GET
app.get("/mytoken/mt", async (req, res) => {
  // 요청문서에서 데이터 꺼내기
  const from = req.query.from;

  // 로그남기기
  console.log("(MYTOKEN)query message requested: ", from);

  try {
    // contract 전송호출
    const message = Number(await tsc.methods.balanceOf(from).call());
    // const blockNumber = Number(await web3.eth.getBlockNumber());
    // 결과응답하기
    res.status(200).send({ message });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// (TODO) 라우팅 /mytoken/mt POST

// voting 라우팅 1 /voting/candidates GET
app.get("/voting/candidates", async (req, res) => {
  // 퀴리에서 데이터 꺼내기
  const sender = req.query.sender;

  // 로그남기기
  console.log("(VOTING)query candidates message requested: ", sender);

  try {
    // contract 조회
    const candidateList = await vsc.methods.getAllCandidates().call();

    let candidates = [];
    for (let candidate of candidateList) {
      candidates.push({
        name: web3.utils.toAscii(candidate),
        votes: Number(await vsc.methods.totalVotesFor(candidate).call()),
      });
    }

    res.status(200).send({ candidates });
  } catch (error) {
    console.error(error);
    res.status(500).send(error); // internal server error code sent to client
  }
});

// (TODO) voting 라우팅 2 /voting/candidate PUT
// (TODO) voting 라우팅 3 /voting/candidate GET
// (TODO) voting 라우팅 4 /voting/candidate POST

// 서버 시작 (listen)
app.listen(port, () => {
  console.log(`WEB3 shadow server app listening on port ${port}.`);
});
