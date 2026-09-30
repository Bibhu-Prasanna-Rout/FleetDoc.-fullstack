// export default function Layout({ children }) {
//   return (
//     <div className="min-h-screen bg-[#f6f8fc]">
//       <Sidebar />
//       <div className="lg:ml-64">
//         <Header />
//         <main className="p-4 md:p-6 lg:p-8">{children}</main>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";


export default function Layout({ children }) {

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);


  return (

    <div className="min-h-screen bg-slate-50">


      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />


      <div className="lg:ml-64">


        <Header
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />


        <main className="p-4 lg:p-8">

          {children}

        </main>


      </div>


    </div>

  );

}
