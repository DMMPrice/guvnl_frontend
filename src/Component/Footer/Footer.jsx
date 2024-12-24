import Link from "@/assets/logo.svg";
export default () => {
  const footerNavs = [
    {
      href: "javascript:void()",
      name: "Procurement",
    },
    {
      href: "javascript:void()",
      name: "Edit Data",
    },
    {
      href: "javascript:void()",
      name: "Demand",
    },
  ];

  return (
    <footer className="text-gray-500 bg-white px-4 py-5 max-w-screen-xl mx-auto md:px-8">
      <div className="max-w-lg sm:mx-auto sm:text-center">
        <img src={Link} className="w-32 sm:mx-auto" />
        <p className="leading-relaxed mt-2 text-[15px]">
          Lorem Ipsum has been the industry's standard dummy text ever since the
          1500s, when an unknown printer took a galley of type and scrambled it
          to make a type specimen book.
        </p>
      </div>
      <ul className="items-center justify-center mt-8 space-y-5 sm:flex sm:space-x-4 sm:space-y-0">
        {footerNavs.map((item, idx) => (
          <li className=" hover:text-gray-800">
            <a key={idx} href={item.href}>
              {item.name}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-8 items-center justify-between sm:flex text-center">
        &copy; 2024 Float UI All rights reserved.
      </div>
    </footer>
  );
};
