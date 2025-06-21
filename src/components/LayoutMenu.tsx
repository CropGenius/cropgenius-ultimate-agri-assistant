import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlobalMenu from "@/components/GlobalMenu";
import { Layers } from "lucide-react";
import { CreditBadge } from "./badges/CreditBadge";
import LogoSVG from '@/assets/logo/cropgenius-logo.svg';

export default function LayoutMenu() {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <GlobalMenu />
        <Link to="/" className="flex items-center gap-2">
          <img src={LogoSVG} alt="CropGenius logo" className="h-8 w-auto" />
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <CreditBadge />
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
