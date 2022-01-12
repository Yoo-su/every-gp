import React, {useState} from 'react';
import {Button, Modal,Alert} from "react-bootstrap";
import axios from 'axios';
import io from 'socket.io-client';
import {btnStyle, alertStyle } from './Styles';
import gorgon from '../../imgs/menuImgs/고르곤졸라.jpg';
import carbo from '../../imgs/menuImgs/까르보나라.jpg';
import riso from '../../imgs/menuImgs/리조또.jpg';
import coffee from '../../imgs/menuImgs/커피.jpg';
import toma from '../../imgs/menuImgs/토마토파스타.jpg';
import "./Table.css";

const TakeOutOrder=({tableId,menu})=>{
    const [show,setShow]=useState(false);
    const [tableEmpty,setTableEmpty]=useState(true);
    const [orderContents,setOrderContents]=useState([]);
    const [addedContents,setAddedContents]=useState([]);
    const [totalPrice,setPrice]=useState(0);
    const [addedPrice,setAddedPrice]=useState(0);
    const [menuImgs,setMenuImgs]=useState([gorgon,carbo,riso,coffee,toma]);
    let miidx=0;
    
    const [showOrderAlert,setOrderAlert]=useState(false);
    const [showPayAlert,setPayAlert]=useState(false);
    const [showCancleAlert,setCancleAlert]=useState(false);
    const socket=io('https://every-server.herokuapp.com',{ transports: ['websocket'] });

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
 
 
     const afterOrder=()=>{
         setOrderContents(addedContents);
         setAddedContents([]);
         setTableEmpty(false);
     }
  
 
     const afterPay=()=>{
        socket.emit('orderEvent',{what:'takeOutOrder'});
         setTimeout(()=>{
             setOrderContents([]);
             setAddedContents([]);
             setTableEmpty(true);
             setPrice(0);
             setShow(false);
         },1500)
     };
 
     function handleHide(){setShow(false);};
     function handleShow(){setShow(true);};
     function resetOrder(){
         setOrderContents([]);
         setAddedContents([]);
         setTableEmpty(true);
         setPrice(0);
         setAddedPrice(0);
         setCancleAlert(false);
     }
     return(
        <span id="aTable">
         <Button id="takeOutBtn" onClick={handleShow}>테이크아웃<br></br></Button>

         <Modal size="lg" show={show} onHide={()=>{handleHide(); setCancleAlert(false); setAddedContents([]); setAddedPrice(0)}}>
         <Modal.Header closeButton>
         <Modal.Title><b>테이크아웃</b></Modal.Title>
        </Modal.Header>

        <Modal.Body>
         <div id="modalContent">
         <div className="selectedFoods">
                    <h2>주문 리스트</h2>
           {tableEmpty===true?(
               <div className="orderList">
                     {addedContents.map(food=>(
                    <div className="anOrderItem" key={Math.random()}>
                        <b style={{flexBasis:"130px"}}>{food.menuName}</b>
                        <b style={{flexGrow:"1"}}>수량: {food.count}</b>
                        <b style={{flexGrow:"1"}}>가격: {food.price}</b>
                        <b style={{backgroundColor:"transparent",color:"#BC544B", border:"0",outline:"0",cursor:"pointer" }} onClick={()=>{
                            setAddedContents(addedContents.filter(cur=>cur.key!==food.key));
                            setAddedPrice(addedPrice-food.price);
                            }}>x</b>
                    </div>
              ))}
               </div>
           ):(
                <div>
                    {orderContents.map(food=>(
                    <div key={Math.random()} style={{display:"flex",alignItems:"center", marginLeft:"5px",marginRight:"5px"}}>
                        <b style={{flexBasis:"130px"}}>{food.menuName}</b>
                        <b style={{flexGrow:"1"}}>수량: {food.count}</b>
                        <b style={{display:"flex",flexGrow:"1",justifyContent:"flex-end"}}>가격: {food.price}</b>
             </div>
              ))}
                {addedContents.map(food=>(     
                         <div className="anOrderItem" key={Math.random()} id={food.id}>
                         <b style={{flexBasis:"130px"}}>{food.menuName}</b>
                         <b style={{flexGrow:"1"}}>수량: {food.count}</b>
                         <b style={{flexGrow:"1"}}>가격: {food.price}</b>
                         <b style={{backgroundColor:"transparent",color:"#BC544B", border:"0",outline:"0",cursor:"pointer" }} onClick={()=>{
                             setAddedContents(addedContents.filter(cur=>cur.key!==food.key));
                             setAddedPrice(addedPrice-food.price);
                         }}>x</b>
                     </div>
              ))}
               </div>
               
           )}
              <div id="total">
                  <b>합계: {tableEmpty===true?(addedPrice):(totalPrice+addedPrice)}원</b><br></br>
             </div>
         </div>

         <div className="servingFoods">
             <h2>메뉴</h2>
             <div>
             {menu.map(food=>{
            return orderContents.length>0?(
            <button className="menuBtn" key={Math.random()} id={food.menuName} 
                onClick={()=>{
                alert('결제를 진행해 주세요');
                }}>
            <img className="foodImg" src={menuImgs[miidx++]} alt={food.id}></img><br></br>
            <div className='foodInfo'>
                    <label style={{paddingTop:'3px'}}><b>{food.menuName}</b></label>
                    <label style={{justifyContent:'center'}}>{food.price}원</label>
                </div>
            </button>
            ):(
                <button key={Math.random()} id={food.menuName} style={{backgroundColor:"white",border:"0", 
                    outline:"0",boxShadow:"0.5px 1px #BEBEBE", borderRadius:"5px" , margin:"2px", padding:"0"}}  
                    onClick={()=>{
                        const menuIdx=addedContents.findIndex(item=>item.menuName===food.menuName);
                        const tmpAddedContent=addedContents;
                        //이미 등록된 메뉴면 수량만 증가시킨다.
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
                <img className="foodImg" src={menuImgs[miidx++]} alt={food.id} loading='lazy'></img><br></br>
                <div className='foodInfo'>
                    <label style={{paddingTop:'3px'}}><b>{food.menuName}</b></label>
                    <label style={{justifyContent:'center'}}>{food.price}원</label>
                </div>
                </button>)
                 } )}
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
                  

               {tableEmpty?((<button style={btnStyle('#00b0ff')} onClick={()=>{
                   if(addedContents.length===0){
                       alert("선택된 음식이 없습니다");
                   }
                   else{
                    function newOrder(){
                        const orderData={
                            tableId:tableId,
                            content:addedContents,
                            total:addedPrice
                        }
                        axios.post("https://every-server.herokuapp.com/api/newOrder",orderData).then(res=>{
                            if(res.data.success===true)console.log('테이크아웃 주문 완료');
                        });
                    }
                    newOrder();
                    setPrice(addedPrice);
                    setAddedPrice(0);
                    afterOrder();
                    setOrderAlert(true);
                    autoOrderAlertRM();
                   }
            }}>주문</button>)):(<></>)}

            {!tableEmpty&&addedContents.length===0?(<button style={btnStyle('#B90E0A')} onClick={()=>{
                setOrderAlert(false);
                setPayAlert(true);
                afterPay();
                autoPayAlertRM();
            }}>결제</button>):(<></>)}
            </div>
            <div style={{float:"left"}}>
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
       </div>
        </Modal.Footer>
       </Modal>      
        </span>
    );
}



export default TakeOutOrder;