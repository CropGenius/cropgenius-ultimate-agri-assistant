
import React from "react";
import TopNav from "@/components/navigation/TopNav";
import BottomNav from "@/components/navigation/BottomNav";

interface LayoutProps {
  children: React.ReactNode;
  showTopNav?: boolean;
  showBottomNav?: boolean;
}

const Layout = ({ children, showTopNav = true, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {showTopNav && <TopNav />}
      
      <main className={`${showTopNav ? 'pt-14' : ''} ${showBottomNav ? 'pb-20' : ''} min-h-screen`}>
        {children}
      </main>
      
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default Layout;
