import React, {useState,useEffect} from 'react';
import {Navbar, Nav,Button} from 'react-bootstrap';
import { connect } from 'react-redux';
import axios from "axios";
import {logOut} from "../Store";
import './NavBar.css';
import logo from "../icons/hat.png";

function NavBar({userRole,isLogin,logOut,curUser}){
  const [time,setTime]=useState('');
  const [date,setDate]=useState('');

  const getDate=()=>{
    let today = new Date();   

    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜

    setDate(month + '월' +' '+ date+'일');
  }

  const getTime=()=>{
    const time = new Date();
    const hour = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    setTime(`${hour<10 ? `0${hour}`:hour}:${minutes<10 ? `0${minutes}`:minutes}`);
  }


  useEffect(()=>{
    getDate();
    setInterval(getTime,1000);
  },[]);

  return(
    <div id="NavBar">
    <Navbar className="HomeNav" style={{backgroundColor:"#F6F3ED",height:'4rem', 
    color:'#030303',boxShadow:'1px 1px #C5C6D0'}}>
         <Navbar.Brand href="#" style={{paddingBottom:"0px"}}>
             <label style={{fontSize:"32px",margin:"0px",cursor:'pointer',color:'#030303'}}><img 
             src={logo}
             width="34"
             height="34"
             alt="mainlogo">
             </img>{' '}에브리 레스토랑</label>
         </Navbar.Brand>
         <Nav className="mr-auto">
             {userRole===0?(<>
              <Nav.Link href="#Order">주문</Nav.Link>
              <Nav.Link href="#Cook">요리</Nav.Link>
             <Nav.Link href="#ManageStock">재고</Nav.Link>
                <Nav.Link href="#ManageEmp">직원관리</Nav.Link>
                <Nav.Link href="#AboutMenu">메뉴</Nav.Link>
                <Nav.Link href="#SalesInfo">판매</Nav.Link>
                <Nav.Link href="#Account">회계</Nav.Link>
             </>):(null)}
             {userRole===1?(<>
              <Nav.Link href="#Order">주문</Nav.Link>
              <Nav.Link href="#Cook">요리</Nav.Link>
             <Nav.Link href="#ManageStock">재고</Nav.Link>
                <Nav.Link href="#ManageEmp">직원관리</Nav.Link>
                <Nav.Link href="#AboutMenu">메뉴</Nav.Link>
                <Nav.Link href="#SalesInfo">판매</Nav.Link>
                <Nav.Link href="#Account">회계</Nav.Link>
             </>):(<></>)}
             {userRole===2?(<>
              <Nav.Link href="#Order">주문</Nav.Link>
              <Nav.Link href="#Cook">요리</Nav.Link>
             <Nav.Link href="#ManageStock">재고</Nav.Link>
                <Nav.Link href="#ManageEmp">직원관리</Nav.Link>
                <Nav.Link href="#AboutMenu">메뉴</Nav.Link>
                <Nav.Link href="#SalesInfo">판매</Nav.Link>
                <Nav.Link href="#Account">회계</Nav.Link>
             </>):(<></>)}
        </Nav>
        
        <div style={{background:'white',padding:'1px 3px', marginRight:'30px',borderRadius:'10px',color:'#494848',boxShadow:'0.3px 0.5px gray'}}>
          <label style={{fontSize:'20px',margin:'0px 12px'}}>{date+' '+time}</label>
        </div>
        {isLogin===true?(
        <div style={{
          display:'flex',
          alignContent:'center',
          padding:'0.5rem 1rem',
          height:'3rem',
          }}>
        <p style={{fontSize:"20px",marginRight:'12px'}}>{curUser} 님</p>
         <p onClick={()=>{
           function logout(){
             axios.get('https://every-server.herokuapp.com/api/logout',{params:{nickName:curUser}}).then(res=>{
               if(res.data.success===true){
                 console.log('로그아웃완료');
               }else alert('오류발생');
             })
           }
           logout();
           logOut();
         }}
         style={{cursor:'pointer',color:'#BC544B',paddingTop:'3px'}}
         >로그아웃</p>
        </div>):(
            <Nav className="sign">
              <Nav.Link href="#Login">로그인</Nav.Link>
            </Nav>)}
        </Navbar>
</div>
   );
};

function mapStateToProps(state){
    return {
        userRole:state.userRole,
        isLogin:state.isLogin,
        curUser:state.curUser
    };
}

function mapDispatchToProps(dispatch,ownProps){
    return(
      {
        logOut:()=>{dispatch(logOut());}
      }
    );
 }

export default connect(mapStateToProps,mapDispatchToProps) (NavBar);

