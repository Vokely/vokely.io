'use-client'
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { getUserPlanByEmail, upgradeUserPlan } from "@/lib/adminUtil";
import { getAllPlans } from "@/lib/pricingPlans";
import useAPIWrapper from "@/hooks/useAPIWrapper";
import formatBlogDate from "@/lib/dateUtil";
import { DateTimePicker } from "../ui/DatePicker";

export default function UpgradePlans({ addToast }) {
  const { callApi, loading } = useAPIWrapper();
  const [userEmail, setUserEmail] = useState("");
  const [userPlan, setUserPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [expiryDate, setExpiryDate] = useState("");

  // Fetch user plan by email
  const fetchUserPlan = async () => {
    try {
      const res = await callApi(getUserPlanByEmail, userEmail);
      setUserPlan(res);
      addToast("✅ User plan fetched successfully", "success");
    } catch (e) {
      addToast("❌ Failed to fetch user plan", "error");
    }
  };

  // Fetch all plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      const res = await callApi(getAllPlans);
      setAllPlans(res);
    };
    fetchPlans();
  }, []);

  // Handle Upgrade
  const handleUpgrade = async () => {
    try {
      if (!selectedPlan) {
        addToast("⚠️ Please select a plan first", "warning");
        return;
      }

      if (!expiryDate) {
        addToast("⚠️ Please enter expiry date", "warning");
        return;
      }

      const isoDate = new Date(expiryDate).toISOString();

      // Validate future date
      if (new Date(isoDate) <= new Date()) {
        addToast("❌ Expiry date must be a future date", "error");
        return;
      }

      const payload = {
        user_id: userPlan.user_id,
        expiry_date: isoDate,
        plan_details: selectedPlan ,
      };

      const res = await callApi(upgradeUserPlan, payload);
      addToast("🎉 Plan upgraded successfully!", "success");
      setUserPlan(res);
    } catch (e) {
      addToast("❌ Upgrade failed", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      {/* Step 1: Search user */}
      <Card>
        <CardHeader>Fetch User Plan</CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <Input
              label="User Email"
              placeholder="Enter user email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <Button onClick={fetchUserPlan} disabled={!userEmail || loading}>
              {loading ? "Fetching..." : "Fetch Plan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Show Current Plan */}
      {userPlan && (
        <Card>
          <CardHeader>Current Plan Details</CardHeader>
          <CardContent>
            <p>
              <strong>Plan Details</strong>  
                <pre className="whitespace-pre-wrap">
                {JSON.stringify(userPlan.plan_details, null, 2)}
              </pre>
            </p>
            <p>
              <strong>Plan ID:</strong> {userPlan.plan_id}
            </p>
            <p>
              <strong>Active:</strong> {userPlan.is_active ? "Yes ✅" : "No ❌"}
            </p>
            <p>
              <strong>Start Date:</strong>{" "}
              {formatBlogDate(userPlan.start_date)}
            </p>
            <p>
              <strong>Expiry Date:</strong>{" "}
              {userPlan.expiry_date
                ? formatBlogDate(userPlan.expiry_date)
                : "Not set"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Upgrade Plan */}
      {userPlan && (
        <Card>
          <CardHeader>Upgrade User Plan</CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
            {allPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${
                  selectedPlan?.id === plan.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {plan.id === userPlan.plan_id && (
                  <span className="absolute right-2 top-0 rotate-35 text-sm text-green-600 font-semibold">
                    Active
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-gray-600">
                  {plan.description?.slice(0, 80)}...
                </p>
                <p className="mt-2 font-medium">
                  💰 {plan.currency} {plan.price}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <DateTimePicker
              label="Expiry Date"
              value={expiryDate}
              onChange={(isoValue) => setExpiryDate(isoValue)}
              helperText="Select a future date & time. Automatically converted to ISO format."
            />

            <Button
              onClick={handleUpgrade}
              disabled={!selectedPlan || !expiryDate || loading}
              className="w-full md:w-auto"
            >
              {loading ? "Upgrading..." : "Upgrade Plan"}
            </Button>
          </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
