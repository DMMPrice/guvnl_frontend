import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, Frown } from "lucide-react"; // ✅ Using Lucide Icons
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const Error404 = () => {
  const navigate = useNavigate();

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-transparent px-4">

        {/* Animated Container */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
        >
          <Card className="text-center bg-white shadow-xl rounded-lg p-4 border border-gray-300">
            <CardHeader>
              {/* 404 Title with Alert Icon */}
              <CardTitle className="text-5xl font-extrabold text-gray-900 flex justify-center items-center gap-2">
                404 <AlertCircle className="text-red-500" size={42} />
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Floating Frown Icon from Lucide */}
              <motion.div
                  initial={{ y: -5 }}
                  animate={{ y: 5 }}
                  transition={{ repeat: Infinity, duration: 1.2, repeatType: "mirror" }}
                  className="flex justify-center mb-6"
              >
                <Frown className="text-gray-700" size={64} />
              </motion.div>

              <p className="text-lg text-gray-700 font-medium">
                Oops! The page you are looking for doesn’t exist.
              </p>

              {/* Button to go back to Menu */}
              <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatType: "mirror" }}
                  className="mt-6"
              >
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-5 rounded-lg text-lg font-semibold shadow-md transition"
                    onClick={() => navigate("/menu")}
                >
                  Go Back to Menu
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
  );
};

export default Error404;
