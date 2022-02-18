import React, { useState, useEffect } from "react";
import { Modal, Alert, Spinner } from "react-bootstrap";
import { btnStyle, alertStyle } from "./Styles";
import { bringTableInfo, enrollNewOrder, changeStateToServed, addOrder, payProcess, orderCancle } from "../../lib/api/order";
import gorgon from "../../imgs/menuImgs/고르곤졸라.jpg";
import carbo from "../../imgs/menuImgs/까르보나라.jpg";
import riso from "../../imgs/menuImgs/리조또.jpg";
import coffee from "../../imgs/menuImgs/커피.jpg";
import toma from "../../imgs/menuImgs/토마토파스타.jpg";
import "./Table.css";

//테이블 주문을 위한 테이블 버튼과 주문모달 컴포넌트
export default function Table({ tableId, empty, menu, socket }){
  const [show, setShow] = useState(false);
  const [orderIds, setorderIds] = useState([]);
  const [tableEmpty, setTableEmpty] = useState(empty);
  const [orderState, setOrderState] = useState("");
  const [orderContents, setOrderContents] = useState([]);
  const [addedContents, setAddedContents] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [addedPrice, setAddedPrice] = useState(0);
  const [menuImgs, setMenuImgs] = useState([gorgon, carbo, riso, coffee, toma]);
  let miidx = 0;

  const [showOrderAlert, setOrderAlert] = useState(false);
  const [showPayAlert, setPayAlert] = useState(false);
  const [showCancleAlert, setCancleAlert] = useState(false);
  const [showAddAlert, setAddAlert] = useState(false);

  //테이블 관련 정보 적용함수
  function applyInfo(data) {
    setTableEmpty(false);
    setorderIds(data.order);
    setOrderState(data.state);
    setOrderContents(data.content);
    setTotalPrice(data.total);
  }

  useEffect(() => {
    //컴포넌트 마운트 시 빈 테이블이 아닌 경우 테이블 정보 fetch 함수 호출
    if (tableEmpty === false) {
      bringTableInfo(tableId).then((res) => {
        if (res.data.success === true) {
          applyInfo(res.data);
        } else {
          console.log(res);
        }
      })
    }

    socket.on("aboutTable", (data) => {
      //주문 준비 이벤트를 감지한 경우 주문 상태를 prepared로 변경
      if (data.what === "orderReady" && data.tableId === tableId) {
        setOrderState("prepared");
      } 
      //현 테이블 관련 갱신된 정보를 감지하면 해당 정보를 적용
      else if (data.what === "updatedTableInfo" && Number(data.tableId) === tableId) {
        applyInfo(data);
      } 
      //취소 이벤트 감지한 경우 테이블 리셋
      else if (data.what === "cancle" && data.tableId === tableId) {
        console.log("취소이벤트 감지");
        resetTable();
      } 
      //결제 이벤트 감지한 경우 테이블 리셋
      else if (data.what === "pay" && data.tableId === tableId) {
        console.log("결제이벤트 감지");
        resetTable();
      }
    });
    return () => {
      //컴포넌트 언마운트 시 소켓 해제
      socket.off("aboutTable");
    };
  }, []);

  //주문관련 Alert 제거 함수
  const removeAlert=(type)=>{
    //주문, 결제, 추가주문 완료 Alert 제거
    if (type==="orderAlert"){
      setTimeout(() => {
        setOrderAlert(false);
      }, 1500);
    }
    else if (type=="payAlert"){
      setTimeout(() => {
        setPayAlert(false);
      }, 1500);
    }
    else if (type==="addAlert"){
      setTimeout(() => {
        setAddAlert(false);
      }, 1500);
    }
  }

  //주문 상태 변경 함수
  const changeOrderState = () => {
    if (orderState === "") {
      setOrderState("cooking");
    } else if (orderState === "prepared") {
      setOrderState("prepared");
    } else if (orderState === "served") {
      setOrderState("cooking");
    }
  };

  //주문 후 처리 함수
  const afterOrder = () => {
    setTableEmpty(false);
    setOrderContents(addedContents);
    setAddedContents([]);
    setTotalPrice(totalPrice + addedPrice);
    setAddedPrice(0);
    changeOrderState();
    setOrderAlert(true);
    removeAlert("orderAlert")
  };

  //결제 후 처리 함수
  const afterPay = () => {
    setTimeout(() => {
      setOrderContents([]);
      setAddedContents([]);
      setTableEmpty(true);
      setTotalPrice(0);
      setOrderState("");
      setShow(false);
    }, 1500);
  };

  function handleShow() {
    setShow(!show);
  }

  //테이블 초기화 함수
  function resetTable() {
    setOrderContents([]);
    setAddedContents([]);
    setTableEmpty(true);
    setTotalPrice(0);
    setAddedPrice(0);
    setOrderState("");
    setCancleAlert(false);
  }
  return (
    <span className="StoreTable">
      {/* 테이블 버튼 */}
      <button className="tableBtn" onClick={handleShow}>
        테이블{tableId}
        <br></br>
        {orderState === "cooking" ? (
          <div className="curState1">
            <label>준비중..</label>
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          </div>
        ) : (
          <></>
        )}
        {/* 테이블 주문 버튼 내부 상태표시 */}
        {orderState === "prepared" ? (
          <>
            <div className="curState2">
              <label>준비완료</label>
              <b>✓</b>
            </div>
          </>
        ) : (
          <></>
        )}
        {orderState === "served" ? (
          <>
            <div className="curState3">
              <label>결제대기중</label>
              <b>✓</b>
            </div>
          </>
        ) : (
          <></>
        )}
      </button>

      {/* 주문모달 */}
      <Modal
        size="lg"
        show={show}
        onHide={() => {
          setShow(false);
          setCancleAlert(false);
          setAddedContents([]);
          setAddedPrice(0);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <b>{tableId}번 테이블</b>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="modalContent">
            {/* 모달 좌측 주문리스트 파트 */}
            <div className="selectedFoods">
              <h2>주문 리스트</h2>
              {tableEmpty === true ? (
                <div className="orderList">
                  {addedContents.map((food) => (
                    <div className="anOrderItem" key={Math.random()}>
                      <b style={{ flexBasis: "130px" }}>{food.menuName}</b>
                      <b style={{ flexGrow: "1" }}>수량: {food.count}</b>
                      <b style={{ flexGrow: "1" }}>가격: {food.price}</b>
                      <b
                        style={{
                          backgroundColor: "transparent",
                          color: "#BC544B",
                          border: "0",
                          outline: "0",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setAddedContents(
                            addedContents.filter((cur) => cur.key !== food.key)
                          );
                          setAddedPrice(addedPrice - food.price);
                        }}
                      >
                        x
                      </b>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {orderContents.map((food) => (
                    <div
                      key={Math.random()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "5px",
                        marginRight: "5px",
                      }}
                    >
                      <b style={{ flexBasis: "130px" }}>{food.menuName}</b>
                      <b style={{ flexGrow: "1" }}>수량: {food.count}</b>
                      <b
                        style={{
                          display: "flex",
                          flexGrow: "1",
                          justifyContent: "flex-end",
                        }}
                      >
                        가격: {food.price}
                      </b>
                    </div>
                  ))}
                  {addedContents.map((food) => (
                    <div
                      className="anOrderItem"
                      key={Math.random()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginLeft: "5px",
                        marginRight: "5px",
                        color: "#7E7E7E",
                      }}
                    >
                      <b style={{ flexBasis: "130px" }}>{food.menuName}</b>
                      <b style={{ flexGrow: "1" }}>수량: {food.count}</b>
                      <b style={{ flexGrow: "1" }}>가격: {food.price}</b>
                      <b
                        style={{
                          backgroundColor: "transparent",
                          color: "#BC544B",
                          border: "0",
                          outline: "0",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setAddedContents(
                            addedContents.filter((cur) => cur.key !== food.key)
                          );
                          setAddedPrice(addedPrice - food.price);
                        }}
                      >
                        x
                      </b>
                    </div>
                  ))}
                </div>
              )}
              <div className="total">
                <b>
                  합계:{" "}
                  {tableEmpty === true ? addedPrice : totalPrice + addedPrice}원
                </b>
                <br></br>
              </div>
            </div>

            {/* 모달 우측 메뉴버튼 파트 */}
            <div className="servingFoods">
              <h2>메뉴</h2>
              <div>
                {/* 메뉴 버튼들 */}
                {menu.map((food) => (
                  <button
                    className="menuBtn"
                    key={Math.random()}
                    onClick={() => {
                      const menuIdx = addedContents.findIndex(
                        (item) => item.menuName === food.menuName
                      );
                      const tmpAddedContent = addedContents;
                      //이미 등록된 메뉴면 수량, 가격만 증가시킨다.
                      if (menuIdx > -1) {
                        tmpAddedContent[menuIdx].count += 1;
                        tmpAddedContent[menuIdx].price += food.price;
                        setAddedContents(tmpAddedContent);
                      } else {
                        setAddedContents(
                          addedContents.concat({
                            key: Math.random(),
                            menuName: food.menuName,
                            count: 1,
                            price: food.price,
                          })
                        );
                      }
                      setAddedPrice(addedPrice + food.price);
                    }}
                  >
                    <img
                      className="foodImg"
                      src={menuImgs[miidx++]}
                      alt={food.id}
                      loading="lazy"
                    ></img>
                    <br></br>
                    <div className="foodInfo">
                      <label style={{ paddingTop: "3px" }}>
                        <b>{food.menuName}</b>
                      </label>
                      <label style={{ justifyContent: "center" }}>
                        {food.price}원
                      </label>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          {/* 모달 하단 버튼파트 */}
          <div style={{ width: "100%" }}>
            <div style={{ float: "right" }}>
              {tableEmpty === false ? (
                <button
                  style={btnStyle("gray")}
                  onClick={() => {
                    setCancleAlert(true);
                  }}
                >
                  취소
                </button>
              ) : (
                <></>
              )}

              {tableEmpty === true ? (
                <button
                  style={btnStyle("#00b0ff")}
                  onClick={() => {
                    if (addedContents.length === 0) {
                      alert("선택된 음식이 없습니다");
                    } 
                    else {
                      const orderData = {
                        tableId: tableId,
                        content: addedContents,
                        total: addedPrice,
                        oldContent: orderContents,
                        oldTotal: totalPrice,
                      };
                      enrollNewOrder(orderData)
                      .then((res) => {
                        if (res.data.success === true) {
                          console.log("success");
                          socket.emit("orderEvent", {
                            what: "order",
                            tableId: tableId,
                          });
                        } else {
                          console.log("server error");
                        }
                      })
                      afterOrder();
                    }
                  }}
                >
                  주문
                </button>
              ) : (
                <></>
              )}

              {!tableEmpty && orderState === "prepared" ? (
                <button
                  style={btnStyle("#FFDB58", "black")}
                  onClick={() => {
                    changeStateToServed(tableId).then((res) => {
                      if (res.data.success === true) {
                        socket.emit("orderEvent", {
                          what: "served",
                          tableId: tableId,
                        });
                      }
                    })
                  }}
                >
                  서빙
                </button>
              ) : (
                <></>
              )}

              {tableEmpty === false && addedContents.length !== 0 ? (
                <button
                  style={btnStyle("#99C68E")}
                  onClick={() => {
                    addOrder(tableId, addedContents, addedPrice).then((res) => {
                      if (res.data.success === true) {
                        console.log("추가완료");
                        socket.emit("orderEvent", {
                          what: "add",
                          tableId: tableId,
                        });
                      }
                    })
                    setOrderContents(orderContents.concat(addedContents));
                    setTotalPrice(totalPrice + addedPrice);
                    setAddedContents([]);
                    setAddedPrice(0);
                    changeOrderState();
                    setAddAlert(true);
                    removeAlert("addAlert");
                  }}
                >
                  추가
                </button>
              ) : (
                <></>
              )}

              {orderState === "served" ? (
                <button
                  style={btnStyle("#B90E0A")}
                  onClick={() => {
                    afterPay();
                    payProcess(tableId, orderContents, totalPrice,orderIds).then((res) => {
                      if (res.data.success === true) {
                        socket.emit("orderEvent", {
                          what: "pay",
                          tableId: tableId,
                        });
                        console.log("결제처리 완료");
                      }
                    });
                    setPayAlert(true);
                    removeAlert("payAlert");
                  }}
                >
                  결제
                </button>
              ) : (
                <></>
              )}
            </div>
            {/* 주문관련 이벤트 Alert 파트 */}
            <div style={{ float: "left" }}>
              <Alert
                show={showCancleAlert}
                variant="danger"
                style={alertStyle()}
              >
                <b>주문을 삭제하시겠습니까?</b>
                <p
                  onClick={() => {
                    orderCancle(tableId).then((res) => {
                      if (res.data.success === true) {
                        console.log("주문취소 완료, 취소 이벤트 전송");
                        socket.emit("orderEvent", {
                          what: "cancle",
                          tableId: tableId,
                        });
                      } else {
                        alert("취소실패");
                      }
                    });;
                    setShow(false);
                    resetTable();
                  }}
                  style={{
                    color: "#D0312D",
                    fontSize: "18px",
                    margin: "0rem 0.5rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  O
                </p>
                /
                <p
                  style={{
                    color: "#D0312D",
                    fontSize: "18px",
                    margin: "0rem 0.5rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    setCancleAlert(false);
                  }}
                >
                  X
                </p>
              </Alert>
              <Alert
                show={showOrderAlert}
                style={alertStyle()}
                variant="success"
              >
                <b>주문 완료!</b>
              </Alert>
              <Alert show={showPayAlert} style={alertStyle()} variant="success">
                <b>결제 완료!</b>
              </Alert>
              <Alert show={showAddAlert} style={alertStyle()} variant="success">
                <b>추가 완료!</b>
              </Alert>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </span>
  );
};

