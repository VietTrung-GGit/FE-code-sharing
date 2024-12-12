import React from 'react';

function LayoutSignin(){
return(
<div className="bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-16 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28"> 
<h3 className="text-4xl text-white m-6 pt-10">SIGN IN</h3>
<input type="text" placeholder="Username/Email" className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-xl m-6 "></input>
<br></br>
<input type="password" placeholder="Password" className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-xl m-6"></input>
<br></br>
<p className="text-xl text-white m-6">Don't have an account? <a href="" className="font-bold">Sign up!</a></p>
<button className="w-32 h-10 rounded-xl bg-white text-2xl text-Primary/Dark m-6">Sign in</button>
</div>
);
}
export default LayoutSignin

//https://stackoverflow.com/questions/67119992/how-to-access-all-the-direct-children-of-a-div-in-tailwindcss

