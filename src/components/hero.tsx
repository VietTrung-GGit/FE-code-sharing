function Hero() {
  return (
    <div className="h-[670px] bg-Background/Bottom bg-[url('assets/particle.svg')] bg-[url('backgroundeffect.png')] bg-no-repeat bg-center bg-cover text-center w-full mt-0 p-16 relative border-Primary/Dark border-solid box-border border-2 rounded-b-3xl mb-28">
      <div className="grid grid-cols-2 place-items-center p-0">
        <div className="flex flex-col text-white pb-20">
          <div className="flex items-center justify-center py-2 text-9xl">
            <span>Co</span>
            <span className="text-Accent/Light">Dash</span>
          </div>
          <p className="text-xl justify-center ">
            /*your personal shorcut to*/
          </p>
          <div className="flex items-center justify-center text-xl">
            <span className="text-Primary/Light">sharing code</span>
            <span>*/</span>
          </div>
          <div className="flex items-center justify-center ">
          <button className="w-24 h-8 rounded-xl bg-white text-xl text-Primary/Dark m-3">
            Sign in
          </button>
          <button className="w-24 h-8 rounded-xl bg-Accent/Target text-xl text-white m-3">
            Sign in
          </button>
          </div>
        </div>
        <img
          src="preview.png"
          alt="App Preview"
          className="w-4/5 h-auto flex ml-5"
        />
      </div>
    </div>
  );
}
export default Hero;
