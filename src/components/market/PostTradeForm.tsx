import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Package } from "lucide-react";
import { toast } from "sonner";

interface PostTradeFormProps {
  onSubmit: (formData: {
    cropType: string;
    quantity: number;
    unit: string;
    quality: string;
    location: string;
    price: number;
  }) => void;
}

const PostTradeForm: React.FC<PostTradeFormProps> = ({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    cropType: '',
    quantity: '',
    unit: 'kg',
    quality: 'Standard',
    location: '',
    price: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cropType || !formData.quantity || !formData.location || !formData.price) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSubmit({
      cropType: formData.cropType,
      quantity: parseInt(formData.quantity),
      unit: formData.unit,
      quality: formData.quality,
      location: formData.location,
      price: parseInt(formData.price)
    });

    setFormData({
      cropType: '',
      quantity: '',
      unit: 'kg',
      quality: 'Standard',
      location: '',
      price: ''
    });
    setIsOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-crop-green-600 hover:bg-crop-green-700 text-white">
          <Package className="h-4 w-4 mr-2" />
          Post Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Post New Trade</DialogTitle>
          <DialogDescription>
            List your crop for sale in the marketplace
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cropType">Crop Type *</Label>
            <Select value={formData.cropType} onValueChange={(value) => handleInputChange('cropType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maize">Maize</SelectItem>
                <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                <SelectItem value="Cassava">Cassava</SelectItem>
                <SelectItem value="Rice">Rice</SelectItem>
                <SelectItem value="Beans">Beans</SelectItem>
                <SelectItem value="Soybeans">Soybeans</SelectItem>
                <SelectItem value="Onions">Onions</SelectItem>
                <SelectItem value="Peppers">Peppers</SelectItem>
                <SelectItem value="Cocoa">Cocoa</SelectItem>
                <SelectItem value="Yams">Yams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="tons">tons</SelectItem>
                  <SelectItem value="bags">bags</SelectItem>
                  <SelectItem value="pieces">pieces</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Quality</Label>
            <Select value={formData.quality} onValueChange={(value) => handleInputChange('quality', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="Enter your location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per {formData.unit} *</Label>
            <Input
              id="price"
              type="number"
              placeholder="Enter price"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-crop-green-600 hover:bg-crop-green-700 text-white">
              Post Trade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostTradeForm;