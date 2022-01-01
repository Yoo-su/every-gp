import React, {useState,useEffect} from 'react';
import {Button, Modal,Alert,Spinner} from "react-bootstrap";
import axios from "axios";
import io from 'socket.io-client';
import {btnStyle, alertStyle} from './Styles';
import "./Table.css";

const Table=({tableId,empty,menu})=>{
    const [show,setShow]=useState(false);
    const [orderIds,setorderIds]=useState([]);
    const [tableEmpty,setTableEmpty]=useState(empty);
    const [orderState,setOrderState]=useState("");
    const [orderContents,setOrderContents]=useState([]);
    const [addedContents,setAddedContents]=useState([]);
    const [totalPrice,setTotalPrice]=useState(0);
    const [addedPrice,setAddedPrice]=useState(0);

    const [showOrderAlert,setOrderAlert]=useState(false);
    const [showPayAlert,setPayAlert]=useState(false);
    const [showCancleAlert,setCancleAlert]=useState(false);
    const [showAddAlert,setAddAlert]=useState(false);
    const socket=io.connect('https://every-server.herokuapp.com',{ transports: ['websocket'] });

    function applyInfo(data){
        setTableEmpty(false);
        setorderIds(data.order);
        setOrderState(data.state);
        setOrderContents(data.content);
        setTotalPrice(data.total);
    }

    function bringTableInfo(){
        console.log(tableId,'번 테이블에서 정보 가져오는 중..');
        axios.get('https://every-server.herokuapp.com/api/tableInfo',{params:{tableId:tableId}}).then(res=>{
                if(res.data.success===true){
                    console.log(res.data)
                    applyInfo(res.data);
                    console.log('가져오기 완료');
                }else{
                    console.log(res);
                }
        })
    }

    useEffect(()=>{
        if(tableEmpty===false){
            bringTableInfo();
           }
        socket.on('tablePrepared',(data)=>{
            if(data.tableId===tableId){
                setOrderState("prepared");
            }
          })
        socket.on('aboutTable',(data)=>{
            if(data.what==='three'&&Number(data.tableId)===tableId){
                console.log(data,'확인해보자');
                applyInfo(data);
            }else if(data.what==='cancle'&&data.tableId===tableId){
                console.log('취소이벤트 감지');
                resetOrder();
            }else if(data.what==='pay'&&data.tableId===tableId){
                console.log('결제이벤트 감지');
                resetOrder();
            }
        })
        return ()=>{
            socket.off('tablePrepared');
            socket.off('aboutTable');
        }
    },[]);

    const autoOrderAlertRM=()=>{
       setTimeout(()=>{
           setOrderAlert(false);
       },1500);
    };

    const autoPayAlertRM=()=>{
        setTimeout(()=>{
            setPayAlert(false);
          },1500);
    };

    const autoAddAlertRM=()=>{
        setTimeout(()=>{
            setAddAlert(false);
          },1500);
    };

    const resetOrderState=()=>{
        if(orderState===""){
            setOrderState("cooking");
        }else if(orderState==="prepared"){
            setOrderState("prepared");
        }else if(orderState==="served"){
            setOrderState('cooking');
        }
    }

    const afterOrder=()=>{
        setTableEmpty(false);
        setOrderContents(addedContents);
        setAddedContents([]);
        setTotalPrice(totalPrice+addedPrice);
        setAddedPrice(0);
        resetOrderState();
        setOrderAlert(true);
        autoOrderAlertRM(); 
    }
 

    const afterPay=()=>{
        setTimeout(()=>{
            setOrderContents([]);
            setAddedContents([]);
            setTableEmpty(true);
            setTotalPrice(0);
            setOrderState("");
            setShow(false);
        },1500)
    };

    function handleHide(){setShow(false);};
    function handleShow(){setShow(true);};
    function resetOrder(){
        setOrderContents([]);
        setAddedContents([]);
        setTableEmpty(true);
        setTotalPrice(0);
        setAddedPrice(0);
        setOrderState("");
        setCancleAlert(false);
    }
    return(
        <span id="aTable">
         <Button id="tableBtn" onClick={handleShow}>테이블{tableId}<br></br>{orderState==="cooking"?(
             <div id="curState1">
                 <label>준비중..</label>
                <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                /></div>
         ):(<></>)}

         {orderState==="prepared"?(<>
          <div id="curState2">
              <label>준비완료</label>
              <b>✓</b>
          </div>
         </>):(<></>)}

         {orderState==="served"?(<>
         <div id="curState3">
          <label>결제대기중</label>
          <b>✓</b>
         </div>
         </>):(<></>)}
         </Button>

         <Modal size="lg" show={show} onHide={()=>{handleHide(); setCancleAlert(false); setAddedContents([]); setAddedPrice(0)}}>
         <Modal.Header closeButton>
         <Modal.Title><b>{tableId}번 테이블</b></Modal.Title>
        </Modal.Header>

        <Modal.Body>
         <div id="modalContent" style={{display:"flex",flexDirection:"row"}}>

            {/* 모달 좌측 주문리스트 파트 */}
            <div className="selectedFoods" style={{width:"50%",marginRight:"5px",border:"1px solid #EBECF0", 
                boxShadow:"1px 2px #BEBEBE", borderRadius:"5px"}}>
                <h2 style={{textAlign:"center",borderBottom:"1px solid #949494"}}>주문 리스트</h2>
                    {tableEmpty===true?(
                        <div style={{display:"flex",flexDirection:"column"}}>
                            {addedContents.map(food=>(
                                <div key={Math.random()} style={{display:"flex",alignItems:"center", marginLeft:"5px",marginRight:"5px", color:"#7E7E7E"}}>
                                    <b style={{flexBasis:"130px"}}>{food.menuName}</b>
                                    <b style={{flexGrow:"1"}}>수량: {food.count}</b>
                                    <b style={{flexGrow:"1"}}>가격: {food.price}</b>
                                    <b style={{backgroundColor:"transparent", border:"0",outline:"0",cursor:"pointer" }} onClick={()=>{
                                        setAddedContents(addedContents.filter(cur=>cur.key!==food.key));
                                        setAddedPrice(addedPrice-food.price);
                                    }}>x</b>
                                </div>
                    ))}
            </div>
           ):(
               <div style={{display:"flex",flexDirection:"column"}}>
                   {orderContents.map(food=>(
                    <div key={Math.random()} style={{display:"flex",alignItems:"center", marginLeft:"5px",marginRight:"5px"}}>
                        <b style={{flexBasis:"130px"}}>{food.menuName}</b>
                        <b style={{flexGrow:"1"}}>수량: {food.count}</b>
                        <b style={{display:"flex",flexGrow:"1",justifyContent:"flex-end"}}>가격: {food.price}</b>
                    </div>
              ))}
                  {addedContents.map(food=>(     
                         <div key={Math.random()} id={food.id} style={{display:"flex",alignItems:"center", marginLeft:"5px",marginRight:"5px", color:"#7E7E7E"}}>
                         <b style={{flexBasis:"130px"}}>{food.menuName}</b>
                         <b style={{flexGrow:"1"}}>수량: {food.count}</b>
                         <b style={{flexGrow:"1"}}>가격: {food.price}</b>
                         <b style={{backgroundColor:"transparent", border:"0",outline:"0",cursor:"pointer" }} onClick={()=>{
                             setAddedContents(addedContents.filter(cur=>cur.key!==food.key));
                             setAddedPrice(addedPrice-food.price);
                         }}>x</b>
                     </div>
              ))}
               </div>
               
           )}
              <div id="total" style={{textAlign:"center", float:"bottom"}}>
                  <b style={{fontSize:'24px'}}>합계: {tableEmpty===true?(addedPrice):(totalPrice+addedPrice)}원</b><br></br>
             </div>
         </div>

         {/* 모달 우측 메뉴버튼 파트 */}
         <div className="servingFoods" style={{width:"50%",marginLeft:"5px",border:"1px solid #EBECF0", 
                boxShadow:"1px 2px #BEBEBE", borderRadius:"5px"}}>
             <h2 style={{textAlign:"center",borderBottom:"1px solid #949494"}}>메뉴</h2>
             <div style={{margin:"8px",textAlign:"center",position:"relative"}}>

            {/* 메뉴 버튼들 */}
            {menu.map(food=>(
            <button key={Math.random()} id={food.menuName} style={{backgroundColor:"white",border:"transparent", 
                outline:"0",boxShadow:"0.5px 1px #BEBEBE", borderRadius:"5px" , margin:"2px", padding:"0"}} 
                onClick={()=>{
                    const menuIdx=addedContents.findIndex(item=>item.menuName===food.menuName);
                    const tmpAddedContent=addedContents;
                    //이미 등록된 메뉴면 수량, 가격만 증가시킨다.
                    if (menuIdx>-1){
                        tmpAddedContent[menuIdx].count+=1;
                        tmpAddedContent[menuIdx].price+=food.price;
                        setAddedContents(tmpAddedContent)
                    }else{
                        setAddedContents(addedContents.concat({
                            key:Math.random(),
                            menuName:food.menuName,
                            count:1,
                            price:food.price
                    }));
                }
                setAddedPrice(addedPrice+food.price);
            }}>
                <img id="foodImg" src={food.imgPath} alt={food.id} style={{width:"70px",height:"70px",objectFit:'cover'}}></img><br></br>
                <div  style={{display:'flex',flexDirection:'column',backgroundColor:"#F5F5F5",padding:'0.2rem 0.5rem',
            alignItems:'center',justifyContent:'center'}}>
                    <label style={{paddingTop:'3px'}}>{food.menuName}</label>
                    <label style={{justifyContent:'center'}}>{food.price}원</label>
                </div>
            </button>))}
             </div>
         </div>
         </div>
        </Modal.Body>

        <Modal.Footer id="modal-foot">
            <div style={{float:"right"}}>
                  {tableEmpty===false?(
                  <button style={btnStyle('gray')} onClick={()=>{
                  setCancleAlert(true);
                  }}>취소</button>):(<></>)}
                  

               {tableEmpty===true?((<button style={btnStyle('#00b0ff')} onClick={()=>{
                   if(addedContents.length===0){
                       alert("선택된 음식이 없습니다");
                   }
                   else{
                    function newOrder(){
                        const orderData={
                            tableId:tableId,
                            content:addedContents,
                            total:addedPrice,
                            oldContent:orderContents,
                            oldTotal:totalPrice
                        }
                        axios.post("https://every-server.herokuapp.com/api/newOrder",orderData).then(res=>{
                            if(res.data.success===true){
                                console.log('success');
                                socket.emit('orderEvent',{what:'order',tableId:tableId});
                                
                            }
                            else{console.log("server error");}
                        });
                    }
                    newOrder();
                    afterOrder();
                   }
            }}>주문</button>)):(<></>)}

            {!tableEmpty&&orderState==="prepared"?( 
            <button style={btnStyle('#FFDB58','black')} onClick={()=>{
                function changeToServed(){
                    axios.get('https://every-server.herokuapp.com/api/served',{params:{tableId:tableId}}).then(res=>{
                        if(res.data.success===true){
                            console.log('서빙 이벤트 전송');
                            socket.emit('orderEvent',{what:'served',tableId:tableId});
                        }
                    });
                }
                changeToServed();
            }}>서빙</button>):(<></>)}

            {tableEmpty===false&&addedContents.length!==0?(
                <button style={btnStyle('#99C68E')} onClick={()=>{
                    function addOrder(){
                        axios.post('https://every-server.herokuapp.com/api/addOrder',{tableId:tableId,content:addedContents,total:addedPrice}).then(res=>{
                            if(res.data.success===true){
                                console.log('추가완료');
                                socket.emit('orderEvent',{what:'add',tableId:tableId}); 
                            }
                        })
                    }
                addOrder();
                setOrderContents(orderContents.concat(addedContents));
                setTotalPrice(totalPrice+addedPrice);
                setAddedContents([]);
                setAddedPrice(0); 
                resetOrderState();
                setAddAlert(true);
                autoAddAlertRM();
            }}>추가</button> 
            ):(<></>)}

            {tableEmpty===false&&addedContents.length===0&&orderState==='served'?(<button style={btnStyle('#B90E0A')} onClick={()=>{
                function payProcess(){
                    axios.post('https://every-server.herokuapp.com/api/orderPay',{
                        tableId:tableId,
                        content:orderContents,
                        total:totalPrice,
                        orderIds:orderIds
                    }).then(res=>{
                        if(res.data.success===true){
                            socket.emit('orderEvent',{what:'pay',tableId:tableId});
                            console.log('결제처리 완료');
                        }
                    })
                }
                afterPay();
                payProcess();
                setPayAlert(true);
                autoPayAlertRM();
            }}>결제</button>):(<></>)}
            </div>
            <div style={{display:'flex'}}>
             <Alert show={showCancleAlert} variant="danger" style={alertStyle()}>
                 <b>주문을 삭제하시겠습니까?</b>
                 <p
                    onClick={()=>{
                        function orderCancle(){
                            axios.get('https://every-server.herokuapp.com/api/orderCancle',{params:{tableId:tableId}}).then(res=>{
                                if(res.data.success===true){
                                    console.log('주문취소 성공, 취소 이벤트 전송');
                                    socket.emit('orderEvent',{what:'cancle',tableId:tableId});
                                }else{alert('취소실패');}
                                })
                            }
                            orderCancle();
                            handleHide();
                            resetOrder();
                        }}
                        style={{color:'#D0312D',fontSize:'18px',margin:'0rem 0.5rem',cursor:'pointer',fontWeight:'bold'}}
                    >O</p>/
                    <p style={{color:'#D0312D',fontSize:'18px',margin:'0rem 0.5rem',cursor:'pointer',fontWeight:'bold'}} 
                    onClick={()=>{
                 setCancleAlert(false);
             }}>X</p></Alert>
             <Alert show={showOrderAlert} style={alertStyle()} variant="success"><b>주문 완료!</b></Alert>
             <Alert show={showPayAlert} style={alertStyle()} variant="success"><b>결제 완료!</b></Alert>
             <Alert show={showAddAlert} style={alertStyle()} variant="success"><b>추가 완료!</b></Alert>
       </div>
        </Modal.Footer>
       </Modal>      
        </span>
    );
}

export default Table;