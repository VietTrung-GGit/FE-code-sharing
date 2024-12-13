function LayoutSignup() {
  return (
    <div className="bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-16 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 z-10"></div>

      <div className="absolute inset-0 bg-gradient-to-tl from-green-400 to-yellow-500 opacity-50 z-20"></div>

      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-400 opacity-25 z-30"></div>

      <h3 className="text-3xl text-white m-6 pt-10">SIGN UP</h3>
      <input
        type="text"
        placeholder="Username/Email"
        className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-l m-6 "
      ></input>
      <br></br>
      <input
        type="email"
        placeholder="Email"
        className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-l m-6"
      ></input>
      <br></br>
      <input
        type="password"
        placeholder="Password"
        className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-l m-6"
      ></input>
      <br></br>
      <input
        type="password"
        placeholder="Password confirm"
        className="bg-inputbox-Sign rounded-3xl p-3 w-4/12 text-l m-6"
      ></input>
      <br></br>
      <p className="text-l text-white m-6">
        Already have an account?{" "}
        <a href="" className="font-bold">
          Sign in!
        </a>
      </p>
      <button className="w-32 h-10 rounded-xl bg-Accent/Target text-xl text-white m-6">
        Sign in
      </button>
    </div>
  );
}
export default LayoutSignup;
