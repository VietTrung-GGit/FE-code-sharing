import React from 'react';
function LayoutSignup(){
    return(
    <div className=" w-3/4 h-3/4 text-center ml-48 mt-24 p-16 absolute border-Primary/Dark border-solid box-border border-2"> 
    <h3 className="text-4xl text-white m-6">SIGN IN</h3>
    <input type="text" placeholder="Username/Email" className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-xl m-6 "></input>
    <br></br>
    <input type="password" placeholder="Password" className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-xl m-6"></input>
    <br></br>
    <p className="text-xl text-white m-6">Don't have an account? <a href="" className="font-bold">Sign up!</a></p>
    <button className="w-1/5 h-10 rounded-xl bg-white text-2xl text-Primary/Dark m-6">Sign in</button>
    </div>
    );
    }
    export default LayoutSignup