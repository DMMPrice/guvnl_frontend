import { Link } from "react-router-dom";
import Logo from "@/assets/logo.svg";

const Footer = () => {
  const footerNavs = [
    {
      to: "/procurement",
      name: "Procurement",
    },
    {
      to: "/edit",
      name: "Edit Data",
    },
    {
      to: "/demand",
      name: "Demand",
    },
  ];

  return (
    <footer className="text-gray-500 bg-white px-4 py-5 max-w-screen-xl mx-auto md:px-8">
      <div className="max-w-lg sm:mx-auto sm:text-center flex flex-col items-center space-y-4">
        <img src={Logo} alt="Logo" className="w-32 sm:mx-auto" />
        <p className="leading-relaxed text-[15px] text-center">
          Lorem Ipsum has been the industry's standard dummy text ever since the
          1500s, when an unknown printer took a galley of type and scrambled it
          to make a type specimen book.
        </p>
      </div>
      <ul className="flex flex-col items-center justify-center mt-8 space-y-5 sm:flex-row sm:space-x-4 sm:space-y-0">
        {footerNavs.map((item, idx) => (
          <li key={idx} className="hover:text-gray-800">
            <Link to={item.to} className="flex items-center space-x-2">
              <span className="inline-block p-2 bg-gray-200 rounded-full">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11V5a1 1 0 10-2 0v2a1 1 0 001 1h2a1 1 0 100-2h-1zm-1 4a1 1 0 011-1h2a1 1 0 100-2h-2a1 1 0 00-1 1v2a1 1 0 102 0v-1zm-4 1a1 1 0 100-2H5a1 1 0 000 2h2zm1 2a1 1 0 100-2H5a1 1 0 000 2h2zm4 0a1 1 0 100-2h-2a1 1 0 000 2h2z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center">
        &copy; 2024 Float UI All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
