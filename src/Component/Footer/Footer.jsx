import Logo from "@/assets/logo.svg";

const Footer = () => {
  return (
    <footer className="text-gray-500 bg-white px-4 py-7 max-w-screen-xl mx-auto md:px-10">
      <div className="max-w-lg sm:mx-auto sm:text-center flex flex-col items-center space-y-4">
        <img src={Logo} alt="Logo" className="w-32 sm:mx-auto" />
        <p className="leading-relaxed text-[15px] text-center">
          Lorem Ipsum has been the industry's standard dummy text ever since the
          1500s, when an unknown printer took a galley of type and scrambled it
          to make a type specimen book.
        </p>
      </div>
      <div className="mt-8 text-center">
        &copy; 2025 Power Casting All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
