import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardTitle } from "@/components/ui/card.tsx";

const Error404 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <Card className="max-w-md text-center shadow-lg p-6 bg-white rounded-lg">
        <CardTitle className="text-5xl font-bold text-red-500">404</CardTitle>
        <CardContent>
          <p className="text-lg text-gray-600 mt-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Button
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            onClick={() => navigate("/menu")}>
            Go Back Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Error404;
