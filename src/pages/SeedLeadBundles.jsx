import React, { useState } from "react";
import { useCreateLeadBundleMutation } from "../store/api/adminApi";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const dummyBundles = [
  {
    name: "Starter Pack",
    credits: 20,
    price: 1500,
    allowedCategories: ["Standard"],
    description: "Great for beginners to start getting leads.",
  },
  {
    name: "Pro Pack",
    credits: 50,
    price: 3500,
    allowedCategories: ["Standard", "Premium"],
    description: "Best value for growing businesses with premium leads.",
  },
  {
    name: "Elite Pack",
    credits: 100,
    price: 6000,
    allowedCategories: ["Standard", "Premium", "Elite"],
    description: "Maximum volume and access to elite leads.",
  }
];

const SeedLeadBundles = () => {
  const [createBundle, { isLoading }] = useCreateLeadBundleMutation();
  const [logs, setLogs] = useState([]);

  const addLog = (msg) => setLogs(prev => [...prev, msg]);

  const handleSeed = async () => {
    setLogs([]);
    addLog("Starting bundle seeding...");

    for (const bundle of dummyBundles) {
      try {
        await createBundle(bundle).unwrap();
        addLog(`✅ Created Bundle: ${bundle.name}`);
      } catch (err) {
        console.error(err);
        addLog(`❌ Failed ${bundle.name}: ${err?.data?.message || err.message}`);
      }
    }

    addLog("Bundle seeding completed.");
    toast.success("Bundles created successfully!");
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Seed Lead Bundles</h1>
      <p className="mb-6 text-muted-foreground">
        This will create 3 standard Lead Bundles (Starter, Pro, Elite).
      </p>
      
      <Button onClick={handleSeed} disabled={isLoading}>
        {isLoading ? "Seeding..." : "Seed Bundles"}
      </Button>

      <div className="mt-6 p-4 bg-muted rounded-md font-mono text-sm h-64 overflow-y-auto">
        {logs.length === 0 ? "Logs will appear here..." : logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
};

export default SeedLeadBundles;
