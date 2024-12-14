import { Link } from "react-router";

function LayoutSignin() {
  return (
    <div className="bg-Background/Bottom bg-[url('assets/particle.svg')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-10 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28 sm:p-10 md:p-14 lg:p-16 xl:p-20">
      <h3 className="text-3xl text-white m-6 pt-10">SIGN IN</h3>
      <input
        type="text"
        placeholder="Username/Email"
        className="bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3 "
        required
      ></input>
      <br></br>
      <input
        type="password"
        placeholder="Password"
        className="bg-inputbox-Sign rounded-3xl p-3 w-3/4 text-l m-6 md:w-2/3 lg:w-1/2 xl:w-1/3"
        required
      ></input>
      <br></br>
      <p className="text-l text-white m-6">
        Don't have an account?{" "}
        <Link to="/signup" className="font-bold">
          Sign up!
        </Link>
      </p>
      <button className="w-32 h-10 rounded-xl bg-white text-xl text-Primary/Dark m-6 hover:bg-Primary/Dark hover:text-white">
        Sign in
      </button>
    </div>
  );
}
export default LayoutSignin;

//https://stackoverflow.com/questions/67119992/how-to-access-all-the-direct-children-of-a-div-in-tailwindcss
