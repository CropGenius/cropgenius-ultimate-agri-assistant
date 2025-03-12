
import { useState } from "react";
import { Users, Send, MapPin, Clock, ThumbsUp, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Mock crowd-sourced reports
const initialReports = [
  {
    id: 1,
    user: "John K.",
    location: "Kiambu, Kenya",
    condition: "Heavy rainfall",
    description: "Unexpected heavy rainfall in my area. Much more than forecast. Roads becoming difficult to navigate.",
    timestamp: "2 hours ago",
    likes: 12,
    comments: 3,
    verified: true
  },
  {
    id: 2,
    user: "Sarah M.",
    location: "Nakuru, Kenya",
    condition: "Localized flooding",
    description: "Flash flooding in low-lying areas. Small streams overflowing. Caution advised for those with farms near water bodies.",
    timestamp: "5 hours ago",
    likes: 24,
    comments: 7,
    verified: true
  },
  {
    id: 3,
    user: "David L.",
    location: "Machakos, Kenya",
    condition: "Wind damage",
    description: "Strong winds have damaged some structures and are affecting young maize plants. Please secure your equipment.",
    timestamp: "Yesterday",
    likes: 9,
    comments: 2,
    verified: false
  }
];

export default function CrowdSourcedReports() {
  const [reports] = useState(initialReports);
  const [newReport, setNewReport] = useState({ condition: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would submit the report to the backend in production
    setNewReport({ condition: "", description: "" });
    setShowForm(false);
    
    // Show success message or update UI
    alert("Thank you for your report! It will be reviewed and added to our system.");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Farmer Weather Reports
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add Report"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-3">Submit Weather Report</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="condition" className="block text-sm font-medium mb-1">
                  Weather Condition
                </label>
                <Input
                  id="condition"
                  placeholder="E.g., Heavy rain, Drought, Strong winds"
                  value={newReport.condition}
                  onChange={(e) => setNewReport({ ...newReport, condition: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe the weather conditions and any impacts on farming..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  required
                  className="min-h-[100px]"
                />
              </div>
              <div className="pt-2">
                <Button type="submit">
                  <Send className="mr-2 h-4 w-4" />
                  Submit Report
                </Button>
              </div>
            </div>
          </form>
        )}
        
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No weather reports from farmers in your area yet.</p>
            <Button onClick={() => setShowForm(true)} className="mt-2">
              Be the first to report
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium">{report.condition}</h3>
                      {report.verified && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{report.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <div className="flex items-center mr-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        {report.location}
                      </div>
                      <div className="flex items-center mr-3">
                        <Clock className="h-3 w-3 mr-1" />
                        {report.timestamp}
                      </div>
                      <div className="flex items-center">
                        Reported by {report.user}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center">
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Helpful ({report.likes})
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-8">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Comment ({report.comments})
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
