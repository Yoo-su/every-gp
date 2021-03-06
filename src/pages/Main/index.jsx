import React from "react";
import mainImg from "../../assets/images/chefHat.png";
import mainBack from "../../assets/images/mainBack2.jpg";
import "./style.css";

//메인 페이지 컴포넌트
export default function MainPage() {
  return (
    <div id="mainPage">
      <div
        id="mainContent"
        style={{ backgroundImage: `url(${mainBack})`, backgroundSize: "cover" }}
      >
        <div id="insideContent">
          <img id="descImg" src={mainImg} alt={mainImg}></img>

          <div id="serviceDesc">
          <label>
            주문, 쿠킹알림, 직원관리 및 매상집계 자동화 시스템
          </label>
          <b>에브리 레스토랑</b>
          </div>
        </div>
      </div>
    </div>
  );
}
