import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlobalMenu from "@/components/GlobalMenu";
import { Tractor, Layers } from "lucide-react";

export default function LayoutMenu() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <GlobalMenu />
        <Link to="/" className="flex items-center gap-2">
          <Tractor className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">CROPGenius</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild className="flex items-center gap-1">
          <Link to="/manage-fields">
            <Layers className="h-4 w-4 mr-1" />
            Manage Fields
          </Link>
        </Button>
      </div>
    </div>
  );
}
