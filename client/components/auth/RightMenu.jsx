export default function RightMenu() {
  return (
    <div className="hidden md:block w-full md:w-[50%] h-[300px] md:h-screen bg-[#F7F5FA]">
      <h2 className="text-center text-primary text-xl mt-[10%] font-semibold">
        One Step Closer to your Dream Job!
      </h2>
      <div className="img-container h-[80%] w-full">
        <img
          src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/images/signin-1.jpeg`}
          alt="one step towards dream job"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}
``