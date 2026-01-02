import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const randomNames = [
  "Amit Sharma",
  "Priya Singh",
  "Rahul Verma",
  "Sneha Gupta",
  "Vikram Malhotra",
  "Rohan Das",
  "Anjali Mehta",
  "Kabir Singh",
  "Zara Khan",
];
const randomMessages = [
  "this is my no. one two three four five six seven eight nine ten.",
  "Can you provide more details about availability for December?",
  "Looking for a premium experience, budget is flexible.",
  "Urgent requirement for next month, please call back.",
  "Is customization available for the menu?",
  "We have a guest list of 500+, can you accommodate?",
  "Do you offer discounts for early booking?",
];

const SeedLeads = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(10); // Default to 10 leads

  const addLog = (msg) => setLogs((prev) => [...prev, msg]);

  const generateLeads = async () => {
    setLoading(true);
    setLogs([]);
    addLog("Starting lead generation...");

    try {
      // 1. Fetch Public Packages (Venue & Service)
      const baseUrl = import.meta.env.VITE_API_URL;

      const [venueRes, serviceRes] = await Promise.all([
        fetch(`${baseUrl}/public/venue-packages`),
        fetch(`${baseUrl}/public/service-packages`),
      ]);

      const venueData = await venueRes.json();
      const serviceData = await serviceRes.json();

      // Safe Access Logic
        const venueList = Array.isArray(venueData?.data) ? venueData.data : (venueData?.data?.packages || []);
        const serviceList = Array.isArray(serviceData?.data) ? serviceData.data : (serviceData?.data?.packages || []);

        addLog(`ℹ️ Found ${venueList.length} Venues and ${serviceList.length} Services.`);

        const allPackages = [
            ...venueList.map(p => ({ ...p, type: 'VenuePackage' })), 
            ...serviceList.map(p => ({ ...p, type: 'ServicePackage' }))
        ];

        if (allPackages.length === 0) {
            addLog("❌ No public packages found. Ensure packages are 'Approved' and 'Public'.");
            setLoading(false);
            return;
        }

        for (let i = 0; i < count; i++) {
            const pkg = allPackages[Math.floor(Math.random() * allPackages.length)];
            const name = randomNames[Math.floor(Math.random() * randomNames.length)];
            
            // ... (rest of the randomization logic)
            const rand = Math.random();
            let guestCount, budget;

            if (rand > 0.8) {
                 guestCount = Math.floor(500 + Math.random() * 500);
                 budget = Math.floor(1000000 + Math.random() * 2000000);
            } else if (rand > 0.5) {
                guestCount = Math.floor(200 + Math.random() * 300);
                budget = Math.floor(300000 + Math.random() * 700000);
            } else {
                guestCount = Math.floor(50 + Math.random() * 150);
                budget = Math.floor(50000 + Math.random() * 200000);
            }

            const payload = {
                name: name,
                email: `user${Date.now()}_${i}@test.com`,
                phone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
                location: { 
                    city: pkg.location?.city?.name || "Indore", 
                    state: "Madhya Pradesh",
                    fullAddress: `Plot No. ${Math.floor(Math.random() * 100)}, Test Locality, ${pkg.location?.city?.name || "Indore"}, Madhya Pradesh`
                },
                eventDate: new Date(Date.now() + 86400000 * (i + 10)).toISOString(),
                guestCount: guestCount,
                budget: budget,
                message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
                interestedInPackage: pkg._id,
                packageType: pkg.type
            };

            const res = await fetch(`${baseUrl}/public/inquiry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            
            const data = await res.json();

            if(res.ok) {
                const typeLabel = pkg.type === 'VenuePackage' ? '🏢 Venue' : '📸 Service';
                addLog(`✅ ${typeLabel} Lead: ${pkg.title.substring(0, 15)}... - Cat: ${data.data.category}`);
            } else {
                addLog(`❌ Failed: ${data.message}`);
            }
            
            await new Promise(r => setTimeout(r, 100));
        }

      setLoading(false);
      toast.success("Leads generation completed!");
    } catch (error) {
      addLog(`❌ Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seed Leads</h1>
        <p className="text-muted-foreground mt-2">
          Generate test inquiries for your existing PUBLIC packages.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Number of Leads:</span>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-20 rounded border px-2 py-1"
            min="1"
            max="50"
          />
        </div>
        <Button onClick={generateLeads} disabled={loading}>
          {loading ? "Generating..." : "Generate Leads"}
        </Button>
      </div>

      <div className="h-96 overflow-y-auto rounded-md border bg-black p-4 font-mono text-sm text-green-400 shadow-inner">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Logs will appear here...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SeedLeads;
