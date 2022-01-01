import React,{useState,useEffect,useRef} from "react";
import "./Order.css";
import Table from "../../components/Clerk/Table";
import TakeOut from "../../components/Clerk/TakeOut";
import TakeOutOrders from "../../components/Clerk/TakeOutOrders";
import axios from "axios";
import io from "socket.io-client";

function Order(){
  const [tables,setTables]=useState([]);
  const [takeOut,setTakeOut]=useState([]);
  const [takeOutOrders,setTakeOutOrders]=useState([]);
  const [menu,setMenu]=useState([]);

  const requestTables=axios.get('https://every-server.herokuapp.com/api/tables');
  const requestMenu=axios.get('https://every-server.herokuapp.com/api/menu');
  const requestTakeOutOrders=axios.get('https://every-server.herokuapp.com/api/takeOutOrders');

  function bringDatas(){
    axios.all([requestTables,requestMenu,requestTakeOutOrders]).then(axios.spread((...responses)=>{
      setTakeOut(responses[0].data.tables[0]);
      const onlyTables=responses[0].data.tables.filter(table=>table.sicktakId!==0);
      setTables(onlyTables);
      setMenu(responses[1].data.menu);
      setTakeOutOrders(responses[2].data.takeOutOrders);  
    }))
  };

  
  useEffect(()=>{
    bringDatas();
    
    const socket=io('https://every-server.herokuapp.com',{ transports: ['websocket'] });

    socket.on('aboutTakeOut',(data)=>{
      if(data.what==='updateOrderForClerk'){
        setTakeOutOrders(data.takeOutOrders);
      }
    })

    socket.on('removeCard',(data)=>{
      setTakeOutOrders(data.takeOutOrders);
    })
    
    return ()=>{
      socket.off('aboutTakeOut');
      socket.off('removeCard');
    }
  },[]);

    return(
      <div id="order">
        {tables.length>0?(<>
        <div id="orderLeft">
          <div id="tables">
             {tables.map(table=>(
               <span id="table" key={table.sicktakId}>
                <Table tableId={table.sicktakId} empty={table.isEmpty===1?true:false} menu={menu}></Table>
               </span>
              ))}
         </div>
         </div>
         <div id="orderRight">
           <div id="takeOut">
           <TakeOut tableId={takeOut.sicktakId} menu={menu}></TakeOut><br></br><br></br>
             <div id="toOrders">
           {takeOutOrders.map(tOO=>(
             <TakeOutOrders key={tOO.orderId} orderId={tOO.orderId} state={tOO.state} price={tOO.totalPrice}></TakeOutOrders>
           ))}
             </div>
           </div>
         </div>
        </>):(<div id="orderLoading">
          <b style={{fontSize:"45px"}}>불러오는 중...</b>
        </div>)}
      </div>
    );
}

export default Order;
